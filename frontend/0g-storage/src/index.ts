import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Constants from environment variables
const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-standard.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error('Private key not found in environment variables');
}

// Initialize provider, signer and indexer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer = new Indexer(INDEXER_RPC);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Create ZgFile from uploaded file
    const zgFile = await ZgFile.fromFilePath(req.file.path);
    const [tree, treeErr] = await zgFile.merkleTree();
    
    if (treeErr !== null) {
      throw new Error(`Error generating Merkle tree: ${treeErr}`);
    }

    // Upload file with new API syntax
    const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }

    await zgFile.close();

    res.json({
      rootHash: tree?.rootHash() ?? '',
      transactionHash: tx
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/download/:rootHash', async (req, res) => {
  const { rootHash } = req.params;
  
  // Create downloads directory if it doesn't exist
  const downloadsDir = 'downloads';
  
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  // Generate unique filename that doesn't exist
  const timestamp = Date.now();
  const outputPath = path.join(downloadsDir, `${rootHash.substring(0, 8)}_${timestamp}`);

  try {
    const err = await indexer.download(rootHash, outputPath, true);
    
    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }

    res.download(outputPath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to send file' });
      } else {
        // Clean up the temporary file after download
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        }, 1000);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
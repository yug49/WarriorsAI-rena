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
const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai';
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

    const rootHash = tree?.rootHash() ?? '';
    console.log(`📁 File prepared: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`🔑 Root Hash: ${rootHash}`);

    try {
      // First, check if the file already exists by trying to download it
      try {
        const checkErr = await indexer.download(rootHash, '/tmp/check_file', false);
        if (checkErr === null) {
          console.log(`✅ File already exists in 0G storage with root hash: ${rootHash}`);
          await zgFile.close();
          res.json({
            rootHash: rootHash,
            transactionHash: 'existing',
            message: 'File already exists in 0G storage'
          });
          return;
        }
      } catch (checkError) {
        // File doesn't exist, proceed with upload
        console.log(`📤 File doesn't exist yet, proceeding with upload...`);
      }

      // Upload file with new API syntax
      const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

      if (uploadErr !== null) {
        // Check if error is due to data already existing
        if (uploadErr.toString().includes('Data already exists')) {
          console.log(`✅ File already exists in 0G storage with root hash: ${rootHash}`);
          
          // Clean up the temporary file
          await zgFile.close();
          
          // Return success with existing root hash
          res.json({
            rootHash: rootHash,
            transactionHash: 'existing', // Indicate this was already stored
            message: 'File already exists in 0G storage'
          });
          return;
        } else {
          throw new Error(`Upload error: ${uploadErr}`);
        }
      }

      console.log(`✅ File uploaded successfully to 0G storage`);
      console.log(`📝 Transaction Hash: ${tx}`);

      await zgFile.close();

      res.json({
        rootHash: rootHash,
        transactionHash: tx,
        message: 'File uploaded successfully'
      });

    } catch (uploadError) {
      // Handle upload errors gracefully
      if (uploadError instanceof Error) {
        const errorMessage = uploadError.message.toLowerCase();
        
        if (errorMessage.includes('data already exists') || 
            errorMessage.includes('file already exists')) {
          console.log(`✅ File already exists in 0G storage with root hash: ${rootHash}`);
          
          await zgFile.close();
          
          res.json({
            rootHash: rootHash,
            transactionHash: 'existing',
            message: 'File already exists in 0G storage'
          });
          return;
        }
        
        // For transaction execution reverts, check if the data is now available
        if (errorMessage.includes('transaction execution reverted') || 
            errorMessage.includes('failed to submit transaction')) {
          console.log(`⚠️ Transaction failed, but checking if data is now available...`);
          
          // Wait a bit and try to download the file to see if it exists
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const checkErr = await indexer.download(rootHash, '/tmp/check_after_fail', false);
            if (checkErr === null) {
              console.log(`✅ File is now available in 0G storage despite transaction failure: ${rootHash}`);
              await zgFile.close();
              res.json({
                rootHash: rootHash,
                transactionHash: 'eventual_success',
                message: 'File is available in 0G storage (eventual consistency)'
              });
              return;
            }
          } catch (recheckError) {
            console.log(`❌ File still not available after transaction failure`);
          }
        }
      }
      
      // Re-throw other errors
      throw uploadError;
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    // Clean up temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
  console.log(`🚀 0G Storage Server running on port ${PORT}`);
  console.log(`📡 RPC URL: ${RPC_URL}`);
  console.log(`🔍 Indexer RPC: ${INDEXER_RPC}`);
});
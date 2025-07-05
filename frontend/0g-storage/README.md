# 0G Storage TypeScript SDK Starter Kit

This repository demonstrates how to integrate and use the 0G Storage TypeScript SDK in your applications. It provides implementation examples using the 0G decentralized storage network.

## Repository Branches

### 1. Master Branch (Current)
REST API implementation using Express framework.
```bash
git checkout master
```

- Features:
  - RESTful endpoints for upload/download
  - TypeScript implementation for type safety

### 2. CLI Version Branch
Command-line interface implementation will be available in the cli-version branch.
```bash
git checkout cli-version
```

- Features:
  - Direct file upload/download via CLI
  - Command-line arguments for configuration
  - TypeScript implementation

## SDK Implementation (Master Branch)

### Storage Client Setup
```typescript
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize indexer with new syntax
const indexer = new Indexer(INDEXER_RPC);
```

### File Operations

#### Upload Implementation
The upload process involves both API handling and SDK operations:

```typescript
// Create ZgFile from file path
const zgFile = await ZgFile.fromFilePath(filePath);
const [tree, treeErr] = await zgFile.merkleTree();

// Upload file with new API syntax
const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);

// Get file identifier and transaction hash
const rootHash = tree?.rootHash();
const transactionHash = tx;
```

What happens during upload:
- File is received via multipart form upload
- SDK creates a ZgFile instance from the uploaded file
- Merkle tree is generated for the file
- File is uploaded to the 0G Storage network
- Root hash and transaction hash are returned

#### Download Implementation
The download process retrieves files using their root hash:

```typescript
const err = await indexer.download(rootHash, outputPath, true);
```

What happens during download:
- Root hash is used to locate the file in the network
- File is downloaded to a local path
- Downloaded file is verified
- File is streamed to the client

## Usage

1. Clone the repository:
```bash
git clone https://github.com/0glabs/0g-storage-ts-starter-kit
```

2. Navigate to the project directory:
```bash
cd 0g-storage-ts-starter-kit
```

3. Install dependencies:
```bash
npm install
```

4. Copy the .env.example file to .env and set your private key:
```bash
cp .env.example .env
```

5. Start the server:
```bash
npm start
```

6. Available Endpoints:
   - POST /upload - Upload a file
     - Request: multipart/form-data with 'file' field
     - Response: JSON with rootHash and transactionHash
   - GET /download/{rootHash} - Download a file
     - Request: rootHash in URL path
     - Response: File content stream

## Network Configuration
The application uses the following default network configuration which can be overridden through environment variables:

```typescript
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = 'https://indexer-storage-testnet-standard.0g.ai';
```

## Best Practices
1. **Error Handling**:
   - Proper error handling for file operations
   - Validation of uploaded files
   - Comprehensive error messages for debugging

2. **Security**:
   - Environment variables for sensitive data
   - Private key protection
   - Input validation

3. **Resource Management**:
   - Proper file cleanup after operations
   - Closing file handles
   - Memory efficient file processing

## Next Steps
Explore advanced SDK features in the [0G Storage TypeScript SDK documentation](https://github.com/0glabs/0g-ts-sdk). Learn more about the [0G Storage Network](https://docs.0g.ai/0g-storage). 
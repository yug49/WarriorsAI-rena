# 🚀 0G Storage Kit - Complete Usage Guide

This guide shows you all the different ways to upload and download files using the 0G Storage TypeScript Starter Kit.

## 📋 Prerequisites

1. **Start the server** first:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

2. **Ensure you have a valid private key** in your `.env` file
3. **Make sure you have testnet ETH** for transactions

## 📤 Upload Methods

### 1. Web Interface (Easiest)

Open `demo.html` in your browser:
```bash
# Open the demo page
open demo.html  # macOS
# or
start demo.html  # Windows
# or
xdg-open demo.html  # Linux
```

Features:
- ✅ Drag & drop file upload
- ✅ Real-time progress feedback
- ✅ Automatic hash display
- ✅ Recent uploads history
- ✅ One-click download

### 2. Command Line with cURL

```bash
# Upload any file
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/your/file.txt" \
  -H "Content-Type: multipart/form-data"

# Example with a text file
curl -X POST http://localhost:3000/upload \
  -F "file=@./README.md"

# Example with an image
curl -X POST http://localhost:3000/upload \
  -F "file=@./image.jpg"
```

**Response:**
```json
{
  "rootHash": "0x1234567890abcdef...",
  "transactionHash": "0xabcdef1234567890..."
}
```

### 3. Using Postman/Insomnia

1. **Method**: `POST`
2. **URL**: `http://localhost:3000/upload`
3. **Body Type**: `form-data`
4. **Key**: `file` (type: File)
5. **Value**: Select your file

### 4. JavaScript/Browser

```javascript
// Upload file from file input
async function uploadFile(fileInput) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    return result;
}

// Usage
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const result = await uploadFile(e.target);
    console.log('Root Hash:', result.rootHash);
});
```

### 5. Node.js Programmatic

```javascript
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function uploadFile(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: form
    });
    
    return await response.json();
}

// Usage
uploadFile('./myfile.txt').then(result => {
    console.log('Uploaded:', result.rootHash);
});
```

## 📥 Download Methods

### 1. Web Interface

Use the `demo.html` page:
1. Enter the root hash in the download section
2. Click "Download from 0G Storage"
3. File will be automatically downloaded

### 2. Direct Browser Access

Simply open in your browser:
```
http://localhost:3000/download/YOUR_ROOT_HASH
```

### 3. Command Line with cURL

```bash
# Download file
curl -X GET http://localhost:3000/download/YOUR_ROOT_HASH \
  --output downloaded_file.ext

# Example
curl -X GET http://localhost:3000/download/0x1234567890abcdef \
  --output my_downloaded_file.txt
```

### 4. JavaScript/Browser

```javascript
async function downloadFile(rootHash, filename) {
    const response = await fetch(`http://localhost:3000/download/${rootHash}`);
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Usage
downloadFile('0x1234567890abcdef', 'myfile.txt');
```

### 5. Node.js Programmatic

```javascript
const fs = require('fs');
const fetch = require('node-fetch');

async function downloadFile(rootHash, outputPath) {
    const response = await fetch(`http://localhost:3000/download/${rootHash}`);
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
    console.log('File saved to:', outputPath);
}

// Usage
downloadFile('0x1234567890abcdef', './downloaded_file.txt');
```

## 🔄 Complete Workflow Example

Here's a complete example showing upload → download → verify:

```bash
# 1. Start the server
npm start

# 2. Upload a file (in another terminal)
curl -X POST http://localhost:3000/upload -F "file=@./README.md"

# Response will give you a rootHash like: 0x1234567890abcdef...

# 3. Download the file using the rootHash
curl -X GET http://localhost:3000/download/0x1234567890abcdef \
  --output downloaded_readme.md

# 4. Verify files are identical
diff README.md downloaded_readme.md
```

## 🛠️ Advanced Usage

### Batch Upload (Node.js)

```javascript
const fs = require('fs');
const path = require('path');

async function batchUpload(directory) {
    const files = fs.readdirSync(directory);
    const results = [];
    
    for (const file of files) {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile()) {
            try {
                const result = await uploadFile(filePath);
                results.push({ file, ...result });
                console.log(`✅ Uploaded: ${file}`);
            } catch (error) {
                console.error(`❌ Failed to upload ${file}:`, error.message);
            }
        }
    }
    
    return results;
}

// Upload all files in a directory
batchUpload('./documents').then(results => {
    console.log('Batch upload complete:', results);
});
```

### File Integrity Verification

```javascript
const crypto = require('crypto');

async function verifyFile(originalPath, downloadedPath) {
    const original = fs.readFileSync(originalPath);
    const downloaded = fs.readFileSync(downloadedPath);
    
    const originalHash = crypto.createHash('sha256').update(original).digest('hex');
    const downloadedHash = crypto.createHash('sha256').update(downloaded).digest('hex');
    
    return originalHash === downloadedHash;
}

// Usage
const isValid = await verifyFile('./original.txt', './downloaded.txt');
console.log('File integrity:', isValid ? '✅ Valid' : '❌ Invalid');
```

## 📊 Supported File Types

The 0G Storage Kit supports **all file types**:
- ✅ Text files (.txt, .md, .json, .csv)
- ✅ Images (.jpg, .png, .gif, .svg)
- ✅ Videos (.mp4, .avi, .mov)
- ✅ Audio (.mp3, .wav, .flac)
- ✅ Documents (.pdf, .doc, .xls)
- ✅ Archives (.zip, .tar, .gz)
- ✅ Code files (.js, .ts, .py, .java)
- ✅ Binary files (.exe, .bin)

## 🚨 Error Handling

### Common Errors and Solutions

1. **"No file uploaded"**
   - Ensure you're using the correct form field name: `file`
   - Check that the file exists and is readable

2. **"Private key not found"**
   - Add your private key to the `.env` file
   - Ensure the `.env` file is in the project root

3. **"Upload error: insufficient funds"**
   - Add testnet ETH to your wallet
   - Visit the 0G faucet: https://faucet.0g.ai

4. **"Download error: file not found"**
   - Verify the root hash is correct
   - Ensure the file was successfully uploaded

### Error Handling in Code

```javascript
async function safeUpload(filePath) {
    try {
        const result = await uploadFile(filePath);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Usage
const result = await safeUpload('./myfile.txt');
if (result.success) {
    console.log('Upload successful:', result.data.rootHash);
} else {
    console.error('Upload failed:', result.error);
}
```

## 🎯 Best Practices

1. **Always verify file integrity** after download
2. **Store root hashes safely** - they're your file identifiers
3. **Handle errors gracefully** in production code
4. **Use meaningful filenames** for better organization
5. **Monitor your wallet balance** for transaction fees
6. **Test with small files first** before uploading large files

## 🔗 Quick Reference

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| Upload | POST | `/upload` | `multipart/form-data` with `file` field |
| Download | GET | `/download/:rootHash` | None |

**Important Notes:**
- Root hash is your file identifier - save it!
- Transaction hash is the blockchain record
- Files are stored on the decentralized 0G network
- You need testnet ETH for upload transactions

## 🎉 Ready to Use!

You now have all the tools to upload and download files using the 0G Storage network. Start with the web interface (`demo.html`) for the easiest experience, then explore the programmatic options for integration into your applications. 
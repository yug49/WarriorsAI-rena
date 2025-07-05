// Example usage of 0G Storage API with Node.js
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_BASE = 'http://localhost:3000';

// Upload function
async function uploadFile(filePath) {
    console.log(`📤 Uploading file: ${filePath}`);
    
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        // Upload file
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: form
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Upload successful!');
            console.log('📁 File:', path.basename(filePath));
            console.log('🔗 Root Hash:', result.rootHash);
            console.log('📝 Transaction Hash:', result.transactionHash);
            return result;
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        throw error;
    }
}

// Download function
async function downloadFile(rootHash, outputPath) {
    console.log(`📥 Downloading file with root hash: ${rootHash}`);
    
    try {
        const response = await fetch(`${API_BASE}/download/${rootHash}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Download failed');
        }
        
        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save file
        const buffer = await response.buffer();
        fs.writeFileSync(outputPath, buffer);
        
        console.log('✅ Download successful!');
        console.log('📁 File saved to:', outputPath);
        console.log('📊 File size:', (buffer.length / 1024).toFixed(2), 'KB');
        
        return outputPath;
    } catch (error) {
        console.error('❌ Download failed:', error.message);
        throw error;
    }
}

// Example usage
async function main() {
    console.log('🚀 0G Storage API Example\n');
    
    try {
        // Example 1: Upload a file
        console.log('=== UPLOAD EXAMPLE ===');
        const uploadResult = await uploadFile('./package.json');
        console.log('');
        
        // Example 2: Download the uploaded file
        console.log('=== DOWNLOAD EXAMPLE ===');
        const downloadPath = './downloads/downloaded_package.json';
        await downloadFile(uploadResult.rootHash, downloadPath);
        console.log('');
        
        // Example 3: Verify the downloaded file
        console.log('=== VERIFICATION ===');
        const originalContent = fs.readFileSync('./package.json', 'utf8');
        const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
        
        if (originalContent === downloadedContent) {
            console.log('✅ File integrity verified - contents match!');
        } else {
            console.log('❌ File integrity check failed - contents differ!');
        }
        
    } catch (error) {
        console.error('❌ Example failed:', error.message);
        process.exit(1);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    main();
}

// Export functions for use in other modules
module.exports = {
    uploadFile,
    downloadFile
}; 
const fs = require('fs');
const path = require('path');
const config = require('../config');
const dbManager = require('../db/database');

/**
 * Recursively scan a directory for files
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to include (e.g., ['.jpg', '.pdf'])
 * @returns {string[]} - Array of absolute file paths
 */
function scanDirectory(dir, extensions) {
    let files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Recursively scan subdirectories
            files = files.concat(scanDirectory(fullPath, extensions));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (extensions.includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

/**
 * Find new files that haven't been indexed yet
 * @returns {Object} - { images: string[], pdfs: string[] }
 */
async function findNewFiles() {
    console.log(`Scanning resources folder: ${config.resourcesPath}`);

    // Get all supported files
    const allExtensions = [
        ...config.supportedImageExtensions,
        config.supportedPdfExtension
    ];

    const allFiles = scanDirectory(config.resourcesPath, allExtensions);
    console.log(`Found ${allFiles.length} total files`);

    // Get already indexed files from database
    const indexedPaths = dbManager.getAllFilePaths();
    const indexedSet = new Set(indexedPaths);
    console.log(`Already indexed: ${indexedPaths.length} files`);

    // Filter to only new files
    const newFiles = allFiles.filter(file => !indexedSet.has(file));

    // Separate into images and PDFs
    const images = newFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return config.supportedImageExtensions.includes(ext);
    });

    const pdfs = newFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === config.supportedPdfExtension;
    });

    console.log(`New files to process: ${newFiles.length} (${images.length} images, ${pdfs.length} PDFs)`);

    return { images, pdfs };
}

module.exports = {
    scanDirectory,
    findNewFiles
};

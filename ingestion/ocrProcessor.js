const Tesseract = require('tesseract.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { detectLanguage } = require('../utils/languageDetection');
const embeddingGenerator = require('../utils/embeddings');

/**
 * Extract text from an image using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
async function performOCR(imagePath) {
    console.log(`Performing OCR on: ${path.basename(imagePath)}`);

    const { data: { text } } = await Tesseract.recognize(
        imagePath,
        config.tesseractLanguages,
        {
            logger: info => {
                if (info.status === 'recognizing text') {
                    // Optional: Show progress
                    // console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
                }
            }
        }
    );

    return text.trim();
}

/**
 * Extract timestamp from image metadata or filename
 * @param {string} imagePath - Path to the image
 * @returns {string|null} - ISO timestamp or null
 */
function extractTimestamp(imagePath) {
    // Try to parse from filename (common formats)
    const filename = path.basename(imagePath, path.extname(imagePath));

    // Common patterns: IMG_20250125_073000, 2025-01-25_07-30-00, etc.
    const patterns = [
        /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // YYYYMMDD_HHMMSS
        /(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/, // YYYY-MM-DD_HH-MM-SS
        /(\d{4})-(\d{2})-(\d{2})[T_](\d{2}):(\d{2}):(\d{2})/ // YYYY-MM-DDTHH:MM:SS
    ];

    for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match) {
            const [, year, month, day, hour, minute, second] = match;
            return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
        }
    }

    // If no pattern matches, use file modification time
    try {
        const stats = fs.statSync(imagePath);
        return stats.mtime.toISOString();
    } catch (error) {
        return null;
    }
}

/**
 * Process a single image file
 * @param {string} imagePath - Path to the image
 * @returns {Promise<Object>} - { resource, chunk, embedding }
 */
async function processImage(imagePath) {
    const fileName = path.basename(imagePath);
    console.log(`Processing image: ${fileName}`);

    // Perform OCR
    const ocrText = await performOCR(imagePath);

    if (!ocrText || ocrText.length === 0) {
        console.warn(`No text extracted from ${fileName}, skipping`);
        return null;
    }

    // Detect language
    const language = detectLanguage(ocrText);

    // Extract timestamp
    const recordedAt = extractTimestamp(imagePath);

    // Create resource
    const resourceId = uuidv4();
    const resource = {
        id: resourceId,
        type: 'image',
        subtype: null,
        fileName: fileName,
        filePath: imagePath,
        recordedAt: recordedAt,
        createdAt: new Date().toISOString(),
        title: fileName
    };

    // Create chunk (one chunk per image)
    const chunkId = uuidv4();
    const chunk = {
        id: chunkId,
        resourceId: resourceId,
        text: ocrText,
        language: language,
        page: null,
        paragraph: null,
        timestamp: null
    };

    // Generate embedding
    const embedding = await embeddingGenerator.generateEmbedding(ocrText);

    console.log(`✓ Processed ${fileName} - Language: ${language}, Text length: ${ocrText.length}`);

    return { resource, chunk, embedding };
}

/**
 * Process multiple images
 * @param {string[]} imagePaths - Array of image paths
 * @returns {Promise<Array>} - Array of { resource, chunk, embedding } objects
 */
async function processImages(imagePaths) {
    const results = [];

    for (const imagePath of imagePaths) {
        try {
            const result = await processImage(imagePath);
            if (result) {
                results.push(result);
            }
        } catch (error) {
            console.error(`Error processing ${imagePath}:`, error.message);
        }
    }

    return results;
}

module.exports = {
    performOCR,
    processImage,
    processImages
};

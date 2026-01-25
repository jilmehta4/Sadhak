const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { detectLanguage } = require('../utils/languageDetection');
const embeddingGenerator = require('../utils/embeddings');

/**
 * Extract text from PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} - { text: string, numPages: number }
 */
async function extractPdfText(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    return {
        text: data.text,
        numPages: data.numpages
    };
}

/**
 * Detect if PDF is a transcript based on timestamp patterns
 * @param {string} text - PDF text content
 * @returns {boolean}
 */
function isTranscript(text) {
    // Check for timestamp patterns (HH:MM:SS or MM:SS)
    const timestampPattern = /\b\d{1,2}:\d{2}(?::\d{2})?\b/g;
    const matches = text.match(timestampPattern);

    // If we find at least 5 timestamps, consider it a transcript
    return matches && matches.length >= 5;
}

/**
 * Split text into paragraphs
 * @param {string} text - Text to split
 * @returns {string[]} - Array of paragraphs
 */
function splitIntoParagraphs(text) {
    // Split by double newlines or multiple whitespace
    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return paragraphs;
}

/**
 * Parse transcript text into timestamped chunks
 * @param {string} text - Transcript text
 * @returns {Array<{timestamp: string, text: string}>}
 */
function parseTranscript(text) {
    const chunks = [];
    const lines = text.split('\n');

    let currentTimestamp = null;
    let currentText = [];

    // Regex to detect timestamps at the beginning of a line
    const timestampPattern = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*/;

    for (const line of lines) {
        const match = line.match(timestampPattern);

        if (match) {
            // Save previous chunk if exists
            if (currentTimestamp && currentText.length > 0) {
                chunks.push({
                    timestamp: currentTimestamp,
                    text: currentText.join(' ').trim()
                });
            }

            // Start new chunk
            currentTimestamp = match[1];
            currentText = [line.replace(timestampPattern, '').trim()];
        } else if (currentTimestamp) {
            // Continue current chunk
            currentText.push(line.trim());
        }
    }

    // Add last chunk
    if (currentTimestamp && currentText.length > 0) {
        chunks.push({
            timestamp: currentTimestamp,
            text: currentText.join(' ').trim()
        });
    }

    return chunks.filter(chunk => chunk.text.length > 0);
}

/**
 * Process a book PDF
 * @param {string} pdfPath - Path to PDF file
 * @param {string} fullText - Full PDF text
 * @returns {Promise<Object>} - { resource, chunks: [], embeddings: [] }
 */
async function processBookPdf(pdfPath, fullText) {
    const fileName = path.basename(pdfPath);
    console.log(`Processing book PDF: ${fileName}`);

    // Create resource
    const resourceId = uuidv4();
    const resource = {
        id: resourceId,
        type: 'pdf',
        subtype: 'book',
        fileName: fileName,
        filePath: pdfPath,
        recordedAt: null,
        createdAt: new Date().toISOString(),
        title: fileName.replace('.pdf', '')
    };

    // Split into paragraphs
    const paragraphs = splitIntoParagraphs(fullText);
    console.log(`Found ${paragraphs.length} paragraphs`);

    const chunks = [];
    const embeddings = [];

    // Create chunks for each paragraph
    // Note: We're creating one chunk per paragraph across all pages
    // For simplicity, we won't track exact page numbers (would require more complex PDF parsing)
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraphText = paragraphs[i];

        if (paragraphText.length < 10) {
            // Skip very short paragraphs
            continue;
        }

        const language = detectLanguage(paragraphText);
        const chunkId = uuidv4();

        chunks.push({
            id: chunkId,
            resourceId: resourceId,
            text: paragraphText,
            language: language,
            page: null, // Would need more advanced PDF parsing to determine exact page
            paragraph: i + 1,
            timestamp: null
        });

        // Generate embedding
        const embedding = await embeddingGenerator.generateEmbedding(paragraphText);
        embeddings.push({ chunkId, embedding });
    }

    console.log(`✓ Processed book PDF ${fileName} - ${chunks.length} chunks created`);

    return { resource, chunks, embeddings };
}

/**
 * Process a transcript PDF
 * @param {string} pdfPath - Path to PDF file
 * @param {string} fullText - Full PDF text
 * @returns {Promise<Object>} - { resource, chunks: [], embeddings: [] }
 */
async function processTranscriptPdf(pdfPath, fullText) {
    const fileName = path.basename(pdfPath);
    console.log(`Processing transcript PDF: ${fileName}`);

    // Create resource
    const resourceId = uuidv4();
    const resource = {
        id: resourceId,
        type: 'pdf',
        subtype: 'transcript',
        fileName: fileName,
        filePath: pdfPath,
        recordedAt: null,
        createdAt: new Date().toISOString(),
        title: fileName.replace('.pdf', '')
    };

    // Parse transcript into timestamped chunks
    const transcriptChunks = parseTranscript(fullText);
    console.log(`Found ${transcriptChunks.length} timestamped segments`);

    const chunks = [];
    const embeddings = [];

    for (const { timestamp, text } of transcriptChunks) {
        if (text.length < 5) {
            continue;
        }

        const language = detectLanguage(text);
        const chunkId = uuidv4();

        chunks.push({
            id: chunkId,
            resourceId: resourceId,
            text: text,
            language: language,
            page: null,
            paragraph: null,
            timestamp: timestamp
        });

        // Generate embedding
        const embedding = await embeddingGenerator.generateEmbedding(text);
        embeddings.push({ chunkId, embedding });
    }

    console.log(`✓ Processed transcript PDF ${fileName} - ${chunks.length} chunks created`);

    return { resource, chunks, embeddings };
}

/**
 * Process a single PDF file
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} - { resource, chunks: [], embeddings: [] }
 */
async function processPdf(pdfPath) {
    console.log(`\nProcessing PDF: ${path.basename(pdfPath)}`);

    // Extract text
    const { text } = await extractPdfText(pdfPath);

    if (!text || text.trim().length === 0) {
        console.warn(`No text extracted from ${path.basename(pdfPath)}, skipping`);
        return null;
    }

    // Determine if it's a book or transcript
    const isTranscriptPdf = isTranscript(text);

    if (isTranscriptPdf) {
        return await processTranscriptPdf(pdfPath, text);
    } else {
        return await processBookPdf(pdfPath, text);
    }
}

/**
 * Process multiple PDFs
 * @param {string[]} pdfPaths - Array of PDF paths
 * @returns {Promise<Array>} - Array of { resource, chunks: [], embeddings: [] }
 */
async function processPdfs(pdfPaths) {
    const results = [];

    for (const pdfPath of pdfPaths) {
        try {
            const result = await processPdf(pdfPath);
            if (result) {
                results.push(result);
            }
        } catch (error) {
            console.error(`Error processing ${pdfPath}:`, error.message);
        }
    }

    return results;
}

module.exports = {
    extractPdfText,
    isTranscript,
    processPdf,
    processPdfs
};

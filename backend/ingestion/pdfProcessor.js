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
 * Clean raw PDF text — strip artifacts, normalize whitespace
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
    return text
        .replace(/\r\n/g, '\n')                     // normalize line endings
        .replace(/[ \t]+/g, ' ')                     // collapse horizontal whitespace
        .replace(/\n{3,}/g, '\n\n')                  // collapse triple+ newlines to double
        .replace(/^\s+|\s+$/gm, '')                  // trim each line
        .replace(/^[\d]+\s*$/gm, '')                 // remove lone page-number lines
        .trim();
}

/**
 * Split text into overlapping chunks respecting min/max size
 * @param {string} text - cleaned full text
 * @returns {string[]} - array of chunks
 */
function splitIntoChunks(text) {
    const { minChunkLength, maxChunkLength, chunkOverlap } = require('../config');

    // First split by paragraph boundaries
    const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length >= minChunkLength);

    const chunks = [];
    let buffer = '';

    for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];

        // If a single paragraph exceeds maxChunkLength, split it by sentences
        if (para.length > maxChunkLength) {
            // Flush buffer first
            if (buffer.length >= minChunkLength) {
                chunks.push(buffer.trim());
                // Carry overlap forward
                buffer = buffer.slice(-chunkOverlap);
            } else {
                buffer = '';
            }

            // Split the big paragraph by sentence endings
            const sentences = para.match(/[^.!?।\n]+[.!?।\n]*/g) || [para];
            let sentBuffer = '';
            for (const sentence of sentences) {
                if ((sentBuffer + ' ' + sentence).trim().length > maxChunkLength && sentBuffer.length >= minChunkLength) {
                    chunks.push(sentBuffer.trim());
                    // Overlap: carry last portion into next chunk
                    sentBuffer = sentBuffer.slice(-chunkOverlap) + ' ' + sentence;
                } else {
                    sentBuffer = sentBuffer ? sentBuffer + ' ' + sentence : sentence;
                }
            }
            if (sentBuffer.trim().length >= minChunkLength) {
                buffer = sentBuffer.trim();
            }
            continue;
        }

        // Try to combine small paragraphs into one chunk
        const candidate = buffer ? buffer + '\n\n' + para : para;

        if (candidate.length > maxChunkLength && buffer.length >= minChunkLength) {
            // Flush buffer, start new with overlap + current para
            chunks.push(buffer.trim());
            buffer = buffer.slice(-chunkOverlap) + '\n\n' + para;
        } else {
            buffer = candidate;
        }
    }

    // Flush remaining buffer
    if (buffer.trim().length >= minChunkLength) {
        chunks.push(buffer.trim());
    }

    return chunks;
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

    // Clean text then split into overlapping, size-bounded chunks
    const cleaned = cleanText(fullText);
    const chunkTexts = splitIntoChunks(cleaned);
    console.log(`Found ${chunkTexts.length} chunks (after cleaning + overlap splitting)`);

    const chunks = [];
    const embeddings = [];

    for (let i = 0; i < chunkTexts.length; i++) {
        const chunkText = chunkTexts[i];
        const language = detectLanguage(chunkText);
        const chunkId = uuidv4();

        chunks.push({
            id: chunkId,
            resourceId: resourceId,
            text: chunkText,
            language: language,
            page: null,
            paragraph: i + 1,
            timestamp: null
        });

        // Generate embedding
        const embedding = await embeddingGenerator.generateEmbedding(chunkText);
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

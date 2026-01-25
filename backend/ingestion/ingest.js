const dbManager = require('../db/database');
const vectorStore = require('../db/vectorStore');
const { findNewFiles } = require('./scanner');
const { processImages } = require('./ocrProcessor');
const { processPdfs } = require('./pdfProcessor');

/**
 * Main ingestion function
 * Scans for new files, processes them, and stores in database
 */
async function runIngestion() {
    console.log('========================================');
    console.log('Starting Ingestion Pipeline');
    console.log('========================================\n');

    try {
        // Initialize database
        console.log('Initializing database...');
        await dbManager.initialize();

        // Initialize vector store
        console.log('Initializing vector store...');
        await vectorStore.initialize();

        // Find new files
        console.log('\n--- Scanning for new files ---');
        const { images, pdfs } = await findNewFiles();

        if (images.length === 0 && pdfs.length === 0) {
            console.log('\n✓ No new files to process');
            return {
                success: true,
                filesProcessed: 0,
                chunksCreated: 0
            };
        }

        let totalChunks = 0;
        let totalFiles = 0;

        // Process images
        if (images.length > 0) {
            console.log('\n--- Processing Images ---');
            const imageResults = await processImages(images);

            // Save to database using transaction
            dbManager.transaction(() => {
                for (const { resource, chunk, embedding } of imageResults) {
                    dbManager.insertResource(resource);
                    dbManager.insertChunk(chunk);
                    vectorStore.addVector(chunk.id, embedding);
                    totalChunks++;
                }
            });

            totalFiles += imageResults.length;
            console.log(`✓ Processed ${imageResults.length} images`);
        }

        // Process PDFs
        if (pdfs.length > 0) {
            console.log('\n--- Processing PDFs ---');
            const pdfResults = await processPdfs(pdfs);

            // Save to database using transaction
            for (const { resource, chunks, embeddings } of pdfResults) {
                dbManager.transaction(() => {
                    dbManager.insertResource(resource);

                    for (const chunk of chunks) {
                        dbManager.insertChunk(chunk);
                    }

                    for (const { chunkId, embedding } of embeddings) {
                        vectorStore.addVector(chunkId, embedding);
                    }

                    totalChunks += chunks.length;
                });
            }

            totalFiles += pdfResults.length;
            console.log(`✓ Processed ${pdfResults.length} PDFs`);
        }

        // Save vector store to disk
        console.log('\n--- Saving vector store ---');
        await vectorStore.save();

        console.log('\n========================================');
        console.log('Ingestion Complete!');
        console.log(`Files processed: ${totalFiles}`);
        console.log(`Chunks created: ${totalChunks}`);
        console.log(`Total vectors in store: ${vectorStore.size()}`);
        console.log('========================================\n');

        return {
            success: true,
            filesProcessed: totalFiles,
            chunksCreated: totalChunks
        };

    } catch (error) {
        console.error('\n❌ Ingestion failed:', error.message);
        console.error(error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    runIngestion
};

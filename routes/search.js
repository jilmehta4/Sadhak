const express = require('express');
const dbManager = require('../db/database');
const vectorStore = require('../db/vectorStore');
const embeddingGenerator = require('../utils/embeddings');
const config = require('../config');

const router = express.Router();

/**
 * Format a chunk result based on resource type
 * @param {Object} chunkData - Chunk data with resource info
 * @returns {Object} - Formatted result
 */
function formatResult(chunkData) {
    const base = {
        chunkId: chunkData.id,
        resourceId: chunkData.resourceId,
        resourceType: chunkData.resourceType,
        resourceName: chunkData.resourceFileName,
        language: chunkData.language
    };

    // Image result
    if (chunkData.resourceType === 'image') {
        return {
            ...base,
            recordedAt: chunkData.resourceRecordedAt,
            text: chunkData.text,
            previewUrl: `/resource/image/${chunkData.resourceId}`
        };
    }

    // PDF result
    if (chunkData.resourceType === 'pdf') {
        base.subtype = chunkData.resourceSubtype;

        // Book PDF
        if (chunkData.resourceSubtype === 'book') {
            return {
                ...base,
                page: chunkData.page,
                paragraph: chunkData.paragraph,
                text: chunkData.text
            };
        }

        // Transcript PDF
        if (chunkData.resourceSubtype === 'transcript') {
            return {
                ...base,
                timestamp: chunkData.timestamp,
                text: chunkData.text
            };
        }
    }

    return base;
}

/**
 * POST / (mounted at /search, so actual endpoint is POST /search)
 * Search for resources by query
 * 
 * Body:
 * {
 *   "query": "search text in English or Hindi",
 *   "maxResults": 10,
 *   "uiLanguage": "en" or "hi"
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { query, maxResults = config.defaultMaxResults, uiLanguage = 'en', resourceLanguage = 'en' } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Query parameter is required'
            });
        }

        console.log(`Search query: "${query}" (UI language: ${uiLanguage})`);

        // Generate embedding for query
        const queryEmbedding = await embeddingGenerator.generateEmbedding(query);

        // Search vector store
        const searchResults = vectorStore.search(queryEmbedding, maxResults);

        if (searchResults.length === 0) {
            return res.json({
                results: [],
                message: uiLanguage === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'
            });
        }

        // Get chunk IDs
        const chunkIds = searchResults.map(r => r.chunkId);

        // Retrieve chunks with resource data - FILTERED BY LANGUAGE
        const chunks = dbManager.getChunksWithResourcesByLanguage(chunkIds, resourceLanguage);

        // Create a map for quick lookup
        const chunkMap = new Map(chunks.map(c => [c.id, c]));

        // Format results maintaining order and including scores
        const results = searchResults
            .map(({ chunkId, score }) => {
                const chunkData = chunkMap.get(chunkId);
                if (!chunkData) return null;

                return {
                    ...formatResult(chunkData),
                    score: score // Include relevance score
                };
            })
            .filter(r => r !== null);

        console.log(`Found ${results.length} results`);

        res.json({
            results: results,
            query: query,
            count: results.length
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;

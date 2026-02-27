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
 * Body:
 * {
 *   "query": "search text",
 *   "maxResults": 10,
 *   "uiLanguage": "en" | "hi",
 *   "resourceLanguage": "en" | "hi",
 *   "searchMode": "semantic" | "keyword"   <-- NEW
 * }
 */
router.post('/', async (req, res) => {
    try {
        const {
            query,
            maxResults = config.defaultMaxResults,
            uiLanguage = 'en',
            resourceLanguage = 'en',
            searchMode = 'semantic'          // default: semantic
        } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        console.log(`Search query: "${query}" | mode: ${searchMode} | lang: ${resourceLanguage}`);

        // ─── KEYWORD MODE ──────────────────────────────────────────────────────
        if (searchMode === 'keyword') {
            const chunks = dbManager.searchByKeyword(query, resourceLanguage, maxResults);

            if (chunks.length === 0) {
                return res.json({
                    results: [],
                    query,
                    count: 0,
                    searchMode: 'keyword',
                    message: uiLanguage === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'
                });
            }

            const results = chunks.map(chunkData => ({
                ...formatResult(chunkData),
                score: chunkData.keywordHits,   // number of matched words (not 0-1)
                searchMode: 'keyword'
            }));

            console.log(`Keyword search: ${results.length} results`);
            return res.json({ results, query, count: results.length, searchMode: 'keyword' });
        }

        // ─── SEMANTIC MODE (default) ────────────────────────────────────────────
        const queryEmbedding = await embeddingGenerator.generateEmbedding(query);

        const searchLimit = maxResults * config.searchOverfetchMultiplier;
        const searchResults = vectorStore.search(queryEmbedding, searchLimit);

        if (searchResults.length === 0) {
            return res.json({
                results: [],
                query,
                count: 0,
                searchMode: 'semantic',
                message: uiLanguage === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'
            });
        }

        const chunkIds = searchResults.map(r => r.chunkId);
        const scoreMap = new Map(searchResults.map(r => [r.chunkId, r.score]));

        let chunks = dbManager.getChunksWithResourcesByLanguage(chunkIds, resourceLanguage);
        let usedFallback = false;
        if (chunks.length === 0) {
            console.log(`Language "${resourceLanguage}" returned nothing — falling back to all languages`);
            chunks = dbManager.getChunksWithResources(chunkIds);
            usedFallback = true;
        }

        const chunkMap = new Map(chunks.map(c => [c.id, c]));
        const results = searchResults
            .map(({ chunkId }) => {
                const chunkData = chunkMap.get(chunkId);
                if (!chunkData) return null;
                return { ...formatResult(chunkData), score: scoreMap.get(chunkId), searchMode: 'semantic' };
            })
            .filter(r => r !== null)
            .slice(0, maxResults);

        console.log(`Semantic search: ${results.length} results${usedFallback ? ' [lang fallback]' : ''}`);

        res.json({
            results,
            query,
            count: results.length,
            searchMode: 'semantic',
            ...(usedFallback && { warning: 'Language filter returned no results; showing cross-language matches' })
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;

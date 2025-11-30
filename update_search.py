#!/usr/bin/env python3
"""
Script to update search.js to enable cross-language semantic search
"""

import re
from pathlib import Path

def update_search_js():
    search_path = Path(__file__).parent / 'routes' / 'search.js'
    
    with open(search_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the search logic section
    old_pattern = r"console\.log\(`Search query: \"\$\{query\}\" \(UI language: \$\{uiLanguage\}\)`\);.*?res\.json\(\{[\s\S]*?results: results,[\s\S]*?query: query,[\s\S]*?count: results\.length[\s\S]*?\}\);"
    
    new_code = '''console.log(`Search query: "${query}" (UI language: ${uiLanguage}, Resource language: ${resourceLanguage})`);

        // Generate embedding for query
        const queryEmbedding = await embeddingGenerator.generateEmbedding(query);

        // Search vector store with MORE results to allow for language filtering
        // Multiply by 3 to ensure we have enough results after filtering
        const searchLimit = maxResults * 3;
        const searchResults = vectorStore.search(queryEmbedding, searchLimit);

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
        // Filter to only include chunks that match the selected language
        const results = searchResults
            .map(({ chunkId, score }) => {
                const chunkData = chunkMap.get(chunkId);
                if (!chunkData) return null; // Filtered out by language

                return {
                    ...formatResult(chunkData),
                    score: score // Include relevance score
                };
            })
            .filter(r => r !== null)
            .slice(0, maxResults); // Limit to requested number of results

        console.log(`Found ${results.length} results (from ${searchResults.length} semantic matches, filtered by language: ${resourceLanguage})`);

        res.json({
            results: results,
            query: query,
            count: results.length
        });'''
    
    content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)
    
    # Write back
    with open(search_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ search.js updated successfully!")
    print("  - Modified to search more results (maxResults * 3)")
    print("  - Filters by language AFTER semantic search")
    print("  - Enables cross-language query matching")

if __name__ == '__main__':
    update_search_js()

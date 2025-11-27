const fs = require('fs');
const path = require('path');
const config = require('../config');
const embeddingGenerator = require('../utils/embeddings');

class VectorStore {
    constructor() {
        this.vectors = new Map(); // chunkId -> vector
        this.storePath = config.vectorStorePath;
        this.dimension = config.embeddingDimension;
    }

    /**
     * Initialize the vector store
     */
    async initialize() {
        // Ensure storage directory exists
        const storeDir = path.dirname(this.storePath);
        if (!fs.existsSync(storeDir)) {
            fs.mkdirSync(storeDir, { recursive: true });
        }

        // Load existing vectors if available
        await this.load();
        console.log(`Vector store initialized with ${this.vectors.size} vectors`);
    }

    /**
     * Add a vector to the store
     * @param {string} chunkId - Unique identifier for the chunk
     * @param {number[]} vector - The embedding vector
     */
    addVector(chunkId, vector) {
        if (!vector || vector.length !== this.dimension) {
            throw new Error(`Vector must have ${this.dimension} dimensions`);
        }
        this.vectors.set(chunkId, vector);
    }

    /**
     * Add multiple vectors in batch
     * @param {Object[]} items - Array of {chunkId, vector} objects
     */
    addVectors(items) {
        items.forEach(({ chunkId, vector }) => {
            this.addVector(chunkId, vector);
        });
    }

    /**
     * Search for similar vectors
     * @param {number[]} queryVector - The query embedding
     * @param {number} k - Number of results to return
     * @returns {Array} - Array of {chunkId, score} sorted by similarity
     */
    search(queryVector, k = 10) {
        if (!queryVector || queryVector.length !== this.dimension) {
            throw new Error(`Query vector must have ${this.dimension} dimensions`);
        }

        const results = [];

        // Calculate similarity for each vector
        for (const [chunkId, vector] of this.vectors) {
            const similarity = embeddingGenerator.cosineSimilarity(queryVector, vector);
            results.push({ chunkId, score: similarity });
        }

        // Sort by similarity (descending) and return top k
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, k);
    }

    /**
     * Get a vector by chunk ID
     * @param {string} chunkId - The chunk ID
     * @returns {number[]|null} - The vector or null if not found
     */
    getVector(chunkId) {
        return this.vectors.get(chunkId) || null;
    }

    /**
     * Check if a chunk is indexed
     * @param {string} chunkId - The chunk ID
     * @returns {boolean}
     */
    hasVector(chunkId) {
        return this.vectors.has(chunkId);
    }

    /**
     * Remove a vector
     * @param {string} chunkId - The chunk ID to remove
     */
    removeVector(chunkId) {
        this.vectors.delete(chunkId);
    }

    /**
     * Get the number of indexed vectors
     * @returns {number}
     */
    size() {
        return this.vectors.size;
    }

    /**
     * Save vectors to disk
     */
    async save() {
        const data = {
            dimension: this.dimension,
            vectors: Array.from(this.vectors.entries())
        };

        const dataPath = `${this.storePath}.json`;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        console.log(`Saved ${this.vectors.size} vectors to ${dataPath}`);
    }

    /**
     * Load vectors from disk
     */
    async load() {
        const dataPath = `${this.storePath}.json`;

        if (!fs.existsSync(dataPath)) {
            console.log('No existing vector store found, starting fresh');
            return;
        }

        try {
            const fileContent = fs.readFileSync(dataPath, 'utf8');
            const data = JSON.parse(fileContent);

            if (data.dimension !== this.dimension) {
                console.warn(`Dimension mismatch: expected ${this.dimension}, got ${data.dimension}. Starting fresh.`);
                return;
            }

            this.vectors = new Map(data.vectors);
            console.log(`Loaded ${this.vectors.size} vectors from ${dataPath}`);
        } catch (error) {
            console.error('Error loading vector store:', error.message);
            console.log('Starting with empty vector store');
        }
    }

    /**
     * Clear all vectors
     */
    clear() {
        this.vectors.clear();
    }
}

// Export singleton instance
const vectorStore = new VectorStore();
module.exports = vectorStore;

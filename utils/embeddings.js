const { pipeline } = require('@xenova/transformers');
const config = require('../config');

class EmbeddingGenerator {
    constructor() {
        this.model = null;
        this.modelName = config.embeddingModel;
    }

    /**
     * Initialize the embedding model
     */
    async initialize() {
        if (!this.model) {
            console.log(`Loading embedding model: ${this.modelName}...`);
            this.model = await pipeline('feature-extraction', this.modelName);
            console.log('Embedding model loaded successfully');
        }
    }

    /**
     * Generate embedding for a single text
     * @param {string} text - The text to embed
     * @returns {Promise<number[]>} - The embedding vector
     */
    async generateEmbedding(text) {
        await this.initialize();

        if (!text || text.trim().length === 0) {
            throw new Error('Cannot generate embedding for empty text');
        }

        // Generate embedding
        const output = await this.model(text, {
            pooling: 'mean',
            normalize: true
        });

        // Convert tensor to array
        const embedding = Array.from(output.data);
        return embedding;
    }

    /**
     * Generate embeddings for multiple texts in batch
     * @param {string[]} texts - Array of texts to embed
     * @returns {Promise<number[][]>} - Array of embedding vectors
     */
    async generateEmbeddings(texts) {
        await this.initialize();

        const embeddings = [];
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }

        return embeddings;
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {number[]} vecA - First vector
     * @param {number[]} vecB - Second vector
     * @returns {number} - Similarity score (0 to 1)
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }
}

// Export singleton instance
const embeddingGenerator = new EmbeddingGenerator();
module.exports = embeddingGenerator;

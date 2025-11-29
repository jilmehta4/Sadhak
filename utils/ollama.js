/**
 * Ollama API Wrapper
 * Handles communication with local Ollama LLM service
 */

const config = require('../config');

class OllamaClient {
    constructor() {
        this.baseUrl = config.ollamaUrl || 'http://localhost:11434';
        this.model = config.ollamaModel || 'llama3';
    }

    /**
     * Check if Ollama service is running
     * @returns {Promise<boolean>}
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            return response.ok;
        } catch (error) {
            console.error('Ollama is not running:', error.message);
            return false;
        }
    }

    /**
     * Generate a response from Ollama (non-streaming)
     * @param {string} prompt - The user's message
     * @param {Array} conversationHistory - Previous messages for context
     * @returns {Promise<string>}
     */
    async generateResponse(prompt, conversationHistory = []) {
        try {
            const messages = this._formatConversation(prompt, conversationHistory);

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: messages,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    /**
     * Generate a streaming response from Ollama
     * @param {string} prompt - The user's message
     * @param {Array} conversationHistory - Previous messages for context
     * @param {string} systemMessage - Optional system message with RAG context
     * @param {Function} onChunk - Callback for each chunk
     * @returns {Promise<void>}
     */
    async streamResponse(prompt, conversationHistory = [], systemMessage = null, onChunk) {
        try {
            const messages = this._formatConversation(prompt, conversationHistory, systemMessage);

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: messages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            onChunk(parsed.response);
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                    }
                }
            }
        } catch (error) {
            console.error('Error streaming response:', error);
            throw error;
        }
    }

    /**
     * Format conversation history for Ollama
     * @param {string} prompt - Current user message
     * @param {Array} history - Previous messages
     * @param {string} systemMessage - Optional custom system message
     * @returns {string}
     */
    _formatConversation(prompt, history = [], systemMessage = null) {
        let formatted = (systemMessage || config.chatSystemPrompt) + '\n\n';

        // Add conversation history
        for (const msg of history) {
            formatted += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        }

        // Add current prompt
        formatted += `User: ${prompt}\nAssistant:`;

        return formatted;
    }

    /**
     * Detect language from text (simple heuristic)
     * @param {string} text
     * @returns {string} 'en' or 'hi'
     */
    detectLanguage(text) {
        // Check for Devanagari script (Hindi)
        const devanagariPattern = /[\u0900-\u097F]/;
        return devanagariPattern.test(text) ? 'hi' : 'en';
    }
}

// Export singleton instance
const ollamaClient = new OllamaClient();
module.exports = ollamaClient;

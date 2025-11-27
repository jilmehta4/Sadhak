/**
 * Chat Route - AI Mode with Ollama
 */

const express = require('express');
const router = express.Router();
const ollamaClient = require('../utils/ollama');

/**
 * POST /chat
 * Handle AI chat requests
 */
router.post('/', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Check if Ollama is running
        const isRunning = await ollamaClient.checkStatus();
        if (!isRunning) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not available. Please ensure Ollama is running.'
            });
        }

        // Detect language from user input
        const detectedLanguage = ollamaClient.detectLanguage(message);

        // Set up Server-Sent Events for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        // Stream response from Ollama
        await ollamaClient.streamResponse(
            message,
            conversationHistory,
            (chunk) => {
                fullResponse += chunk;
                // Send chunk to client
                res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
            }
        );

        // Send completion signal with full response and detected language
        res.write(`data: ${JSON.stringify({
            chunk: '',
            done: true,
            fullResponse,
            detectedLanguage
        })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Error in chat route:', error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate response'
            });
        } else {
            res.write(`data: ${JSON.stringify({
                error: 'Failed to generate response',
                done: true
            })}\n\n`);
            res.end();
        }
    }
});

/**
 * GET /chat/status
 * Check Ollama service status
 */
router.get('/status', async (req, res) => {
    try {
        const isRunning = await ollamaClient.checkStatus();
        res.json({
            success: true,
            running: isRunning
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

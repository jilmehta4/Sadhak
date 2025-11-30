const express = require('express');
const router = express.Router();
const dbManager = require('../db/database');
const AuthDatabase = require('../db/authDatabase');
const { requireAuth } = require('../middleware/auth');

// Initialize auth database
let authDb;
function initAuthDb() {
    if (dbManager.db && !authDb) {
        authDb = new AuthDatabase(dbManager.db);
    }
}

/**
 * GET /history
 * Get user's chat history (last 10 conversations)
 */
router.get('/', requireAuth, (req, res) => {
    try {
        initAuthDb();
        const userId = req.session.userId;

        const history = authDb.getChatHistory(userId);

        res.json({
            success: true,
            history: history
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve chat history'
        });
    }
});

/**
 * DELETE /history/:id
 * Delete a specific conversation
 */
router.delete('/:id', requireAuth, (req, res) => {
    try {
        initAuthDb();
        const userId = req.session.userId;
        const historyId = parseInt(req.params.id);

        authDb.deleteChatHistory(userId, historyId);
        dbManager.save();

        res.json({
            success: true,
            message: 'Conversation deleted'
        });

    } catch (error) {
        console.error('Delete history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete conversation'
        });
    }
});

module.exports = router;

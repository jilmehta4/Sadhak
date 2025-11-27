const express = require('express');
const path = require('path');
const fs = require('fs');
const dbManager = require('../db/database');

const router = express.Router();

/**
 * GET /resource/image/:id
 * Serve an image resource
 */
router.get('/image/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Get resource from database
        const resource = dbManager.getResourceById(id);

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        if (resource.type !== 'image') {
            return res.status(400).json({ error: 'Resource is not an image' });
        }

        // Check if file exists
        if (!fs.existsSync(resource.filePath)) {
            return res.status(404).json({ error: 'Image file not found on disk' });
        }

        // Determine content type
        const ext = path.extname(resource.filePath).toLowerCase();
        const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

        // Send the image
        res.contentType(contentType);
        res.sendFile(path.resolve(resource.filePath));

    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;

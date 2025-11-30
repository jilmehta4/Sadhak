const express = require('express');
const bcrypt = require('bcrypt');
const AuthDatabase = require('../db/authDatabase');
const dbManager = require('../db/database');

const router = express.Router();

// Initialize auth database with main database connection
let authDb;

// Initialize auth database after main db is ready
function initAuthDb() {
    if (dbManager.db) {
        authDb = new AuthDatabase(dbManager.db);
    }
}

/**
 * POST /auth/check-email
 * Check if email exists in database
 */
router.post('/check-email', (req, res) => {
    try {
        initAuthDb();
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        const user = authDb.getUserByEmail(email.toLowerCase().trim());

        res.json({
            exists: !!user,
            hasPassword: user ? !!user.password_hash : false
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * POST /auth/signup
 * Create new account with email and password
 */
router.post('/signup', async (req, res) => {
    try {
        initAuthDb();
        const { email, password, displayName } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters'
            });
        }

        const emailLower = email.toLowerCase().trim();

        // Check if user already exists
        const existing = authDb.getUserByEmail(emailLower);
        if (existing) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const userId = authDb.createUser(emailLower, passwordHash, displayName);
        dbManager.save(); // Save database

        // Create session
        req.session.userId = userId;
        req.session.userEmail = emailLower;
        req.session.displayName = displayName || emailLower.split('@')[0];

        res.json({
            success: true,
            user: {
                id: userId,
                email: emailLower,
                displayName: req.session.displayName
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        initAuthDb();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const emailLower = email.toLowerCase().trim();

        // Get user
        const user = authDb.getUserByEmail(emailLower);
        if (!user || !user.password_hash) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Update last login
        authDb.updateLastLogin(user.id);
        dbManager.save();

        // Create session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.displayName = user.display_name || user.email.split('@')[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: req.session.displayName
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * POST /auth/logout
 * Logout and destroy session
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                error: 'Failed to logout'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            user: {
                id: req.session.userId,
                email: req.session.userEmail,
                displayName: req.session.displayName
            }
        });
    } else {
        res.json({
            user: null
        });
    }
});

module.exports = router;

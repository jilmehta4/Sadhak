const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

class AuthDatabase {
    constructor(db) {
        this.db = db;
    }

    // ========== USER MANAGEMENT ==========

    /**
     * Create a new user with email and password
     */
    createUser(email, passwordHash, displayName = null) {
        const stmt = this.db.prepare(
            'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)'
        );
        stmt.run([email, passwordHash, displayName]);
        stmt.free();

        const result = this.db.exec('SELECT last_insert_rowid() as id');
        return result[0].values[0][0];
    }

    /**
     * Create or update user from Google OAuth
     */
    upsertGoogleUser(googleId, email, displayName) {
        // Check if user exists
        const existing = this.getUserByGoogleId(googleId);

        if (existing) {
            // Update last login
            const stmt = this.db.prepare(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE google_id = ?'
            );
            stmt.run([googleId]);
            stmt.free();
            return existing.id;
        } else {
            // Create new user
            const stmt = this.db.prepare(
                'INSERT INTO users (google_id, email, display_name) VALUES (?, ?, ?)'
            );
            stmt.run([googleId, email, displayName]);
            stmt.free();

            const result = this.db.exec('SELECT last_insert_rowid() as id');
            return result[0].values[0][0];
        }
    }

    /**
     * Get user by email
     */
    getUserByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        stmt.bind([email]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get user by Google ID
     */
    getUserByGoogleId(googleId) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE google_id = ?');
        stmt.bind([googleId]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get user by ID
     */
    getUserById(userId) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        stmt.bind([userId]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Update user's last login time
     */
    updateLastLogin(userId) {
        const stmt = this.db.prepare(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
        );
        stmt.run([userId]);
        stmt.free();
    }

    // ========== CHAT HISTORY ==========

    /**
     * Save a conversation to chat history
     * Automatically maintains only last 10 conversations per user
     */
    saveChatHistory(userId, conversation) {
        // Insert new conversation
        const stmt = this.db.prepare(
            'INSERT INTO chat_history (user_id, conversation) VALUES (?, ?)'
        );
        stmt.run([userId, JSON.stringify(conversation)]);
        stmt.free();

        // Delete old conversations (keep only last 10)
        const deleteStmt = this.db.prepare(`
            DELETE FROM chat_history 
            WHERE user_id = ? 
            AND id NOT IN (
                SELECT id FROM chat_history 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            )
        `);
        deleteStmt.run([userId, userId]);
        deleteStmt.free();
    }

    /**
     * Get user's chat history (last 10 conversations)
     */
    getChatHistory(userId) {
        const stmt = this.db.prepare(`
            SELECT id, conversation, created_at 
            FROM chat_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        stmt.bind([userId]);

        const history = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            history.push({
                id: row.id,
                conversation: JSON.parse(row.conversation),
                createdAt: row.created_at
            });
        }
        stmt.free();
        return history;
    }

    /**
     * Delete a specific conversation
     */
    deleteChatHistory(userId, historyId) {
        const stmt = this.db.prepare(
            'DELETE FROM chat_history WHERE id = ? AND user_id = ?'
        );
        stmt.run([historyId, userId]);
        stmt.free();
    }

    // ========== PURCHASES ==========

    /**
     * Check if user has purchased a document
     */
    checkUserPurchase(userId, resourceId) {
        const stmt = this.db.prepare(`
            SELECT * FROM user_purchases 
            WHERE user_id = ? AND resource_id = ? AND payment_status = 'completed'
        `);
        stmt.bind([userId, resourceId]);

        const hasPurchased = stmt.step();
        stmt.free();
        return hasPurchased;
    }

    /**
     * Record a document purchase
     */
    recordPurchase(userId, resourceId, amount, paymentId = null) {
        const stmt = this.db.prepare(`
            INSERT INTO user_purchases (user_id, resource_id, amount, payment_id, payment_status) 
            VALUES (?, ?, ?, ?, 'completed')
        `);
        stmt.run([userId, resourceId, amount, paymentId]);
        stmt.free();

        const result = this.db.exec('SELECT last_insert_rowid() as id');
        return result[0].values[0][0];
    }

    /**
     * Get all purchases for a user
     */
    getUserPurchases(userId) {
        const stmt = this.db.prepare(`
            SELECT up.*, r.file_name, r.type, r.subtype 
            FROM user_purchases up
            JOIN resources r ON up.resource_id = r.id
            WHERE up.user_id = ? AND up.payment_status = 'completed'
            ORDER BY up.purchase_date DESC
        `);
        stmt.bind([userId]);

        const purchases = [];
        while (stmt.step()) {
            purchases.push(stmt.getAsObject());
        }
        stmt.free();
        return purchases;
    }

    /**
     * Get document pricing
     */
    getDocumentPrice(resourceId) {
        const stmt = this.db.prepare(
            'SELECT * FROM document_pricing WHERE resource_id = ?'
        );
        stmt.bind([resourceId]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null; // No pricing set (free document)
    }

    /**
     * Set document pricing
     */
    setDocumentPrice(resourceId, price, currency = 'USD', isFree = false) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO document_pricing (resource_id, price, currency, is_free) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run([resourceId, price, currency, isFree ? 1 : 0]);
        stmt.free();
    }
}

module.exports = AuthDatabase;

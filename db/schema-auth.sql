-- Authentication and Purchase System Schema
-- Run this migration to add user management tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Chat history table (stores last 10 conversations per user)
CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    conversation TEXT NOT NULL, -- JSON string of conversation
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- User purchases table
CREATE TABLE IF NOT EXISTS user_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2),
    payment_id TEXT,
    payment_status TEXT DEFAULT 'completed', -- completed, pending, failed
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create indexes for purchase lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_resource_id ON user_purchases(resource_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_resource ON user_purchases(user_id, resource_id);

-- Document pricing table (optional - for storing prices)
CREATE TABLE IF NOT EXISTS document_pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_free BOOLEAN DEFAULT 0,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pricing_resource_id ON document_pricing(resource_id);

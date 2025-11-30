// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const dbManager = require('./db/database');
const vectorStore = require('./db/vectorStore');

// Import routes
const searchRouter = require('./routes/search');
const resourcesRouter = require('./routes/resources');
const chatRouter = require('./routes/chat');
const authRouter = require('./routes/auth');
const historyRouter = require('./routes/history');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'gurutattva-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/auth', authRouter);
app.use('/search', searchRouter);
app.use('/resource', resourcesRouter);
app.use('/chat', chatRouter);
app.use('/history', historyRouter);


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        vectorStoreSize: vectorStore.size(),
        timestamp: new Date().toISOString()
    });
});

// Initialize and start server
async function startServer() {
    try {
        console.log('Initializing database...');
        await dbManager.initialize();

        console.log('Loading vector store...');
        await vectorStore.initialize();

        const port = config.port;
        app.listen(port, () => {
            console.log('\n========================================');
            console.log('Multilingual Search Engine');
            console.log('========================================');
            console.log(`Server running on http://localhost:${port}`);
            console.log(`Indexed vectors: ${vectorStore.size()}`);
            console.log('========================================\n');

            if (vectorStore.size() === 0) {
                console.log('⚠️  No vectors found in the store.');
                console.log('   Run ingestion first: npm run ingest\n');
            }
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    dbManager.close();
    process.exit(0);
});

// Start the server
startServer();

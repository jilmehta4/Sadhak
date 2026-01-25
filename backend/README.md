# Sadhak Backend API

Backend server for the Sadhak multilingual semantic search engine with AI chat capabilities.

## Features

- **Semantic Search**: Search through PDFs and images using multilingual embeddings
- **OCR Processing**: Extract text from images using Tesseract.js
- **PDF Processing**: Extract and chunk text from PDF documents
- **Vector Database**: Efficient similarity search using embeddings
- **Google OAuth**: User authentication
- **AI Chat**: Ollama-powered chat with RAG (Retrieval Augmented Generation)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Ingestion

To process PDF files and images from the `database/resources/` folder:

```bash
npm run ingest
```

This will:
1. Scan the `database/resources/` folder for new files
2. Process PDFs and extract text
3. Perform OCR on images
4. Generate embeddings
5. Store in the vector database

## API Endpoints

### Search
- `POST /search` - Search for content
  ```json
  {
    "query": "your search query",
    "language": "en" // or "hi"
  }
  ```

### Chat
- `POST /chat` - Send a chat message with RAG
  ```json
  {
    "message": "your question",
    "language": "en",
    "sessionId": "optional-session-id"
  }
  ```

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout
- `GET /auth/user` - Get current user

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
backend/
├── config.js              # Configuration settings
├── server.js              # Express server setup
├── routes/                # API route handlers
│   ├── search.js
│   ├── chat.js
│   ├── auth.js
│   └── health.js
├── db/                    # Database management
│   ├── database.js        # SQLite database
│   └── vectorStore.js     # Vector storage
├── ingestion/             # File processing pipeline
│   ├── ingest.js          # Main ingestion orchestrator
│   ├── scanner.js         # File scanner
│   ├── ocrProcessor.js    # Image OCR
│   └── pdfProcessor.js    # PDF processing
├── middleware/            # Express middleware
│   └── auth.js
├── utils/                 # Utility functions
│   ├── embeddings.js
│   ├── chunker.js
│   └── languageDetector.js
└── data/                  # Generated data (gitignored)
    ├── search.db          # SQLite database
    └── vectors/           # Vector embeddings
```

## Development

### Adding New Routes

1. Create a new file in `routes/`
2. Define your route handlers
3. Import and use in `server.js`

### Modifying Search Logic

- Edit `routes/search.js` for search endpoint logic
- Edit `db/vectorStore.js` for vector search implementation

### Changing Ingestion Pipeline

- Edit files in `ingestion/` folder
- Update `config.js` for paths and settings

## Troubleshooting

### Database Issues

```bash
# Delete and recreate database
rm -rf data/
npm run ingest
```

### Port Already in Use

Change the `PORT` in your `.env` file or:

```bash
PORT=3001 npm start
```

### Ollama Connection Issues

Make sure Ollama is running:
```bash
ollama serve
```

## License

ISC

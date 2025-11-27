# Multilingual Local Search Engine

A powerful local semantic search engine that indexes and searches JPG images and PDF files containing text in **English** and **Hindi**. The system uses OCR, natural language processing, and vector embeddings to enable cross-language semantic search.

## ✨ Features

- **Multilingual Support**: Search and index documents in English and Hindi
- **Multiple Resource Types**:
  - JPG images with OCR text extraction
  - Book PDFs with page and paragraph tracking
  - Transcript PDFs with timestamp parsing
- **Semantic Search**: Uses multilingual embeddings for intelligent cross-language search
- **Beautiful UI**: Modern, premium dark theme with glassmorphism design
- **Language Detection**: Automatic detection of English, Hindi, or mixed content
- **Future-Ready**: Architecture designed for easy AI mode integration

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create resources folder**:
   ```bash
   mkdir resources
   ```

3. **Add your files**: Place your JPG and PDF files in the `resources` folder. You can organize them in subdirectories if needed.

4. **Run ingestion**: Process all files and build the search index:
   ```bash
   npm run ingest
   ```
   
   This will:
   - Perform OCR on images (English + Hindi)
   - Extract text from PDFs
   - Detect languages
   - Generate embeddings
   - Build vector search index

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Open the web interface**: Navigate to `http://localhost:3000` in your browser

## 📁 Project Structure

```
search-engine/
├── config.js                 # Configuration settings
├── server.js                 # Express server
├── package.json              # Dependencies
│
├── db/
│   ├── schema.sql            # Database schema
│   ├── database.js           # SQLite operations
│   └── vectorStore.js        # Vector storage and search
│
├── utils/
│   ├── languageDetection.js  # Hindi/English detection
│   └── embeddings.js         # Multilingual embedding generation
│
├── ingestion/
│   ├── scanner.js            # File discovery
│   ├── ocrProcessor.js       # Image OCR (Tesseract)
│   ├── pdfProcessor.js       # PDF text extraction
│   └── ingest.js             # Main ingestion pipeline
│
├── routes/
│   ├── search.js             # Search API endpoint
│   └── resources.js          # Resource serving
│
├── public/
│   ├── index.html            # Web UI
│   ├── style.css             # Premium design
│   ├── app.js                # Frontend logic
│   └── i18n.js               # English/Hindi translations
│
└── resources/                # Your files go here
```

## 🔍 How to Use

### Adding New Files

1. Add JPG or PDF files to the `resources` folder
2. Run the ingestion script again: `npm run ingest`
3. Only new files will be processed (deduplication is automatic)

### Searching

- Type your query in **English** or **Hindi**
- Click the **Search** button
- Results will show relevant content regardless of the original language
- Switch the UI language using the language toggle (English/हिंदी)

### Search Results

**Image Results** display:
- Image preview
- OCR-extracted text
- Recorded timestamp
- Language detected

**Book PDF Results** display:
- Document name
- Page and paragraph numbers
- Paragraph text
- Language detected

**Transcript PDF Results** display:
- Document name
- Timestamp
- Transcript text
- Language detected

## 🛠️ Technical Details

### Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (metadata) + JSON (vector store)
- **OCR**: Tesseract.js with English and Hindi language packs
- **PDF Parsing**: pdf-parse
- **Embeddings**: Xenova/transformers.js with `paraphrase-multilingual-MiniLM-L12-v2`
- **Frontend**: Vanilla HTML/CSS/JavaScript with modern responsive design

### Language Detection

The system uses Unicode character range detection:
- **Devanagari script** (U+0900–U+097F) → Hindi
- **Latin script** → English
- **Both present** → Mixed

### Supported File Types

- **Images**: `.jpg`, `.jpeg`
- **PDFs**: `.pdf` (automatically categorized as book or transcript)

### PDF Type Detection

- **Transcript**: If the PDF contains 5+ timestamps (HH:MM:SS or MM:SS format)
- **Book**: All other PDFs

## 🔮 Future AI Mode

The system is designed to easily add an AI-powered mode later:

1. Create new endpoint `/search-with-ai`
2. Reuse existing search logic to retrieve relevant chunks
3. Send chunks as context to an external LLM (OpenAI, Gemini, etc.)
4. Return AI-synthesized answers with citations

**No changes needed** to ingestion, database, or search pipeline.

## 📊 Data Model

### Resources Table
- `id`, `type` (image/pdf), `subtype` (book/transcript)
- `fileName`, `filePath`, `recordedAt`
- `createdAt`, `title`

### Chunks Table
- `id`, `resourceId`, `text`, `language`
- `page`, `paragraph` (for book PDFs)
- `timestamp` (for transcript PDFs)
- Embedding vectors (stored separately in vector store)

## 🌐 API Endpoints

### POST /search
Search for documents

**Request**:
```json
{
  "query": "your search query",
  "maxResults": 10,
  "uiLanguage": "en"
}
```

**Response**:
```json
{
  "results": [
    {
      "chunkId": "...",
      "resourceType": "image",
      "resourceName": "photo.jpg",
      "language": "hi",
      "text": "...",
      "previewUrl": "/resource/image/...",
      "recordedAt": "2025-01-25T07:30:00Z",
      "score": 0.87
    }
  ],
  "count": 1
}
```

### GET /resource/image/:id
Serve image file

## 🤝 Contributing

This is a local private search engine. Customize as needed for your use case.

## 📝 License

ISC

---

Built with ❤️ for multilingual document search

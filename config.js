const path = require('path');

const config = {
  // Server configuration
  port: process.env.PORT || 3000,

  // Paths
  resourcesPath: process.env.RESOURCES_PATH || path.join(__dirname, 'resources'),
  dbPath: process.env.DB_PATH || path.join(__dirname, 'data', 'search.db'),
  vectorStorePath: process.env.VECTOR_STORE_PATH || path.join(__dirname, 'data', 'vectors'),

  // Embedding configuration
  embeddingModel: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
  embeddingDimension: 384,

  // Search configuration
  defaultMaxResults: 10,

  // Supported languages
  languages: {
    en: 'English',
    hi: 'Hindi'
  },

  // File types
  supportedImageExtensions: ['.jpg', '.jpeg'],
  supportedPdfExtension: '.pdf',

  // OCR configuration
  tesseractLanguages: 'eng+hin',

  // Timestamp patterns for transcript detection
  timestampPatterns: [
    /\d{1,2}:\d{2}:\d{2}/g,  // HH:MM:SS or H:MM:SS
    /\d{1,2}:\d{2}/g          // MM:SS or M:SS
  ],

  // Ollama configuration
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3',
  chatSystemPrompt: 'You are a helpful AI assistant. Respond in the same language as the user\'s question. If the user writes in Hindi (Devanagari script), respond in Hindi. If the user writes in English, respond in English.'

};

module.exports = config;

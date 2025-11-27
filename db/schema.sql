-- Resources table: stores metadata about JPG images and PDF files
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('image', 'pdf')),
  subtype TEXT CHECK(subtype IN ('book', 'transcript') OR subtype IS NULL),
  fileName TEXT NOT NULL,
  filePath TEXT NOT NULL UNIQUE,
  recordedAt TEXT,
  createdAt TEXT NOT NULL,
  title TEXT
);

-- Chunks table: stores searchable text chunks with embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  resourceId TEXT NOT NULL,
  text TEXT NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('en', 'hi', 'mixed')),
  page INTEGER,
  paragraph INTEGER,
  timestamp TEXT,
  FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chunks_resource ON chunks(resourceId);
CREATE INDEX IF NOT EXISTS idx_chunks_language ON chunks(language);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_filepath ON resources(filePath);

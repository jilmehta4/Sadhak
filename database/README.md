# Database Resources

This folder contains all PDF files and images that are processed by the Sadhak search engine.

## Structure

```
database/
└── resources/
    ├── English/          # English language resources
    │   ├── file1.pdf
    │   ├── file2.pdf
    │   └── image1.jpg
    └── हिंदी/            # Hindi language resources
        ├── file1.pdf
        ├── file2.pdf
        └── image1.jpg
```

## Adding New Resources

### 1. Add Files

Place your PDF files or images in the appropriate language folder:
- English content → `database/resources/English/`
- Hindi content → `database/resources/हिंदी/`

### 2. Run Ingestion

After adding new files, run the ingestion script from the backend folder:

```bash
cd backend
npm run ingest
```

This will:
1. Scan for new files in the resources folder
2. Extract text from PDFs
3. Perform OCR on images
4. Generate embeddings
5. Store in the vector database

## Supported File Types

### PDFs
- `.pdf` files
- Text-based or scanned PDFs
- Any language (English and Hindi optimized)

### Images
- `.jpg` and `.jpeg` files
- OCR will be performed using Tesseract
- Supports English and Hindi text

## File Naming

- Use descriptive names for your files
- Avoid special characters in filenames
- Use underscores instead of spaces (e.g., `spiritual_text_1.pdf`)

## Language Detection

The system automatically detects the language folder:
- Files in `English/` are tagged as English
- Files in `हिंदी/` are tagged as Hindi

This helps with language-specific search filtering.

## Ingestion Process

When you run `npm run ingest`:

1. **Scanning**: Checks for files not yet in the database
2. **Processing**:
   - PDFs: Extracts text and splits into chunks
   - Images: Performs OCR to extract text
3. **Embedding**: Generates vector embeddings for semantic search
4. **Storage**: Saves to SQLite database and vector store

## Database Location

The processed data is stored in:
- `backend/data/search.db` - SQLite database with metadata
- `backend/data/vectors/` - Vector embeddings for similarity search

## Re-ingesting Files

To re-process all files (e.g., after changing chunking strategy):

```bash
cd backend
# Delete existing database
rm -rf data/
# Run ingestion
npm run ingest
```

## Best Practices

1. **Organize by Language**: Keep English and Hindi content separate
2. **Quality Content**: Use clear, readable PDFs and high-quality images
3. **Regular Ingestion**: Run ingestion after adding new files
4. **Backup**: Keep backups of your original PDF files
5. **File Size**: Keep individual files under 50MB for optimal processing

## Troubleshooting

### Files Not Being Processed

- Check file permissions
- Ensure files are in the correct language folder
- Verify file extensions are supported
- Check backend logs for errors

### OCR Quality Issues

- Use higher resolution images (300 DPI recommended)
- Ensure good contrast and lighting
- Avoid skewed or rotated images
- Use clear, readable fonts

### Ingestion Errors

```bash
# View detailed logs
cd backend
npm run ingest
```

Check the console output for specific error messages.

## License

ISC

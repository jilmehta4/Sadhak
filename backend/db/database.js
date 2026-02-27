const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    /**
     * Initialize the database connection and create tables
     */
    async initialize() {
        // Ensure data directory exists
        const dataDir = path.dirname(config.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Initialize SQL.js
        this.SQL = await initSqlJs();

        // Load existing database if it exists, or create new one
        if (fs.existsSync(config.dbPath)) {
            const buffer = fs.readFileSync(config.dbPath);
            this.db = new this.SQL.Database(buffer);
            console.log('Loaded existing database');
        } else {
            this.db = new this.SQL.Database();
            console.log('Created new database');
        }

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        this.db.run(schema);

        console.log('Database initialized successfully');
    }

    /**
     * Save database to disk
     */
    save() {
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(config.dbPath, buffer);
    }

    /**
     * Insert a new resource
     */
    insertResource(resource) {
        const stmt = this.db.prepare(`
      INSERT INTO resources (id, type, subtype, fileName, filePath, recordedAt, createdAt, title)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.bind([
            resource.id,
            resource.type,
            resource.subtype || null,
            resource.fileName,
            resource.filePath,
            resource.recordedAt || null,
            resource.createdAt,
            resource.title || null
        ]);

        stmt.step();
        stmt.free();
        // NOTE: do not call this.save() here — caller is responsible (via transaction)
    }

    /**
     * Insert a new chunk
     */
    insertChunk(chunk) {
        const stmt = this.db.prepare(`
      INSERT INTO chunks (id, resourceId, text, language, page, paragraph, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.bind([
            chunk.id,
            chunk.resourceId,
            chunk.text,
            chunk.language,
            chunk.page || null,
            chunk.paragraph || null,
            chunk.timestamp || null
        ]);

        stmt.step();
        stmt.free();
        // NOTE: do not call this.save() here — caller is responsible (via transaction)
    }

    /**
     * Insert multiple chunks efficiently in one prepared-statement loop
     * @param {Object[]} chunks - Array of chunk objects
     */
    insertChunksBatch(chunks) {
        const stmt = this.db.prepare(`
      INSERT INTO chunks (id, resourceId, text, language, page, paragraph, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        for (const chunk of chunks) {
            stmt.bind([
                chunk.id,
                chunk.resourceId,
                chunk.text,
                chunk.language,
                chunk.page || null,
                chunk.paragraph || null,
                chunk.timestamp || null
            ]);
            stmt.step();
            stmt.reset();
        }

        stmt.free();
        // Caller is responsible for save()
    }

    /**
     * Get resource by file path
     */
    getResourceByPath(filePath) {
        const stmt = this.db.prepare('SELECT * FROM resources WHERE filePath = ?');
        stmt.bind([filePath]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get resource by ID
     */
    getResourceById(id) {
        const stmt = this.db.prepare('SELECT * FROM resources WHERE id = ?');
        stmt.bind([id]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get all chunks for a resource
     */
    getChunksByResourceId(resourceId) {
        const stmt = this.db.prepare('SELECT * FROM chunks WHERE resourceId = ?');
        stmt.bind([resourceId]);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        stmt.free();
        return results;
    }

    /**
     * Get chunk by ID
     */
    getChunkById(id) {
        const stmt = this.db.prepare('SELECT * FROM chunks WHERE id = ?');
        stmt.bind([id]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get all indexed file paths
     */
    getAllFilePaths() {
        const stmt = this.db.prepare('SELECT filePath FROM resources');
        const results = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row.filePath);
        }

        stmt.free();
        return results;
    }

    /**
     * Get chunk with resource information
     */
    getChunkWithResource(chunkId) {
        const stmt = this.db.prepare(`
      SELECT 
        c.*,
        r.type as resourceType,
        r.subtype as resourceSubtype,
        r.fileName as resourceFileName,
        r.filePath as resourceFilePath,
        r.recordedAt as resourceRecordedAt
      FROM chunks c
      JOIN resources r ON c.resourceId = r.id
      WHERE c.id = ?
    `);

        stmt.bind([chunkId]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
        }

        stmt.free();
        return null;
    }

    /**
     * Get multiple chunks with resources by IDs
     */
    getChunksWithResources(chunkIds) {
        if (!chunkIds || chunkIds.length === 0) {
            return [];
        }

        const placeholders = chunkIds.map(() => '?').join(',');
        const stmt = this.db.prepare(`
      SELECT 
        c.*,
        r.type as resourceType,
        r.subtype as resourceSubtype,
        r.fileName as resourceFileName,
        r.filePath as resourceFilePath,
        r.recordedAt as resourceRecordedAt
      FROM chunks c
      JOIN resources r ON c.resourceId = r.id
      WHERE c.id IN (${placeholders})
    `);

        stmt.bind(chunkIds);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        stmt.free();
        return results;
    }

    /**
     * Get multiple chunks with resources by IDs, filtered by language
     */
    getChunksWithResourcesByLanguage(chunkIds, language) {
        if (!chunkIds || chunkIds.length === 0) {
            return [];
        }

        const placeholders = chunkIds.map(() => '?').join(',');
        const stmt = this.db.prepare(`
      SELECT 
        c.*,
        r.type as resourceType,
        r.subtype as resourceSubtype,
        r.fileName as resourceFileName,
        r.filePath as resourceFilePath,
        r.recordedAt as resourceRecordedAt
      FROM chunks c
      JOIN resources r ON c.resourceId = r.id
      WHERE c.id IN (${placeholders})
        AND c.language = ?
    `);

        stmt.bind([...chunkIds, language]);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        stmt.free();
        return results;
    }

    /**
     * Keyword-based search — 3 tiers:
     * 1. Exact phrase match (full query as-is)
     * 2. Word-by-word OR match (any word present)
     * 3. Language preference — English/preferred results sorted first, not hard-filtered
     */
    searchByKeyword(query, language = null, limit = 10) {
        const normalizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();

        // ── Tier 1: Exact phrase match ──────────────────────────────────────
        // Search WITHOUT language filter — then sort preferred language first
        const phraseResults = this._keywordQuery(
            `LOWER(c.text) LIKE ?`,
            [`%${normalizedQuery}%`],
            null,          // no language filter — get all matches
            limit * 3      // fetch extra so we can sort and slice
        );
        if (phraseResults.length > 0) {
            const wordCount = normalizedQuery.split(/\s+/).length;
            return this._sortByLanguage(phraseResults, language)
                .slice(0, limit)
                .map(r => ({ ...r, keywordHits: wordCount }));
        }

        // ── Tier 2: Word-by-word OR match ──────────────────────────────────
        const words = normalizedQuery
            .split(/\s+/)
            .filter(w => w.length > 1);

        if (words.length === 0) return [];

        const likeConditions = words.map(() => `WHEN LOWER(c.text) LIKE ? THEN 1 ELSE 0`).join('\n          ');
        const likeArgs = words.map(w => `%${w}%`);

        const wordResults = this._keywordQuery(
            `(${words.map(() => `LOWER(c.text) LIKE ?`).join(' OR ')})`,
            likeArgs,
            null,          // no language filter
            limit * 3,
            likeArgs,
            likeConditions
        );

        return this._sortByLanguage(wordResults, language).slice(0, limit);
    }

    /**
     * Sort results so preferred language comes first; within same language, preserve order.
     */
    _sortByLanguage(results, preferredLanguage) {
        if (!preferredLanguage) return results;
        return [...results].sort((a, b) => {
            const aMatch = a.language === preferredLanguage ? 0 : 1;
            const bMatch = b.language === preferredLanguage ? 0 : 1;
            return aMatch - bMatch;
        });
    }

    /**
     * Internal helper — runs a keyword query with given WHERE condition and args
     */
    _keywordQuery(whereClause, whereArgs, language, limit, sumArgs = null, likeConditions = null) {
        const langFilter = language ? `AND c.language = ?` : '';
        const langArgs = language ? [language] : [];

        const scoreExpr = likeConditions
            ? `(SELECT SUM(CASE ${likeConditions} END) FROM (SELECT 1))`
            : `1`;

        const stmt = this.db.prepare(`
      SELECT
        c.*,
        r.type as resourceType,
        r.subtype as resourceSubtype,
        r.fileName as resourceFileName,
        r.filePath as resourceFilePath,
        r.recordedAt as resourceRecordedAt,
        ${scoreExpr} as keywordHits
      FROM chunks c
      JOIN resources r ON c.resourceId = r.id
      WHERE ${whereClause}
        ${langFilter}
      ORDER BY keywordHits DESC
      LIMIT ?
    `);

        const bindArgs = [
            ...(sumArgs || []),
            ...whereArgs,
            ...langArgs,
            limit
        ];

        stmt.bind(bindArgs);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        stmt.free();
        return results;
    }


    /**
     * Execute a transaction (simplified for SQL.js)
     */
    transaction(callback) {
        try {
            callback();
            this.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Close the database connection
     */
    close() {
        if (this.db) {
            this.save();
            this.db.close();
        }
    }
}

// Export singleton instance
const dbManager = new DatabaseManager();
module.exports = dbManager;

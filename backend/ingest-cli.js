#!/usr/bin/env node

const { runIngestion } = require('./ingestion/ingest');

/**
 * CLI script to run the ingestion pipeline
 */
async function main() {
    console.log('Multilingual Search Engine - Ingestion CLI\n');

    const result = await runIngestion();

    if (result.success) {
        process.exit(0);
    } else {
        console.error('Ingestion failed. Please check the errors above.');
        process.exit(1);
    }
}

// Run the CLI
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

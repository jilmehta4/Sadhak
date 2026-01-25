/**
 * Detect the language of text based on Unicode character ranges
 * @param {string} text - The text to analyze
 * @returns {string} - 'en', 'hi', or 'mixed'
 */
function detectLanguage(text) {
    if (!text || text.trim().length === 0) {
        return 'en'; // Default to English for empty text
    }

    // Unicode ranges
    const devanagariRange = /[\u0900-\u097F]/; // Hindi (Devanagari script)
    const latinRange = /[a-zA-Z]/; // English (Latin script)

    const hasDevanagari = devanagariRange.test(text);
    const hasLatin = latinRange.test(text);

    if (hasDevanagari && hasLatin) {
        return 'mixed';
    } else if (hasDevanagari) {
        return 'hi';
    } else if (hasLatin) {
        return 'en';
    }

    // If neither detected, default to English
    return 'en';
}

/**
 * Get the percentage of text in each language
 * @param {string} text - The text to analyze
 * @returns {Object} - { en: number, hi: number, mixed: number }
 */
function getLanguageStats(text) {
    if (!text || text.trim().length === 0) {
        return { en: 0, hi: 0, mixed: 0 };
    }

    const chars = text.split('');
    let devanagariCount = 0;
    let latinCount = 0;

    chars.forEach(char => {
        if (/[\u0900-\u097F]/.test(char)) {
            devanagariCount++;
        } else if (/[a-zA-Z]/.test(char)) {
            latinCount++;
        }
    });

    const total = devanagariCount + latinCount;
    if (total === 0) {
        return { en: 0, hi: 0, mixed: 0 };
    }

    const hiPercent = (devanagariCount / total) * 100;
    const enPercent = (latinCount / total) * 100;

    return {
        en: enPercent,
        hi: hiPercent,
        mixed: Math.min(enPercent, hiPercent)
    };
}

module.exports = {
    detectLanguage,
    getLanguageStats
};

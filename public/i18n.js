const translations = {
    en: {
        // Header
        appTitle: 'Multilingual Search Engine',
        appSubtitle: 'Search across your private documents in English and Hindi',

        // Language switcher
        languageSwitcher: 'Language',

        // Search
        searchPlaceholder: 'Search in English or Hindi...',
        searchButton: 'Search',
        searching: 'Searching...',

        // Results
        resultsTitle: 'Search Results',
        noResults: 'No results found',
        noResultsMessage: 'Try a different search query',
        resultCount: (count) => `Found ${count} result${count !== 1 ? 's' : ''}`,

        // Result types
        image: 'Image',
        bookPdf: 'Book PDF',
        transcriptPdf: 'Transcript PDF',

        // Result metadata
        recordedAt: 'Recorded at',
        page: 'Page',
        paragraph: 'Paragraph',
        timestamp: 'Timestamp',
        language: 'Language',
        relevanceScore: 'Relevance',

        // Languages
        languageEn: 'English',
        languageHi: 'Hindi',
        languageMixed: 'Mixed',

        // Empty state
        emptyStateTitle: 'Start Searching',
        emptyStateMessage: 'Enter a search query to find documents',

        // Errors
        errorTitle: 'Error',
        errorMessage: 'Something went wrong. Please try again.',

        // File info
        file: 'File'
    },

    hi: {
        // Header
        appTitle: 'बहुभाषी खोज इंजन',
        appSubtitle: 'अंग्रेज़ी और हिंदी में अपने निजी दस्तावेज़ों में खोजें',

        // Language switcher
        languageSwitcher: 'भाषा',

        // Search
        searchPlaceholder: 'अंग्रेज़ी या हिंदी में खोजें...',
        searchButton: 'खोजें',
        searching: 'खोज रहे हैं...',

        // Results
        resultsTitle: 'खोज परिणाम',
        noResults: 'कोई परिणाम नहीं मिला',
        noResultsMessage: 'एक अलग खोज क्वेरी का प्रयास करें',
        resultCount: (count) => `${count} परिणाम मिले`,

        // Result types
        image: 'चित्र',
        bookPdf: 'पुस्तक PDF',
        transcriptPdf: 'प्रतिलेख PDF',

        // Result metadata
        recordedAt: 'रिकॉर्ड किया गया',
        page: 'पृष्ठ',
        paragraph: 'अनुच्छेद',
        timestamp: 'समय',
        language: 'भाषा',
        relevanceScore: 'प्रासंगिकता',

        // Languages
        languageEn: 'अंग्रेज़ी',
        languageHi: 'हिंदी',
        languageMixed: 'मिश्रित',

        // Empty state
        emptyStateTitle: 'खोज शुरू करें',
        emptyStateMessage: 'दस्तावेज़ खोजने के लिए एक खोज क्वेरी दर्ज करें',

        // Errors
        errorTitle: 'त्रुटि',
        errorMessage: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',

        // File info
        file: 'फ़ाइल'
    }
};

/**
 * Get translation for a key in the current language
 * @param {string} key - Translation key
 * @param {string} lang - Language code ('en' or 'hi')
 * @param {any} param - Optional parameter for functions
 * @returns {string} - Translated text
 */
function t(key, lang = 'en', param = null) {
    const translation = translations[lang]?.[key];

    if (typeof translation === 'function') {
        return translation(param);
    }

    return translation || key;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, t };
}

/**
 * Multilingual Search Engine with AI Assistant
 * Main Application Logic
 */

// State Management
const state = {
  mode: 'search', // 'search' or 'ai'
  isVoiceRecording: false,
  recognition: null,
  conversationHistory: [],
  currentLanguage: 'en',
  selectedResourceLanguage: 'en', // NEW: for resource filtering
  isAIResponding: false,
  currentReader: null, // Store the stream reader for stopping
  abortController: null // Store AbortController for cancelling fetch requests
};

// DOM Elements
const elements = {
  // Home page elements
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  voiceBtn: document.getElementById('voice-btn'),
  aiToggle: document.getElementById('ai-toggle'),
  modeText: document.getElementById('mode-text'),

  // Compact header elements
  modeSwitcherBtn: document.getElementById('mode-switcher-btn'),
  compactSearchWrapper: document.getElementById('compact-search-wrapper'),
  compactSearchForm: document.getElementById('compact-search-form'),
  compactSearchInput: document.getElementById('compact-search-input'),
  compactVoiceBtn: document.getElementById('compact-voice-btn'),
  compactAiToggle: document.getElementById('compact-ai-toggle'),
  compactModeText: document.getElementById('compact-mode-text'),

  // Content sections
  contentContainer: document.getElementById('content-container'),
  searchResultsSection: document.getElementById('search-results-section'),
  chatSection: document.getElementById('chat-section'),

  // Results
  loadingState: document.getElementById('loading-state'),
  noResultsState: document.getElementById('no-results-state'),
  resultsContainer: document.getElementById('results-container'),
  resultsList: document.getElementById('results-list'),
  resultCount: document.getElementById('result-count'),

  // Chat
  chatMessages: document.getElementById('chat-messages'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  sendBtn: document.getElementById('send-btn'),
  stopBtn: document.getElementById('stop-btn'),
  newChatBtn: document.getElementById('new-chat-btn'),

  // Voice indicator
  voiceIndicator: document.getElementById('voice-indicator'),
  stopVoiceBtn: document.getElementById('stop-voice'),

  // PDF Preview Modal
  pdfModal: document.getElementById('pdf-preview-modal'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalBookName: document.getElementById('modal-book-name'),
  modalPageBadge: document.getElementById('modal-page-badge'),
  modalPreviewText: document.getElementById('modal-preview-text'),
  continueReadingBtn: document.getElementById('continue-reading-btn')
};

// Auto-resize textarea as user types
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Initialize auto-resize for chat input
if (elements.chatInput) {
  elements.chatInput.addEventListener('input', function () {
    autoResizeTextarea(this);
  });

  // Reset height on form submit
  if (elements.chatForm) {
    elements.chatForm.addEventListener('submit', function () {
      setTimeout(() => {
        if (elements.chatInput) {
          elements.chatInput.style.height = 'auto';
        }
      }, 100);
    });
  }
}


// Start New Chat
function startNewChat() {
  // Clear conversation history
  state.conversationHistory = [];

  // Clear chat messages
  elements.chatMessages.innerHTML = '';

  // Add welcome message back
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'welcome-message';
  welcomeDiv.innerHTML = `
    <div class="ai-icon-large">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>
    <h2>How can I help you today?</h2>
    <p>Ask me anything about spiritual guidance, meditation, or wisdom from the Guru.</p>
  `;
  elements.chatMessages.appendChild(welcomeDiv);

  // Focus on chat input
  elements.chatInput.focus();

  console.log('Started new chat');
}

// Initialize Application
function init() {
  console.log('App initializing...');
  setupEventListeners();
  setupLogoNavigation();
  setupLanguageToggle(); // NEW
  initializeVoiceRecognition();
  checkOllamaStatus();
  console.log('App initialized successfully');
}

// Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');

  // Search form submissions (both home and compact)
  elements.searchForm.addEventListener('submit', handleSearch);
  elements.compactSearchForm.addEventListener('submit', handleSearch);

  // Sync input values
  elements.searchInput.addEventListener('input', (e) => {
    elements.compactSearchInput.value = e.target.value;
  });
  elements.compactSearchInput.addEventListener('input', (e) => {
    elements.searchInput.value = e.target.value;
  });

  // Voice buttons
  elements.voiceBtn.addEventListener('click', toggleVoiceRecognition);
  elements.compactVoiceBtn.addEventListener('click', toggleVoiceRecognition);
  elements.stopVoiceBtn.addEventListener('click', stopVoiceRecognition);

  // AI mode toggles
  elements.aiToggle.addEventListener('click', () => {
    console.log('AI toggle clicked');
    toggleAIMode();
  });
  elements.compactAiToggle.addEventListener('click', () => {
    console.log('Compact AI toggle clicked');
    toggleAIMode();
  });

  // Mode switcher button
  elements.modeSwitcherBtn.addEventListener('click', switchToSearchMode);

  // Chat form and buttons
  elements.chatForm.addEventListener('submit', handleChatSubmit);
  elements.stopBtn.addEventListener('click', stopAIResponse);

  // PDF Modal events
  elements.modalCloseBtn.addEventListener('click', hidePDFPreview);
  elements.modalOverlay.addEventListener('click', hidePDFPreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.pdfModal.classList.contains('hidden')) {
      hidePDFPreview();
    }
  });

  console.log('Event listeners set up successfully');
}

// Voice Recognition Setup
function initializeVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    elements.voiceBtn.style.display = 'none';
    elements.compactVoiceBtn.style.display = 'none';
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = true;

  state.recognition.onstart = () => {
    state.isVoiceRecording = true;
    elements.voiceBtn.classList.add('recording');
    elements.compactVoiceBtn.classList.add('recording');
    elements.voiceIndicator.classList.remove('hidden');
  };

  state.recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    elements.searchInput.value = transcript;
    elements.compactSearchInput.value = transcript;
  };

  state.recognition.onend = () => {
    state.isVoiceRecording = false;
    elements.voiceBtn.classList.remove('recording');
    elements.compactVoiceBtn.classList.remove('recording');
    elements.voiceIndicator.classList.add('hidden');

    // Auto-submit if there's text
    if (elements.searchInput.value.trim()) {
      handleSearch(new Event('submit'));
    }
  };

  state.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopVoiceRecognition();
  };
}

// Toggle Voice Recognition
function toggleVoiceRecognition() {
  if (!state.recognition) {
    alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
    return;
  }

  if (state.isVoiceRecording) {
    stopVoiceRecognition();
  } else {
    startVoiceRecognition();
  }
}

function startVoiceRecognition() {
  // Auto-detect language from current mode or default to English
  const lang = state.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
  state.recognition.lang = lang;
  state.recognition.start();
}

function stopVoiceRecognition() {
  if (state.recognition) {
    state.recognition.stop();
  }
}

// Toggle AI Mode
function toggleAIMode() {
  console.log('toggleAIMode called, current mode:', state.mode);
  state.mode = state.mode === 'search' ? 'ai' : 'search';
  console.log('New mode:', state.mode);
  updateModeUI();

  // Show AI chat interface immediately when enabling AI mode
  if (state.mode === 'ai') {
    showAIChatInterface();
  } else {
    // Return to home if in home state, or show search results if in results state
    if (document.body.classList.contains('chat-state')) {
      returnToHome();
    }
  }
}

function updateModeUI() {
  const isAIMode = state.mode === 'ai';
  console.log('updateModeUI called, isAIMode:', isAIMode);

  // Update button states
  elements.aiToggle.classList.toggle('active', isAIMode);
  elements.compactAiToggle.classList.toggle('active', isAIMode);
  console.log('Button active classes toggled');

  // Update mode text
  const modeText = isAIMode ? 'AI Assistant' : 'Search Mode';
  elements.modeText.textContent = modeText;
  elements.compactModeText.textContent = modeText;
  console.log('Mode text updated to:', modeText);

  // Update placeholder
  const placeholder = isAIMode ? 'Ask me anything...' : 'Search or ask me anything...';
  elements.searchInput.placeholder = placeholder;
  elements.compactSearchInput.placeholder = placeholder;
  console.log('Placeholder updated to:', placeholder);

  // Toggle compact header elements visibility in AI mode
  if (document.body.classList.contains('chat-state')) {
    elements.compactSearchWrapper.classList.toggle('hidden', isAIMode);
    elements.modeSwitcherBtn.classList.toggle('hidden', !isAIMode);
    console.log('Compact header visibility toggled (chat-state)');
  }

  console.log('updateModeUI complete');
}

// Show AI Chat Interface Immediately
function showAIChatInterface() {
  // Switch to chat state
  document.body.classList.remove('home-state', 'results-state');
  document.body.classList.add('chat-state');

  // Show content container and chat section
  elements.contentContainer.classList.remove('hidden');
  elements.searchResultsSection.classList.add('hidden');
  elements.chatSection.classList.remove('hidden');

  // Update header visibility
  elements.compactSearchWrapper.classList.add('hidden');
  elements.modeSwitcherBtn.classList.remove('hidden');

  console.log('AI chat interface shown');
}

// Switch back to search mode from AI mode
function switchToSearchMode() {
  if (state.mode === 'ai') {
    state.mode = 'search';
    updateModeUI();

    // Switch to search results view or home
    document.body.classList.remove('chat-state');
    elements.chatSection.classList.add('hidden');

    // If there are search results, show them; otherwise go home
    if (!elements.resultsContainer.classList.contains('hidden')) {
      document.body.classList.add('results-state');
      elements.searchResultsSection.classList.remove('hidden');
    } else {
      returnToHome();
    }

    // Show search box again
    elements.compactSearchWrapper.classList.remove('hidden');
    elements.modeSwitcherBtn.classList.add('hidden');
  }
}

// Setup Logo Navigation to Homepage
function setupLogoNavigation() {
  const logos = document.querySelectorAll('.logo, .compact-logo');
  logos.forEach(logo => {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', returnToHome);
  });
}

// Setup Language Dropdown
function setupLanguageToggle() {
  const selectorBtn = document.getElementById('lang-selector-btn');
  const dropdown = document.getElementById('lang-dropdown');
  const options = document.querySelectorAll('.lang-dropdown-option');

  if (!selectorBtn || !dropdown) return;

  // Toggle dropdown on button click
  selectorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // Handle language selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      setResourceLanguage(lang);
      dropdown.classList.add('hidden');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!selectorBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function setResourceLanguage(lang) {
  state.selectedResourceLanguage = lang;

  // Update dropdown button text
  const selectedText = document.getElementById('selected-lang-text');
  if (selectedText) {
    selectedText.textContent = lang === 'en' ? 'English' : 'हिंदी';
  }

  // Update active state in dropdown
  document.querySelectorAll('.lang-dropdown-option').forEach(option => {
    option.classList.toggle('active', option.dataset.lang === lang);
  });

  console.log(`Resource language set to: ${lang}`);
}

// Return to Homepage
function returnToHome() {
  // Reset to home state
  document.body.classList.remove('results-state', 'chat-state');
  document.body.classList.add('home-state');

  // Hide content container
  elements.contentContainer.classList.add('hidden');

  // Clear inputs
  elements.searchInput.value = '';
  elements.compactSearchInput.value = '';
  elements.chatInput.value = '';

  // Reset mode to search
  if (state.mode === 'ai') {
    state.mode = 'search';
    updateModeUI();
  }

  // Clear conversation history
  state.conversationHistory = [];

  console.log('Returned to homepage');
}

// Handle Search/Chat Submit
async function handleSearch(e) {
  e.preventDefault();

  const query = elements.searchInput.value.trim();
  if (!query) return;

  // Detect language from input
  state.currentLanguage = detectLanguage(query);

  // Switch to results state
  document.body.classList.remove('home-state');
  document.body.classList.add(state.mode === 'ai' ? 'chat-state' : 'results-state');
  elements.contentContainer.classList.remove('hidden');

  // Update header visibility for AI mode
  if (state.mode === 'ai') {
    elements.compactSearchWrapper.classList.add('hidden');
    elements.modeSwitcherBtn.classList.remove('hidden');
  }

  if (state.mode === 'ai') {
    await handleAIChat(query);
  } else {
    await handleSearchQuery(query);
  }
}

// Detect Language (simple heuristic)
function detectLanguage(text) {
  const devanagariPattern = /[\u0900-\u097F]/;
  return devanagariPattern.test(text) ? 'hi' : 'en';
}

// Handle Search Query
async function handleSearchQuery(query) {
  // Show search results section
  elements.searchResultsSection.classList.remove('hidden');
  elements.chatSection.classList.add('hidden');

  // Show loading
  elements.loadingState.classList.remove('hidden');
  elements.resultsContainer.classList.add('hidden');
  elements.noResultsState.classList.add('hidden');

  try {
    const response = await fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        resourceLanguage: state.selectedResourceLanguage // NEW
      })
    });

    const data = await response.json();

    // Hide loading
    elements.loadingState.classList.add('hidden');

    if (data.results && data.results.length > 0) {
      displaySearchResults(data.results);
    } else {
      elements.noResultsState.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Search error:', error);
    elements.loadingState.classList.add('hidden');
    elements.noResultsState.classList.remove('hidden');
  }
}

// Display Search Results
function displaySearchResults(results) {
  elements.resultsContainer.classList.remove('hidden');
  elements.resultCount.textContent = `${results.length} results`;

  elements.resultsList.innerHTML = results.map((result, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 0.1}s`;

    // Add data attributes for PDF preview
    if (result.resourceType === 'pdf') {
      card.dataset.resourceType = 'pdf';
      card.dataset.resourceId = result.chunkId; // Using chunkId as proxy for resourceId if not directly available, but better to ensure we have resourceId
      // Note: In search.js, formatResult uses chunkData.resourceId for image, let's ensure we have it for PDF too.
      // Looking at search.js, formatResult for PDF doesn't explicitly include resourceId in the returned object, 
      // but it spreads 'base' which has chunkId. We might need to update search.js to include resourceId if it's different.
      // However, looking at search.js:28 for image it uses chunkData.resourceId.
      // Let's assume we can pass the whole result object to the click handler.

      // We'll attach the click listener after rendering
      card.onclick = () => showPDFPreview(result);
    }

    card.innerHTML = `
            <div class="result-type-badge">${result.resourceType}</div>
            <div class="result-meta">
                <span><strong>File:</strong> ${result.resourceName}</span>
                ${result.page ? `<span><strong>Page:</strong> ${result.page}</span>` : ''}
                ${result.timestamp ? `<span><strong>Time:</strong> ${result.timestamp}</span>` : ''}
                <span class="language-tag">${result.language.toUpperCase()}</span>
            </div>
            <div class="result-text" lang="${result.language}">${highlightQuery(result.text, elements.searchInput.value)}</div>
        `;

    return card.outerHTML;
  }).join('');

  // Re-attach event listeners because innerHTML string injection kills them
  // We need to select the cards again
  const cards = elements.resultsList.querySelectorAll('.result-card');
  cards.forEach((card, index) => {
    const result = results[index];
    if (result.resourceType === 'pdf') {
      card.addEventListener('click', () => showPDFPreview(result));
    }
  });
}

// Highlight query in results
function highlightQuery(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background: #fff3cd; padding: 0.1em 0.2em; border-radius: 3px;">$1</mark>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Handle chat form submission (new chat input at bottom)
async function handleChatSubmit(e) {
  e.preventDefault();

  const message = elements.chatInput.value.trim();
  if (!message || state.isAIResponding) return;

  // Detect language from input
  state.currentLanguage = detectLanguage(message);

  // Add user message
  addChatMessage('user', message);

  // Clear input
  elements.chatInput.value = '';

  // Disable input and toggle buttons
  setChatInputState(false);

  // Add typing indicator
  const typingIndicator = addTypingIndicator();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversationHistory: state.conversationHistory,
        resourceLanguage: state.selectedResourceLanguage
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    // Remove typing indicator
    typingIndicator.remove();

    // Handle streaming response
    const reader = response.body.getReader();
    state.currentReader = reader;
    const decoder = new TextDecoder();
    let aiMessage = '';
    let messageElement = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done || !state.isAIResponding) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

      for (const line of lines) {
        try {
          const data = JSON.parse(line.replace('data: ', ''));

          if (data.chunk && !data.done) {
            aiMessage += data.chunk;

            if (!messageElement) {
              messageElement = addChatMessage('ai', aiMessage);
            } else {
              updateChatMessage(messageElement, aiMessage);
            }
          }

          if (data.done) {
            // Update conversation history
            state.conversationHistory.push(
              { role: 'user', content: message },
              { role: 'assistant', content: data.fullResponse || aiMessage }
            );

            // Update language if detected
            if (data.detectedLanguage) {
              state.currentLanguage = data.detectedLanguage;
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('AI response stopped by user');
    } else {
      console.error('Chat error:', error);
      addChatMessage('ai', 'Sorry, I encountered an error. Please make sure Ollama is running and try again.');
    }
    typingIndicator.remove();
  } finally {
    // Re-enable input and toggle buttons back
    setChatInputState(true);
    state.currentReader = null;
    state.abortController = null;
  }
}

// Set chat input and button states
function setChatInputState(enabled) {
  state.isAIResponding = !enabled;
  elements.chatInput.disabled = !enabled;

  if (enabled) {
    // Show send button, hide stop button
    elements.sendBtn.classList.remove('hidden');
    elements.stopBtn.classList.add('hidden');
  } else {
    // Hide send button, show stop button
    elements.sendBtn.classList.add('hidden');
    elements.stopBtn.classList.remove('hidden');
  }
}

// Stop AI response
function stopAIResponse() {
  state.isAIResponding = false;

  // Abort the fetch request if it exists
  if (state.abortController) {
    state.abortController.abort();
    state.abortController = null;
  }

  // Cancel the stream reader if it exists
  if (state.currentReader) {
    state.currentReader.cancel();
    state.currentReader = null;
  }

  // Remove typing indicator if it exists
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }

  // Re-enable input
  setChatInputState(true);
}

// Handle AI Chat (from main search box)
async function handleAIChat(message) {
  // Show chat section
  elements.searchResultsSection.classList.add('hidden');
  elements.chatSection.classList.remove('hidden');

  // Add user message
  addChatMessage('user', message);

  // Add typing indicator
  const typingIndicator = addTypingIndicator();

  // Clear input
  elements.searchInput.value = '';
  elements.compactSearchInput.value = '';

  // Disable chat input temporarily
  setChatInputState(false);

  try {
    // Create new AbortController
    state.abortController = new AbortController();

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: state.abortController.signal,
      body: JSON.stringify({
        message,
        conversationHistory: state.conversationHistory,
        resourceLanguage: state.selectedResourceLanguage
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    // Remove typing indicator
    typingIndicator.remove();

    // Handle streaming response
    const reader = response.body.getReader();
    state.currentReader = reader;
    const decoder = new TextDecoder();
    let aiMessage = '';
    let messageElement = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done || !state.isAIResponding) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

      for (const line of lines) {
        try {
          const data = JSON.parse(line.replace('data: ', ''));

          if (data.chunk && !data.done) {
            aiMessage += data.chunk;

            if (!messageElement) {
              messageElement = addChatMessage('ai', aiMessage);
            } else {
              updateChatMessage(messageElement, aiMessage);
            }
          }

          if (data.done) {
            // Update conversation history
            state.conversationHistory.push(
              { role: 'user', content: message },
              { role: 'assistant', content: data.fullResponse || aiMessage }
            );

            // Update language if detected
            if (data.detectedLanguage) {
              state.currentLanguage = data.detectedLanguage;
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('AI response stopped by user');
    } else {
      console.error('Chat error:', error);
      addChatMessage('ai', 'Sorry, I encountered an error. Please make sure Ollama is running and try again.');
    }
    typingIndicator.remove();
  } finally {
    // Re-enable chat input
    setChatInputState(true);
    state.currentReader = null;
    state.abortController = null;
  }
}

// Add Chat Message
function addChatMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${role}`;
  avatar.innerHTML = role === 'user'
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73a2 2 0 0 1-1-1.73 2 2 0 0 1 2-2Z"></path></svg>';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.lang = state.currentLanguage;
  bubble.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);

  // Remove welcome message if exists
  const welcomeMsg = elements.chatMessages.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  elements.chatMessages.appendChild(messageDiv);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

  return messageDiv;
}

// Update Chat Message (for streaming)
function updateChatMessage(messageElement, content) {
  const bubble = messageElement.querySelector('.message-bubble');
  bubble.textContent = content;
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Add Typing Indicator
function addTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message ai';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar ai';
  avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73a2 2 0 0 1-1-1.73 2 2 0 0 1 2-2Z"></path></svg>';

  const typingDiv = document.createElement('div');
  typingDiv.className = 'message-bubble';
  typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(typingDiv);
  elements.chatMessages.appendChild(messageDiv);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

  return messageDiv;
}

// Check Ollama Status
async function checkOllamaStatus() {
  try {
    const response = await fetch('/chat/status');
    const data = await response.json();

    if (!data.running) {
      console.warn('Ollama is not running. AI features may not work.');
    }
  } catch (error) {
    console.warn('Could not check Ollama status:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// PDF Preview Functions
function showPDFPreview(result) {
  console.log('Opening PDF preview for:', result);

  // Populate modal data
  elements.modalBookName.textContent = result.resourceName;

  if (result.page) {
    elements.modalPageBadge.textContent = `Page ${result.page}`;
    elements.modalPageBadge.classList.remove('hidden');
  } else {
    elements.modalPageBadge.classList.add('hidden');
  }

  // Highlight query in preview text
  elements.modalPreviewText.innerHTML = highlightQuery(result.text, elements.searchInput.value);

  // Setup Continue Reading button
  elements.continueReadingBtn.onclick = () => openPDFAtPage(result);

  // Show modal
  elements.pdfModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hidePDFPreview() {
  elements.pdfModal.classList.add('hidden');
  document.body.style.overflow = ''; // Restore scrolling
}

function openPDFAtPage(result) {
  // Construct URL with page fragment
  // We need the resource ID. In search.js formatResult, we need to ensure resourceId is passed.
  // Currently formatResult returns chunkId. Let's verify if we have resourceId.
  // If not, we might need to fetch it or use chunkId if it maps 1:1 (it doesn't).
  // Wait, in search.js: chunkData has resourceId.
  // We need to make sure search.js returns resourceId in the result object.

  // Assuming search.js is updated to include resourceId, or we use a workaround.
  // Let's check search.js again. It returns chunkId, resourceType, resourceName.
  // It does NOT return resourceId for PDF in the current code!
  // We need to update search.js to include resourceId.

  const resourceId = result.resourceId || result.chunkId; // Fallback, but might be wrong
  const page = result.page || 1;

  const url = `/resource/pdf/${resourceId}#page=${page}`;
  window.open(url, '_blank');
}

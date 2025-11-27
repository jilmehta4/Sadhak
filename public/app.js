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
  currentLanguage: 'en'
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

  // Voice indicator
  voiceIndicator: document.getElementById('voice-indicator'),
  stopVoiceBtn: document.getElementById('stop-voice')
};

// Initialize Application
function init() {
  setupEventListeners();
  initializeVoiceRecognition();
  checkOllamaStatus();
}

// Event Listeners
function setupEventListeners() {
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
  elements.aiToggle.addEventListener('click', toggleAIMode);
  elements.compactAiToggle.addEventListener('click', toggleAIMode);
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
  state.mode = state.mode === 'search' ? 'ai' : 'search';
  updateModeUI();
}

function updateModeUI() {
  const isAIMode = state.mode === 'ai';

  // Update button states
  elements.aiToggle.classList.toggle('active', isAIMode);
  elements.compactAiToggle.classList.toggle('active', isAIMode);

  // Update mode text
  const modeText = isAIMode ? 'AI Assistant' : 'Search Mode';
  elements.modeText.textContent = modeText;
  elements.compactModeText.textContent = modeText;

  // Update placeholder
  const placeholder = isAIMode ? 'Ask me anything...' : 'Search or ask me anything...';
  elements.searchInput.placeholder = placeholder;
  elements.compactSearchInput.placeholder = placeholder;
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
      body: JSON.stringify({ query })
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

// Handle AI Chat
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

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        conversationHistory: state.conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    // Remove typing indicator
    typingIndicator.remove();

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';
    let messageElement = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

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
    console.error('Chat error:', error);
    typingIndicator.remove();
    addChatMessage('ai', 'Sorry, I encountered an error. Please make sure Ollama is running and try again.');
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

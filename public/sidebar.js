/**
 * Sidebar functionality for AI mode - Collapsible Design
 */

// Sidebar state
const sidebarState = {
    isCollapsed: false, // Start expanded by default
    currentChatId: null
};

// Sidebar DOM elements
const sidebarElements = {
    sidebar: document.getElementById('sidebar-menu'),
    overlay: document.getElementById('sidebar-overlay'),
    toggleBtn: document.getElementById('sidebar-toggle-btn'),
    newChatBtn: document.getElementById('sidebar-new-chat-btn'),
    historyList: document.getElementById('sidebar-history-list')
};

// Initialize sidebar
function initSidebar() {
    if (!sidebarElements.sidebar) return;

    // Check authentication state and update sidebar visibility
    updateSidebarAuthState();

    // Load saved sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebarElements.sidebar.classList.add('collapsed');
        sidebarState.isCollapsed = true;
    }

    // Toggle sidebar
    if (sidebarElements.toggleBtn) {
        sidebarElements.toggleBtn.addEventListener('click', toggleSidebar);
    }

    // New chat from sidebar
    if (sidebarElements.newChatBtn) {
        sidebarElements.newChatBtn.addEventListener('click', () => {
            // Stop AI if responding
            if (typeof stopAIResponse === 'function') {
                stopAIResponse();
            }
            startNewChat();
        });
    }

    // Close sidebar on overlay click (mobile)
    if (sidebarElements.overlay) {
        sidebarElements.overlay.addEventListener('click', collapseSidebar);
    }

    // Load chat history if user is logged in
    loadChatHistory();

    // Listen for authentication state changes
    window.addEventListener('auth-state-changed', updateSidebarAuthState);
}

// Update sidebar visibility based on authentication state
function updateSidebarAuthState() {
    const chatSection = document.querySelector('.chat-section');

    // Check if authState exists (from auth.js)
    if (typeof authState !== 'undefined' && authState.currentUser) {
        // User is logged in - show sidebar
        sidebarElements.sidebar?.classList.remove('auth-hidden');
        chatSection?.classList.remove('sidebar-hidden');
    } else {
        // User is not logged in - hide sidebar completely
        sidebarElements.sidebar?.classList.add('auth-hidden');
        chatSection?.classList.add('sidebar-hidden');
    }
}



// Toggle sidebar expanded/collapsed
function toggleSidebar() {
    sidebarState.isCollapsed = !sidebarState.isCollapsed;
    const chatSection = document.querySelector('.chat-section');

    if (sidebarState.isCollapsed) {
        // Collapse to icon-only (60px)
        sidebarElements.sidebar?.classList.add('collapsed');
        sidebarElements.overlay?.classList.remove('active');
    } else {
        // Expand to full width (260px)
        sidebarElements.sidebar?.classList.remove('collapsed');

        // Show overlay only on mobile
        if (window.innerWidth <= 768) {
            sidebarElements.overlay?.classList.add('active');
            sidebarElements.overlay?.classList.remove('hidden');
        }
    }

    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', sidebarState.isCollapsed);
}

// Collapse sidebar (used for mobile overlay click)
function collapseSidebar() {
    sidebarState.isCollapsed = true;
    sidebarElements.sidebar?.classList.add('collapsed');
    sidebarElements.overlay?.classList.remove('active');
    sidebarElements.overlay?.classList.add('hidden');

    // Save state
    localStorage.setItem('sidebarCollapsed', true);
}

// Start a new chat
function startNewChat() {
    // Clear current messages
    if (typeof elements !== 'undefined' && elements.chatMessages) {
        elements.chatMessages.innerHTML = `
            <div class="welcome-message">
                <svg class="ai-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path
                        d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73a2 2 0 0 1-1-1.73 2 2 0 0 1 2-2Z">
                    </path>
                </svg>
                <h2>AI Assistant</h2>
                <p>Ask me anything in English or Hindi</p>
            </div>
        `;
    }

    // Clear conversation history
    if (typeof state !== 'undefined') {
        state.conversationHistory = [];
    }
    sidebarState.currentChatId = null;

    // Clear input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }

    // Remove active state from all history items
    document.querySelectorAll('.sidebar-history-item').forEach(item => {
        item.classList.remove('active');
    });

    // Collapse sidebar on mobile
    if (window.innerWidth <= 768) {
        collapseSidebar();
    }

    console.log('Started new chat');
}

// Load chat history
async function loadChatHistory() {
    try {
        // const response = await fetch('/history', {
        //     credentials: 'include'
        // });
        const response = await fetch('/history',);

        if (!response.ok) {
            // User not logged in or error
            showEmptyHistory();
            return;
        }

        const data = await response.json();

        if (data.success && data.history && data.history.length > 0) {
            renderChatHistory(data.history);
        } else {
            showEmptyHistory();
        }

    } catch (error) {
        console.error('Failed to load chat history:', error);
        showEmptyHistory();
    }
}

// Render chat history in sidebar
function renderChatHistory(history) {
    if (!sidebarElements.historyList) return;

    sidebarElements.historyList.innerHTML = '';

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'sidebar-history-item';
        historyItem.dataset.historyId = item.id;

        // Get first user message as title
        const firstUserMsg = item.conversation.find(msg => msg.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.substring(0, 40) : 'Untitled chat';

        // Create span for text (hidden when collapsed)
        const textSpan = document.createElement('span');
        textSpan.textContent = title + (title.length >= 40 ? '...' : '');
        historyItem.appendChild(textSpan);

        // Click to load conversation
        historyItem.addEventListener('click', () => loadConversation(item));

        sidebarElements.historyList.appendChild(historyItem);
    });
}

// Show empty history message
function showEmptyHistory() {
    if (!sidebarElements.historyList) return;

    sidebarElements.historyList.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: #5f6368; font-size: 0.875rem;">
            No chat history yet.<br>Start a conversation!
        </div>
    `;
}

// Load a conversation from history
function loadConversation(historyItem) {
    // Clear current messages
    if (typeof elements !== 'undefined' && elements.chatMessages) {
        elements.chatMessages.innerHTML = '';
    }

    // Load conversation history
    if (typeof state !== 'undefined') {
        state.conversationHistory = historyItem.conversation;
    }
    sidebarState.currentChatId = historyItem.id;

    // Render messages
    historyItem.conversation.forEach(msg => {
        if (typeof addChatMessage === 'function') {
            addChatMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
        }
    });

    // Update active state
    document.querySelectorAll('.sidebar-history-item').forEach(item => {
        item.classList.toggle('active', item.dataset.historyId == historyItem.id);
    });

    // Collapse sidebar on mobile
    if (window.innerWidth <= 768) {
        collapseSidebar();
    }

    console.log('Loaded conversation:', historyItem.id);
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
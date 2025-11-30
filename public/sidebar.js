/**
 * Sidebar functionality for AI mode - Gemini Style
 */

// Sidebar state
const sidebarState = {
    isCollapsed: true, // Start collapsed by default (icon-only)
    currentChatId: null
};

// Sidebar DOM elements
const sidebarElements = {
    sidebar: document.getElementById('sidebar-menu'),
    overlay: document.getElementById('sidebar-overlay'),
    toggleBtn: document.getElementById('sidebar-toggle-btn'),
    newChatBtn: document.getElementById('sidebar-new-chat-btn'),
    historyList: document.getElementById('sidebar-history-list'),
    standaloneNewChatBtn: null // Will be created dynamically
};

// Initialize sidebar
function initSidebar() {
    if (!sidebarElements.sidebar) return;

    // Check authentication state and update sidebar visibility
    updateSidebarAuthState();

    // Create standalone New Chat button for non-logged-in users
    createStandaloneNewChatButton();

    // Start with collapsed state (icon-only)
    sidebarElements.sidebar.classList.add('collapsed');
    document.querySelector('.chat-section')?.classList.add('sidebar-collapsed');

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
        // User is logged in - show sidebar (collapsed by default)
        sidebarElements.sidebar?.classList.remove('auth-hidden');
        chatSection?.classList.remove('sidebar-hidden');
        chatSection?.classList.add('sidebar-collapsed');

        // Hide standalone button
        sidebarElements.standaloneNewChatBtn?.classList.add('hidden');
    } else {
        // User is not logged in - hide sidebar completely
        sidebarElements.sidebar?.classList.add('auth-hidden');
        chatSection?.classList.add('sidebar-hidden');
        chatSection?.classList.remove('sidebar-collapsed');

        // Show standalone button
        sidebarElements.standaloneNewChatBtn?.classList.remove('hidden');
    }
}

// Create standalone New Chat button for non-logged-in users
function createStandaloneNewChatButton() {
    sidebarState.isCollapsed = !sidebarState.isCollapsed;
    const chatSection = document.querySelector('.chat-section');

    if (sidebarState.isCollapsed) {
        // Collapse to icon-only (72px)
        sidebarElements.sidebar?.classList.add('collapsed');
        chatSection?.classList.add('sidebar-collapsed');
        sidebarElements.overlay?.classList.remove('active');
    } else {
        // Expand to full width (260px)
        sidebarElements.sidebar?.classList.remove('collapsed');
        chatSection?.classList.remove('sidebar-collapsed');

        // Show overlay only on mobile
        if (window.innerWidth <= 768) {
            sidebarElements.sidebar?.classList.add('expanded');
            sidebarElements.overlay?.classList.add('active');
        }
    }
}

// Collapse sidebar (used for mobile overlay click)
function collapseSidebar() {
    sidebarState.isCollapsed = true;
    sidebarElements.sidebar?.classList.add('collapsed');
    sidebarElements.sidebar?.classList.remove('expanded');
    document.querySelector('.chat-section')?.classList.add('sidebar-collapsed');
    sidebarElements.overlay?.classList.remove('active');
}

// Load chat history
async function loadChatHistory() {
    try {
        const response = await fetch('/history');

        if (!response.ok) {
            // User not logged in or error
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

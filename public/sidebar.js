/**
 * Sidebar functionality for AI mode
 */

// Sidebar state
const sidebarState = {
    isCollapsed: false,
    currentChatId: null
};

// Sidebar DOM elements
const sidebarElements = {
    sidebar: document.getElementById('sidebar-menu'),
    overlay: document.getElementById('sidebar-overlay'),
    toggleBtn: document.getElementById('sidebar-toggle-btn'),
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    newChatBtn: document.getElementById('sidebar-new-chat-btn'),
    historyList: document.getElementById('sidebar-history-list'),
    compactSearch: document.getElementById('compact-header-search'),
    compactSearchInput: document.getElementById('compact-header-search-input')
};

// Initialize sidebar
function initSidebar() {
    if (!sidebarElements.sidebar) return;

    // Toggle sidebar
    if (sidebarElements.toggleBtn) {
        sidebarElements.toggleBtn.addEventListener('click', toggleSidebar);
    }

    if (sidebarElements.menuToggleBtn) {
        sidebarElements.menuToggleBtn.addEventListener('click', toggleSidebar);
    }

    // New chat from sidebar
    if (sidebarElements.newChatBtn) {
        sidebarElements.newChatBtn.addEventListener('click', startNewChat);
    }

    // Close sidebar on overlay click (mobile)
    if (sidebarElements.overlay) {
        sidebarElements.overlay.addEventListener('click', closeSidebar);
    }

    // Compact header search
    if (sidebarElements.compactSearchInput) {
        sidebarElements.compactSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCompactSearch();
            }
        });
    }

    // Load chat history if user is logged in
    loadChatHistory();
}

// Toggle sidebar
function toggleSidebar() {
    sidebarState.isCollapsed = !sidebarState.isCollapsed;

    if (sidebarState.isCollapsed) {
        sidebarElements.sidebar.classList.add('hidden');
        sidebarElements.overlay.classList.add('hidden');
        document.body.classList.add('sidebar-collapsed');
    } else {
        sidebarElements.sidebar.classList.remove('hidden');
        // Show overlay only on mobile
        if (window.innerWidth <= 768) {
            sidebarElements.overlay.classList.remove('hidden');
        }
        document.body.classList.remove('sidebar-collapsed');
    }
}

// Close sidebar
function closeSidebar() {
    sidebarState.isCollapsed = true;
    sidebarElements.sidebar.classList.add('hidden');
    sidebarElements.overlay.classList.add('hidden');
    document.body.classList.add('sidebar-collapsed');
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
        const title = firstUserMsg ? firstUserMsg.content.substring(0, 50) : 'Untitled chat';

        historyItem.textContent = title + (title.length >= 50 ? '...' : '');

        // Click to load conversation
        historyItem.addEventListener('click', () => loadConversation(item));

        sidebarElements.historyList.appendChild(historyItem);
    });
}

// Show empty history message
function showEmptyHistory() {
    if (!sidebarElements.historyList) return;

    sidebarElements.historyList.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--text-medium); font-size: 0.875rem;">
            No chat history yet.<br>Start a conversation!
        </div>
    `;
}

// Load a conversation from history
function loadConversation(historyItem) {
    // Clear current messages
    elements.chatMessages.innerHTML = '';

    // Load conversation history
    state.conversationHistory = historyItem.conversation;
    sidebarState.currentChatId = historyItem.id;

    // Render messages
    historyItem.conversation.forEach(msg => {
        addChatMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
    });

    // Update active state
    document.querySelectorAll('.sidebar-history-item').forEach(item => {
        item.classList.toggle('active', item.dataset.historyId == historyItem.id);
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }

    console.log('Loaded conversation:', historyItem.id);
}

// Handle compact header search
function handleCompactSearch() {
    const query = sidebarElements.compactSearchInput.value.trim();

    if (!query) return;

    // Use existing search functionality
    elements.searchInput.value = query;
    elements.compactSearchInput.value = query;

    handleSearch(new Event('submit'));
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}

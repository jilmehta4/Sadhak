#!/usr/bin/env python3
"""
Script to add New Chat button functionality to app.js
"""

import re
from pathlib import Path

def add_new_chat_function():
    js_path = Path(__file__).parent / 'public' / 'app.js'
    
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add newChatBtn to elements object
    content = content.replace(
        "  stopBtn: document.getElementById('stop-btn')",
        "  stopBtn: document.getElementById('stop-btn'),\n  newChatBtn: document.getElementById('new-chat-btn')"
    )
    
    # 2. Add event listener in setupEventListeners
    content = content.replace(
        "  // Stop AI response\n  elements.stopBtn.addEventListener('click', stopAIResponse);",
        "  // Stop AI response\n  elements.stopBtn.addEventListener('click', stopAIResponse);\n\n  // New Chat button\n  if (elements.newChatBtn) {\n    elements.newChatBtn.addEventListener('click', startNewChat);\n  }"
    )
    
    # 3. Add startNewChat function before init()
    new_chat_function = '''
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

'''
    
    # Add before // Initialize Application
    content = content.replace(
        '// Initialize Application',
        new_chat_function + '// Initialize Application'
    )
    
    # Write back
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ app.js updated successfully!")
    print("  - Added newChatBtn to elements")
    print("  - Added event listener for New Chat button")
    print("  - Added startNewChat() function")

if __name__ == '__main__':
    add_new_chat_function()

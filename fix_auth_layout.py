#!/usr/bin/env python3
"""
Script to fix auth UI layout - move Sign In to top-right
"""

import re
from pathlib import Path

def fix_auth_layout():
    html_path = Path(__file__).parent / 'public' / 'index.html'
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove Sign In button and user menu from logo section
    # Find and remove the auth buttons from logo section
    pattern = r'      <!-- Sign In Button -->.*?<!-- Language Selector Dropdown -->'
    content = re.sub(pattern, '      <!-- Language Selector Dropdown -->', content, flags=re.DOTALL)
    
    # 2. Add auth buttons to a new top-right header section
    # Add right after opening body tag
    header_html = '''
  <!-- Top Right Auth Section -->
  <div class="top-right-auth">
    <!-- Sign In Button -->
    <button type="button" class="sign-in-btn" id="sign-in-btn">Sign In</button>
    
    <!-- User Menu (shown when logged in) -->
    <div class="user-menu" id="user-menu">
      <button type="button" class="user-menu-btn" id="user-menu-btn">
        <div class="user-avatar" id="user-avatar">U</div>
        <span id="user-display-name">User</span>
      </button>
      <div class="user-menu-dropdown" id="user-menu-dropdown">
        <div class="user-menu-item" id="menu-profile">My Profile</div>
        <div class="user-menu-item" id="menu-history">Chat History</div>
        <div class="user-menu-item" id="menu-purchases">My Documents</div>
        <div class="user-menu-item danger" id="menu-logout">Sign Out</div>
      </div>
    </div>
  </div>

'''
    
    content = content.replace('<body class="home-state">', '<body class="home-state">' + header_html)
    
    # 3. Add New Chat button to compact header (for AI mode)
    new_chat_btn = '''
      <!-- New Chat Button (AI Mode) -->
      <button type="button" id="new-chat-btn" class="new-chat-btn hidden" aria-label="Start new chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>New Chat</span>
      </button>

'''
    
    # Add after mode-switcher-btn
    content = content.replace(
        '      </button>\n\n      <div class="compact-search-wrapper"',
        '      </button>\n' + new_chat_btn + '      <div class="compact-search-wrapper"'
    )
    
    # Write back
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ HTML layout updated successfully!")
    print("  - Moved Sign In button to top-right")
    print("  - Moved user menu to top-right")
    print("  - Added New Chat button for AI mode")

if __name__ == '__main__':
    fix_auth_layout()

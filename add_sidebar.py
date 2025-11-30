#!/usr/bin/env python3
"""
Script to add sidebar menu and update compact header
"""

import re
from pathlib import Path

def add_sidebar():
    html_path = Path(__file__).parent / 'public' / 'index.html'
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add sidebar HTML after opening body tag (after top-right-auth)
    sidebar_html = '''
  <!-- Sidebar Menu (AI Mode) -->
  <div class="sidebar-menu hidden" id="sidebar-menu">
    <div class="sidebar-header">
      <button type="button" class="sidebar-toggle-btn" id="sidebar-toggle-btn" aria-label="Toggle sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <button type="button" class="sidebar-new-chat-btn" id="sidebar-new-chat-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>New chat</span>
      </button>
    </div>
    
    <div class="sidebar-content">
      <div class="sidebar-section-title">Recent</div>
      <div class="sidebar-history-list" id="sidebar-history-list">
        <!-- Chat history items will be inserted here -->
      </div>
    </div>
    
    <div class="sidebar-footer">
      <button type="button" class="sidebar-settings-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m5.196-15.804L13.5 6.893m-3 3L7.804 6.196M1 12h6m6 0h6m-15.804 5.196L6.893 13.5m3 3l-3.697 3.697M12 1v6m0 6v6"></path>
        </svg>
        <span>Settings & help</span>
      </button>
    </div>
  </div>

  <!-- Sidebar Overlay (for mobile) -->
  <div class="sidebar-overlay hidden" id="sidebar-overlay"></div>

'''
    
    # Add after top-right-auth
    content = content.replace(
        '  </div>\n\n  <!-- Home',
        '  </div>\n' + sidebar_html + '  <!-- Home'
    )
    
    # 2. Replace "Search Mode" button with search textbox in compact header
    # Find the mode-switcher-btn and replace it
    old_mode_switcher = r'      <button type="button" id="mode-switcher-btn" class="mode-switcher-btn hidden" aria-label="Switch to search mode">.*?</button>'
    
    new_search_box = '''      <!-- Compact Search Box (for results view) -->
      <div class="compact-header-search hidden" id="compact-header-search">
        <svg class="search-icon-compact" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" class="compact-header-search-input" id="compact-header-search-input" placeholder="Search..." />
      </div>
      
      <!-- Menu Toggle Button (AI Mode) -->
      <button type="button" id="menu-toggle-btn" class="menu-toggle-btn hidden" aria-label="Toggle menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>'''
    
    content = re.sub(old_mode_switcher, new_search_box, content, flags=re.DOTALL)
    
    # Write back
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ HTML updated successfully!")
    print("  - Added collapsible sidebar menu")
    print("  - Replaced Search Mode button with search textbox")
    print("  - Added menu toggle button for AI mode")

if __name__ == '__main__':
    add_sidebar()

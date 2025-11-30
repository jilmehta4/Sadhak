#!/usr/bin/env python3
"""
Properly add sidebar HTML to index.html
"""
from pathlib import Path

html_path = Path(__file__).parent / 'public' / 'index.html'
content = html_path.read_text(encoding='utf-8')

# Check if sidebar already exists
if 'sidebar-menu' in content:
    print("ℹ️  Sidebar HTML already exists")
else:
    # Add sidebar HTML after opening body tag
    sidebar_html = '''
  <!-- Sidebar Menu (AI Mode) -->
  <div class="sidebar-menu" id="sidebar-menu">
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
    
    # Find <body class="home-state"> and add sidebar after it
    content = content.replace('<body class="home-state">', '<body class="home-state">' + sidebar_html)
    
    html_path.write_text(content, encoding='utf-8')
    print("✅ Added sidebar HTML to index.html")

if __name__ == '__main__':
    pass

#!/usr/bin/env python3
"""
Script to update index.html with language selector dropdown
and remove old language toggles.
"""

import re
from pathlib import Path

def update_html():
    html_path = Path(__file__).parent / 'public' / 'index.html'
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace tagline with language selector dropdown
    tagline_pattern = r'<p class="tagline">Search & Discover</p>'
    language_selector = '''
      <!-- Language Selector Dropdown -->
      <div class="language-selector">
        <button type="button" class="lang-selector-btn" id="lang-selector-btn" aria-label="Select language">
          <svg class="globe-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span class="selected-lang-text" id="selected-lang-text">English</span>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <div class="lang-dropdown hidden" id="lang-dropdown">
          <div class="lang-dropdown-option active" data-lang="en">
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>English</span>
          </div>
          <div class="lang-dropdown-option" data-lang="hi">
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>हिंदी</span>
          </div>
        </div>
      </div>'''
    
    content = re.sub(tagline_pattern, language_selector, content)
    
    # 2. Remove language toggle from main search box
    main_toggle_pattern = r'\s*<!-- Language Toggle -->\s*<div class="language-toggle">.*?</div>\s*(?=</form>)'
    content = re.sub(main_toggle_pattern, '\n\n      ', content, flags=re.DOTALL)
    
    # 3. Remove language toggle from compact header
    compact_toggle_pattern = r'\s*<!-- Language Toggle -->\s*<div class="language-toggle">.*?</div>\s*(?=\s*</form>)'
    content = re.sub(compact_toggle_pattern, '\n\n          ', content, flags=re.DOTALL)
    
    # Write back
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ HTML updated successfully!")
    print("  - Replaced tagline with language selector dropdown")
    print("  - Removed old language toggle from main search box")
    print("  - Removed old language toggle from compact header")

if __name__ == '__main__':
    update_html()

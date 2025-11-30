#!/usr/bin/env python3
"""
Script to add auth modal and Sign In button to index.html
"""

import re
from pathlib import Path

def update_index_html():
    html_path = Path(__file__).parent / 'public' / 'index.html'
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add auth-modal.css to head (after style.css)
    if 'auth-modal.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="style.css">',
            '<link rel="stylesheet" href="style.css">\n  <link rel="stylesheet" href="auth-modal.css">'
        )
    
    # 2. Add Sign In button to logo section (before language selector)
    sign_in_btn = '''      <!-- Sign In Button -->
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
      
'''
    
    if 'sign-in-btn' not in content:
        # Add before language selector
        content = content.replace(
            '      <!-- Language Selector Dropdown -->',
            sign_in_btn + '      <!-- Language Selector Dropdown -->'
        )
    
    # 3. Add auth modal HTML before closing body tag
    auth_modal = '''
  <!-- Authentication Modal -->
  <div class="auth-modal-overlay hidden" id="auth-modal-overlay">
    <div class="auth-modal">
      <div class="auth-modal-header">
        <button class="auth-modal-close" id="auth-modal-close">&times;</button>
        <h2 class="auth-modal-title">Log in or sign up</h2>
        <p class="auth-modal-subtitle">You'll get smarter responses and can save your chat history.</p>
      </div>
      
      <div class="auth-modal-body">
        <!-- Error/Success Messages -->
        <div class="auth-error" id="auth-error"></div>
        <div class="auth-success" id="auth-success"></div>
        
        <!-- OAuth Buttons -->
        <div class="oauth-buttons">
          <button class="oauth-btn" id="google-oauth-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
        
        <div class="auth-divider">OR</div>
        
        <!-- Email/Password Form -->
        <form class="auth-form" id="auth-form">
          <div class="auth-input-group">
            <input 
              type="email" 
              class="auth-input" 
              id="auth-email" 
              placeholder="Email address"
              required
            />
          </div>
          
          <!-- Password field (hidden initially) -->
          <div class="auth-input-group" id="password-group" style="display: none;">
            <input 
              type="password" 
              class="auth-input" 
              id="auth-password" 
              placeholder="Password"
              minlength="6"
            />
          </div>
          
          <!-- Display name field (for signup) -->
          <div class="auth-input-group" id="name-group" style="display: none;">
            <input 
              type="text" 
              class="auth-input" 
              id="auth-display-name" 
              placeholder="Display name (optional)"
            />
          </div>
          
          <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  </div>

'''
    
    if 'auth-modal-overlay' not in content:
        # Add before closing body tag
        content = content.replace(
            '  <!-- Scripts -->',
            auth_modal + '  <!-- Scripts -->'
        )
    
    # 4. Add auth.js script (after app.js)
    if 'auth.js' not in content:
        content = content.replace(
            '<script src="app.js"></script>',
            '<script src="app.js"></script>\n  <script src="auth.js"></script>'
        )
    
    # Write back
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ index.html updated successfully!")
    print("  - Added auth-modal.css link")
    print("  - Added Sign In button and user menu")
    print("  - Added auth modal HTML")
    print("  - Added auth.js script")

if __name__ == '__main__':
    update_index_html()

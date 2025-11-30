#!/usr/bin/env python3
"""
Script to add CSS for top-right auth and new chat button
"""

from pathlib import Path

def add_layout_css():
    css_path = Path(__file__).parent / 'public' / 'auth-modal.css'
    
    new_css = '''
/* ========================================
   TOP-RIGHT AUTH SECTION
   ======================================== */

/* Top Right Container */
.top-right-auth {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Override Sign In Button positioning */
.top-right-auth .sign-in-btn {
  margin: 0;
}

/* Override User Menu positioning */
.top-right-auth .user-menu {
  margin: 0;
}

/* ========================================
   NEW CHAT BUTTON
   ======================================== */

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1.5px solid var(--purple-primary);
  border-radius: 22px;
  color: var(--purple-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 40px;
}

.new-chat-btn:hover {
  background: var(--purple-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(81, 45, 124, 0.2);
}

.new-chat-btn:active {
  transform: translateY(0);
}

.new-chat-btn.hidden {
  display: none;
}

.new-chat-btn svg {
  flex-shrink: 0;
}

/* Show New Chat button in AI mode */
.ai-state .new-chat-btn {
  display: flex;
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
   ======================================== */

@media (max-width: 768px) {
  .top-right-auth {
    top: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .top-right-auth {
    top: 0.75rem;
    right: 0.75rem;
    gap: 0.5rem;
  }
  
  .top-right-auth .sign-in-btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
  
  .top-right-auth .user-menu-btn {
    padding: 0.5rem 0.75rem;
  }
  
  .top-right-auth .user-avatar {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .new-chat-btn {
    font-size: 0.875rem;
    padding: 0.5rem 0.875rem;
  }
  
  .new-chat-btn span {
    display: none; /* Hide text on mobile, show only icon */
  }
}
'''
    
    # Append to file
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(new_css)
    
    print("✅ CSS updated successfully!")
    print("  - Added top-right auth positioning")
    print("  - Added New Chat button styling")
    print("  - Added mobile responsive adjustments")

if __name__ == '__main__':
    add_layout_css()

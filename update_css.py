#!/usr/bin/env python3
"""
Script to append language selector and mobile responsive CSS to style.css
"""

from pathlib import Path

def append_css():
    css_path = Path(__file__).parent / 'public' / 'style.css'
    
    new_css = '''
/* ========================================
   LANGUAGE SELECTOR DROPDOWN
   ======================================== */

/* Language Selector Container */
.language-selector {
  position: relative;
  margin-top: 1rem;
  display: inline-block;
}

/* Language Selector Button (Pill Shape) */
.lang-selector-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  cursor: pointer;
  transition: all var(--transition-med);
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-dark);
  min-height: 44px; /* Touch target */
}

.lang-selector-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.lang-selector-btn:active {
  transform: translateY(0);
}

/* Icons in button */
.globe-icon {
  color: var(--purple-primary);
  flex-shrink: 0;
}

.chevron-icon {
  color: var(--text-medium);
  flex-shrink: 0;
  transition: transform var(--transition-med);
}

.lang-selector-btn:hover .chevron-icon {
  transform: translateY(2px);
}

.selected-lang-text {
  color: var(--text-dark);
  font-weight: 500;
}

/* Language Dropdown */
.lang-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
  opacity: 1;
  visibility: visible;
  transition: all var(--transition-med);
  max-height: 300px;
  overflow-y: auto;
}

.lang-dropdown.hidden {
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  pointer-events: none;
}

/* Language Dropdown Options */
.lang-dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 48px; /* Touch target */
  font-size: 0.9375rem;
  color: var(--text-dark);
}

.lang-dropdown-option:hover {
  background: rgba(81, 45, 124, 0.08);
}

.lang-dropdown-option.active {
  background: linear-gradient(135deg, var(--purple-primary) 0%, var(--red-accent) 100%);
  color: white;
}

.lang-dropdown-option.active .check-icon {
  opacity: 1;
}

/* Checkmark Icon */
.check-icon {
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
  color: white;
}

.lang-dropdown-option.active .check-icon {
  opacity: 1;
}

.lang-dropdown-option:not(.active) .check-icon {
  opacity: 0;
  width: 18px; /* Reserve space */
}

/* ========================================
   MOBILE RESPONSIVE DESIGN
   ======================================== */

/* Tablet (481px - 768px) */
@media (max-width: 768px) {
  /* Logo */
  .logo {
    font-size: clamp(2.5rem, 6vw, 4rem);
  }

  /* Search wrapper */
  .search-wrapper {
    max-width: 90%;
  }

  /* Compact header */
  .compact-header {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
  }

  .compact-logo {
    font-size: 1.5rem;
  }

  /* Search results */
  .results-list {
    gap: 1rem;
  }

  .result-card {
    padding: 1.25rem;
  }

  /* Chat messages */
  .chat-message {
    max-width: 85%;
  }
}

/* Mobile (≤ 480px) */
@media (max-width: 480px) {
  /* Home state adjustments */
  .home-state #home-container {
    padding: 1rem;
  }

  /* Logo */
  .logo {
    font-size: 2.5rem;
    margin-bottom: 0.25rem;
  }

  .logo-section {
    margin-bottom: 2rem;
  }

  /* Language Selector - Full width on mobile */
  .language-selector {
    width: 100%;
    margin-top: 0.75rem;
  }

  .lang-selector-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .lang-dropdown {
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    min-width: unset;
  }

  .lang-dropdown.hidden {
    transform: translateY(-10px);
  }

  /* Search wrapper */
  .search-wrapper {
    max-width: 100%;
  }

  /* Search box */
  .search-box,
  .compact-search-box {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .search-input {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  /* Icon buttons */
  .icon-btn,
  .voice-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }

  .ai-toggle-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  /* Mode indicator */
  .mode-indicator,
  .compact-mode-indicator {
    font-size: 0.8125rem;
    margin-top: 0.75rem;
  }

  /* Compact header */
  .compact-header {
    padding: 0.75rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .compact-logo {
    font-size: 1.25rem;
    text-align: center;
  }

  .mode-switcher-btn {
    width: 100%;
    justify-content: center;
  }

  .compact-search-wrapper {
    width: 100%;
  }

  /* Search results */
  .results-section {
    padding: 1rem;
  }

  .results-list {
    gap: 0.75rem;
  }

  .result-card {
    padding: 1rem;
  }

  .result-title {
    font-size: 1rem;
  }

  .result-snippet {
    font-size: 0.875rem;
  }

  .result-meta {
    font-size: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Chat section */
  .chat-section {
    padding: 1rem;
  }

  .chat-messages {
    padding: 1rem;
    gap: 1rem;
  }

  .chat-message {
    max-width: 90%;
    gap: 0.5rem;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }

  .message-bubble {
    padding: 0.75rem;
    font-size: 0.9375rem;
  }

  /* Chat input */
  .chat-input-container {
    padding: 1rem;
  }

  .chat-input {
    font-size: 1rem;
    padding: 0.875rem 1rem;
  }

  .send-btn,
  .stop-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
  }

  /* Welcome message */
  .welcome-message {
    padding: 2rem 1rem;
  }

  .ai-icon-large {
    width: 48px;
    height: 48px;
  }

  .welcome-message h2 {
    font-size: 1.5rem;
  }

  .welcome-message p {
    font-size: 0.9375rem;
  }

  /* Modal */
  .modal-content {
    width: 95%;
    max-width: 95%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
    max-height: 60vh;
  }

  .modal-footer {
    padding: 1rem;
  }

  /* PDF Preview */
  .result-preview-image {
    max-height: 200px;
  }
}

/* Extra small devices (≤ 360px) */
@media (max-width: 360px) {
  .logo {
    font-size: 2rem;
  }

  .search-input {
    font-size: 0.9375rem;
  }

  .ai-toggle-btn {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }

  .chat-message {
    max-width: 95%;
  }

  .message-bubble {
    font-size: 0.875rem;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .home-state #home-container {
    min-height: auto;
    padding: 1rem;
  }

  .logo-section {
    margin-bottom: 1rem;
  }

  .logo {
    font-size: 2rem;
  }

  .search-wrapper {
    margin-bottom: 1rem;
  }

  .chat-messages {
    max-height: 40vh;
  }
}
'''
    
    # Append to file
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(new_css)
    
    print("✅ CSS updated successfully!")
    print("  - Added language selector dropdown styles")
    print("  - Added mobile responsive media queries")
    print("  - Added tablet and landscape optimizations")

if __name__ == '__main__':
    append_css()

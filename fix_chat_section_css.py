#!/usr/bin/env python3
"""
Add CSS to make chat-section position relative for sidebar
"""
from pathlib import Path

css_path = Path(__file__).parent / 'public' / 'style.css'
content = css_path.read_text(encoding='utf-8')

# Add position relative to chat-section
css_addition = '''
/* Chat section needs position relative for sidebar */
.chat-section {
  position: relative;
}
'''

if 'Chat section needs position relative' not in content:
    content += css_addition
    css_path.write_text(content, encoding='utf-8')
    print("✅ Added position: relative to chat-section")
else:
    print("ℹ️  CSS already updated")

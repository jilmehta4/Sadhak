#!/usr/bin/env python3
"""
Move sidebar from body level to inside chat-section
"""
import re
from pathlib import Path

html_path = Path(__file__).parent / 'public' / 'index.html'
content = html_path.read_text(encoding='utf-8')

# 1. Extract the sidebar HTML (lines 24-63)
sidebar_pattern = r'  <!-- Sidebar Menu \(AI Mode\) -->.*?  <!-- Sidebar Overlay \(for mobile\) -->.*?</div>\n\n'
sidebar_match = re.search(sidebar_pattern, content, re.DOTALL)

if sidebar_match:
    sidebar_html = sidebar_match.group(0)
    
    # 2. Remove sidebar from body level
    content = content.replace(sidebar_html, '')
    
    # 3. Find chat-section and add sidebar as first child
    # Find: <section id="chat-section" class="chat-section hidden">
    # Add sidebar right after it
    chat_section_pattern = r'(<section id="chat-section" class="chat-section hidden">)\n'
    
    # Indent sidebar HTML properly (add 2 more spaces to each line)
    sidebar_lines = sidebar_html.strip().split('\n')
    indented_sidebar = '\n'.join('  ' + line if line.strip() else line for line in sidebar_lines)
    
    replacement = r'\1\n' + indented_sidebar + '\n\n'
    content = re.sub(chat_section_pattern, replacement, content)
    
    html_path.write_text(content, encoding='utf-8')
    print("✅ Moved sidebar into chat-section")
    print("   Sidebar is now part of the chat interface only")
else:
    print("⚠️  Sidebar HTML not found")

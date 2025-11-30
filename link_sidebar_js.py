#!/usr/bin/env python3
"""
Add sidebar.js script to index.html
"""
from pathlib import Path

html_path = Path(__file__).parent / 'public' / 'index.html'
content = html_path.read_text(encoding='utf-8')

if 'sidebar.js' not in content:
    content = content.replace(
        '<script src="auth.js"></script>',
        '<script src="auth.js"></script>\n  <script src="sidebar.js"></script>'
    )
    html_path.write_text(content, encoding='utf-8')
    print("✅ Added sidebar.js script")
else:
    print("ℹ️  sidebar.js already added")

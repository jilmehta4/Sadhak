#!/usr/bin/env python3
"""
Add sidebar.css link to index.html
"""
from pathlib import Path

html_path = Path(__file__).parent / 'public' / 'index.html'
content = html_path.read_text(encoding='utf-8')

if 'sidebar.css' not in content:
    content = content.replace(
        '<link rel="stylesheet" href="auth-modal.css">',
        '<link rel="stylesheet" href="auth-modal.css">\n  <link rel="stylesheet" href="sidebar.css">'
    )
    html_path.write_text(content, encoding='utf-8')
    print("✅ Added sidebar.css link")
else:
    print("ℹ️  sidebar.css already linked")

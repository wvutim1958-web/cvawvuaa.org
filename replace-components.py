#!/usr/bin/env python3
"""
Replace old header/nav/footer with WVU components in all HTML pages
"""

import re
import os
from pathlib import Path

# List of pages to update
pages = [
    "about.html",
    "alumni-spotlight-submit.html",
    "alumni-spotlight.html",
    "board.html",
    "bylaws.html",
    "contact.html",
    "events.html",
    "media.html",
    "membership.html",
    "minutes.html",
    "news.html",
    "pay.html",
    "programs.html",
    "resources.html",
    "scholarship.html",
    "scores.html",
    "search.html"
]

# Component divs to insert
COMPONENT_HEADER = """    <div id="wvu-masthead"></div>
    <div id="wvu-navigation"></div>"""

COMPONENT_FOOTER = """    <div id="wvu-footer"></div>"""

COMPONENT_LOADER = """    <script src="/includes/component-loader.js"></script>"""

def replace_components(filepath):
    """Replace old header/footer with WVU components"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace old header section (from <header> to </header>)
    # This regex finds the header tag and everything until its closing tag
    header_pattern = r'<header[^>]*>.*?</header>'
    content = re.sub(header_pattern, COMPONENT_HEADER, content, flags=re.DOTALL)
    
    # Replace old footer section
    footer_pattern = r'<footer[^>]*>.*?</footer>'
    content = re.sub(footer_pattern, COMPONENT_FOOTER, content, flags=re.DOTALL)
    
    # Add id="main-content" to <main> tag if not present
    if 'id="main-content"' not in content:
        content = re.sub(r'<main\b(?![^>]*id=)', '<main id="main-content"', content)
    
    # Remove old navigation JavaScript blocks
    # Remove mobile menu toggle code
    content = re.sub(
        r'<script>\s*//\s*Mobile:.*?</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Remove theme toggle code
    content = re.sub(
        r'<script>\s*//\s*Theme toggle.*?</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Remove dropdown.js script tag
    content = re.sub(
        r'<!--\s*Dropdown Navigation\s*-->[\s\n]*<script src="/js/dropdown\.js"></script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Add component loader before </body> if not already present
    if 'component-loader.js' not in content:
        content = content.replace('</body>', f'{COMPONENT_LOADER}\n</body>')
    
    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated {filepath}")
        return True
    else:
        print(f"  ⚠️  No changes needed for {filepath}")
        return False

def main():
    print("🚀 Replacing old header/footer with WVU components...\n")
    
    updated_count = 0
    for page in pages:
        if os.path.exists(page):
            if replace_components(page):
                updated_count += 1
        else:
            print(f"  ❌ File not found: {page}")
    
    print(f"\n✨ Done! Updated {updated_count}/{len(pages)} pages")

if __name__ == "__main__":
    main()

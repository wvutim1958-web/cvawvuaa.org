#!/usr/bin/env python3
"""
Rebuild all HTML pages with proper WVU components structure from index.html
"""

import re
from pathlib import Path

# Proper head template from index.html
HEAD_TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#EEAA00">
  
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <!-- WVU Official Fonts -->
  <link rel="preconnect" href="https://cdn.fonts.net">
  <link href="https://cdn.fonts.net/kit/b339d500-35c3-11ed-aaf7-06b70d83f6b0/b339d500-35c3-11ed-aaf7-06b70d83f6b0.css" rel="stylesheet">

  <link rel="stylesheet" href="/css/styles.min.css">
  <link rel="stylesheet" href="/css/wvu-components.min.css">
  <link rel="stylesheet" href="/css/wvu-cta.min.css">
  <link rel="stylesheet" href="/css/wvu-cards.min.css">
  <link rel="stylesheet" href="/assets/enhanced-styles.css">
  <link rel="stylesheet" href="/css/social-media.min.css">
  
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-G14Q10H6Y2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-G14Q10H6Y2');
  </script>
</head>
<body>

<!-- Skip to main content for accessibility -->
<a href="#main-content" class="skip-to-main">Skip to main content</a>

<!-- WVU Masthead Component -->
<div id="wvu-masthead"></div>

<!-- WVU Primary Navigation Component -->
<div id="wvu-navigation"></div>

'''

# Proper footer template from index.html
FOOTER_TEMPLATE = '''
<div id="wvu-footer"></div>

<!-- Social Media Integration -->
<script src="/js/social-media.min.js"></script>
<script src="/js/theme-toggle.min.js"></script>
<script src="/js/mobile-enhancer.js"></script>

<!-- Load WVU Components (Masthead, Navigation, Footer) -->
<script src="/includes/component-loader.min.js"></script>

</body>
</html>'''

def extract_main_content(html):
    """Extract content between <main and </body>"""
    main_match = re.search(r'(<main[^>]*>.*?</main>)', html, re.DOTALL)
    if main_match:
        return main_match.group(1)
    return None

def extract_title(html):
    """Extract title from head"""
    title_match = re.search(r'<title>(.*?)</title>', html)
    if title_match:
        return title_match.group(1)
    return "CVCWVUAA"

def extract_description(html):
    """Extract meta description"""
    desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
    if desc_match:
        return desc_match.group(1)
    return "Central Virginia Chapter of the WVU Alumni Association"

def rebuild_page(filepath):
    """Rebuild a single page with proper structure"""
    print(f"Processing {filepath.name}...")
    
    try:
        content = filepath.read_text()
        
        # Extract key parts
        title = extract_title(content)
        description = extract_description(content)
        main_content = extract_main_content(content)
        
        if not main_content:
            print(f"  ⚠️  Could not find <main> content in {filepath.name}")
            return False
        
        # Build new page
        new_content = HEAD_TEMPLATE.format(title=title, description=description)
        new_content += main_content
        new_content += FOOTER_TEMPLATE
        
        # Write back
        filepath.write_text(new_content)
        print(f"  ✅ Rebuilt {filepath.name}")
        return True
        
    except Exception as e:
        print(f"  ❌ Error processing {filepath.name}: {e}")
        return False

def main():
    pages_to_fix = [
        'bylaws.html',
        'scores.html',
        'resources.html',
        'media.html',
        'news.html',
        'scholarship.html',
        'programs.html',
        'minutes.html',
        'board.html',
        'contact.html',
        'pay.html',
        'events.html',
        'membership.html',
        'alumni-spotlight.html',
        'alumni-spotlight-submit.html'
    ]
    
    fixed = 0
    for page_name in pages_to_fix:
        page_path = Path(page_name)
        if page_path.exists():
            if rebuild_page(page_path):
                fixed += 1
        else:
            print(f"⚠️  {page_name} not found")
    
    print(f"\n✅ Fixed {fixed}/{len(pages_to_fix)} pages")

if __name__ == '__main__':
    main()

#!/bin/bash

# Script to update all HTML pages with WVU Design System components
# Date: October 20, 2025

echo "🚀 Updating all pages with WVU Design System components..."

# List of main pages to update
PAGES=(
  "about.html"
  "alumni-spotlight-submit.html"
  "alumni-spotlight.html"
  "board.html"
  "bylaws.html"
  "contact.html"
  "events.html"
  "media.html"
  "membership.html"
  "minutes.html"
  "news.html"
  "pay.html"
  "programs.html"
  "resources.html"
  "scholarship.html"
  "scores.html"
  "search.html"
)

# Backup directory
BACKUP_DIR="_backups/pre-wvu-components-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "📄 Processing $page..."
    
    # Create backup
    cp "$page" "$BACKUP_DIR/$page"
    
    # 1. Add WVU components CSS after styles.css if not already there
    if ! grep -q "wvu-components.css" "$page"; then
      sed -i 's|<link rel="stylesheet" href="/css/styles.css">|<link rel="stylesheet" href="/css/styles.css">\n  <link rel="stylesheet" href="/css/wvu-components.css">|' "$page"
    fi
    
    # 2. Add skip-to-main-content link after <body> if not there
    if ! grep -q "skip-to-main" "$page"; then
      sed -i 's|<body>|<body>\n\n<!-- Skip to main content for accessibility -->\n<a href="#main-content" class="skip-to-main">Skip to main content</a>|' "$page"
    fi
    
    echo "✅ Updated $page"
  else
    echo "⚠️  Skipping $page (not found)"
  fi
done

echo ""
echo "✨ Update complete! Backups saved to: $BACKUP_DIR"
echo "📝 Next: Manually update header/nav/footer tags in each file"
echo "   - Replace <header> section with: <div id=\"wvu-masthead\"></div>"
echo "   - Replace <nav> section with: <div id=\"wvu-navigation\"></div>"
echo "   - Replace <footer> section with: <div id=\"wvu-footer\"></div>"
echo "   - Add component loading JavaScript before </body>"

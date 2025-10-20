#!/bin/bash

# Convert remaining pages to use WVU component system
# ====================================================

echo "🔧 Converting pages to use WVU component loader system..."

# Pages that need conversion
PAGES=(
  "board.html"
  "bylaws.html"
  "contact.html"
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
  "alumni-spotlight.html"
  "alumni-spotlight-submit.html"
)

# Backup directory
BACKUP_DIR="_backups/pre-component-conversion-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

for page in "${PAGES[@]}"; do
  if [ ! -f "$page" ]; then
    echo "⚠️  $page not found, skipping..."
    continue
  fi
  
  echo ""
  echo "📄 Processing $page..."
  
  # Create backup
  cp "$page" "$BACKUP_DIR/"
  
  # Check if page already has WVU component divs
  if grep -q '<div id="wvu-masthead"></div>' "$page"; then
    echo "  ℹ️  Already has WVU components, skipping..."
    continue
  fi
  
  # Remove old Google Fonts if present
  sed -i '/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/d' "$page"
  sed -i '/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/d' "$page"
  sed -i '/<link href="https:\/\/fonts\.googleapis\.com\/css2?family=Roboto/d' "$page"
  
  # Add WVU Official Fonts in head (after meta tags, before first link)
  if ! grep -q "WVU Official Fonts" "$page"; then
    sed -i '/<\/title>/a\  <!-- WVU Official Fonts -->\n  <link rel="preconnect" href="https://cdn.fonts.net">\n  <link href="https://cdn.fonts.net/kit/b339d500-35c3-11ed-aaf7-06b70d83f6b0/b339d500-35c3-11ed-aaf7-06b70d83f6b0.css" rel="stylesheet">' "$page"
  fi
  
  # Add WVU component CSS links if not present
  if ! grep -q "wvu-components.css" "$page"; then
    sed -i '/<link rel="stylesheet" href="\/css\/styles.css"/a\  <link rel="stylesheet" href="/css/wvu-components.css">\n  <link rel="stylesheet" href="/css/wvu-cards.css">\n  <link rel="stylesheet" href="/css/wvu-breadcrumbs.css">' "$page"
  fi
  
  # Replace old <header class="site"> section with WVU components
  # This is complex, so we'll use a more robust approach with perl
  perl -i -0pe 's|<header class="site">.*?</header>|<!-- Skip to main content for accessibility -->\n<a href="#main-content" class="skip-to-main">Skip to main content</a>\n\n    <div id="wvu-masthead"></div>\n    <div id="wvu-navigation"></div>\n\n    <!-- Breadcrumb Navigation -->\n    <div id="wvu-breadcrumbs"></div>|s' "$page"
  
  # Add component-loader.js and breadcrumbs.js before </body> if not present
  if ! grep -q "component-loader.js" "$page"; then
    sed -i 's|</body>|    <script src="/includes/component-loader.js"></script>\n    <script src="/js/wvu-breadcrumbs.js"></script>\n</body>|' "$page"
  fi
  
  # Ensure main tag has id="main-content" for skip link
  if grep -q '<main>' "$page"; then
    sed -i 's|<main>|<main id="main-content">|' "$page"
  fi
  
  echo "  ✅ Converted $page to use WVU components"
done

echo ""
echo "✨ Conversion complete!"
echo "📁 Backups saved to: $BACKUP_DIR"

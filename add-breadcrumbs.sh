#!/bin/bash

# Add Breadcrumb Navigation to All Pages (except index.html)
# =========================================================

echo "🍞 Adding WVU Breadcrumb Navigation to all pages..."

# Array of pages to update (all pages except index.html)
PAGES=(
  "about.html"
  "alumni-spotlight.html"
  "alumni-spotlight-submit.html"
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

# Function to add breadcrumb CSS if not already present
add_breadcrumb_css() {
  local file=$1
  if ! grep -q "wvu-breadcrumbs.css" "$file"; then
    # Find the line with wvu-cards.css and add breadcrumbs CSS after it
    if grep -q "wvu-cards.css" "$file"; then
      sed -i '/wvu-cards.css/a\  <link rel="stylesheet" href="/css/wvu-breadcrumbs.css">' "$file"
    elif grep -q "wvu-components.css" "$file"; then
      sed -i '/wvu-components.css/a\  <link rel="stylesheet" href="/css/wvu-breadcrumbs.css">' "$file"
    fi
    echo "  ✅ Added breadcrumb CSS to $file"
  fi
}

# Function to add breadcrumb div if not already present
add_breadcrumb_div() {
  local file=$1
  if ! grep -q 'id="wvu-breadcrumbs"' "$file"; then
    # Add breadcrumb div after navigation div
    sed -i '/<div id="wvu-navigation"><\/div>/a\
\
    <!-- Breadcrumb Navigation -->\
    <div id="wvu-breadcrumbs"><\/div>' "$file"
    echo "  ✅ Added breadcrumb div to $file"
  fi
}

# Function to add breadcrumb JS if not already present
add_breadcrumb_js() {
  local file=$1
  if ! grep -q "wvu-breadcrumbs.js" "$file"; then
    # Add before </body> tag
    sed -i 's|</body>|    <script src="/js/wvu-breadcrumbs.js"></script>\n</body>|' "$file"
    echo "  ✅ Added breadcrumb JS to $file"
  fi
}

# Process each page
for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo ""
    echo "📄 Processing $page..."
    add_breadcrumb_css "$page"
    add_breadcrumb_div "$page"
    add_breadcrumb_js "$page"
  else
    echo "⚠️  $page not found, skipping..."
  fi
done

echo ""
echo "✨ Breadcrumb navigation added to all pages!"
echo "📍 Pages updated: ${#PAGES[@]}"

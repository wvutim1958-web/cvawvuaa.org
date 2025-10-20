#!/bin/bash
# Minification script for CVAWVUAA website
# Minifies CSS and JavaScript files and reports size reduction

echo "🔧 Starting minification process..."
echo ""

total_before=0
total_after=0

# Function to minify CSS files
minify_css() {
  local file=$1
  local dir=$(dirname "$file")
  local base=$(basename "$file" .css)
  local output="$dir/$base.min.css"
  
  if [ -f "$file" ]; then
    before=$(wc -c < "$file")
    npx csso "$file" --output "$output"
    after=$(wc -c < "$output")
    reduction=$(echo "scale=1; 100 - ($after * 100 / $before)" | bc)
    
    echo "✓ $file"
    echo "  Before: $(numfmt --to=iec-i --suffix=B $before)"
    echo "  After:  $(numfmt --to=iec-i --suffix=B $after)"
    echo "  Saved:  ${reduction}%"
    echo ""
    
    total_before=$((total_before + before))
    total_after=$((total_after + after))
  fi
}

# Function to minify JavaScript files
minify_js() {
  local file=$1
  local dir=$(dirname "$file")
  local base=$(basename "$file" .js)
  local output="$dir/$base.min.js"
  
  if [ -f "$file" ]; then
    before=$(wc -c < "$file")
    npx terser "$file" --compress --mangle --output "$output"
    after=$(wc -c < "$output")
    reduction=$(echo "scale=1; 100 - ($after * 100 / $before)" | bc)
    
    echo "✓ $file"
    echo "  Before: $(numfmt --to=iec-i --suffix=B $before)"
    echo "  After:  $(numfmt --to=iec-i --suffix=B $after)"
    echo "  Saved:  ${reduction}%"
    echo ""
    
    total_before=$((total_before + before))
    total_after=$((total_after + after))
  fi
}

echo "📦 Minifying CSS files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Minify critical CSS files
minify_css "css/wvu-components.css"
minify_css "css/wvu-cards.css"
minify_css "css/wvu-breadcrumbs.css"
minify_css "css/wvu-cta.css"
minify_css "css/styles.css"
minify_css "css/social-media.css"

echo ""
echo "⚡ Minifying JavaScript files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Minify critical JavaScript files
minify_js "includes/component-loader.js"
minify_js "js/wvu-navigation.js"
minify_js "js/wvu-breadcrumbs.js"
minify_js "js/theme-toggle.js"
minify_js "js/search.js"
minify_js "js/newsletter-generator.js"
minify_js "js/newsletters.js"
minify_js "js/gallery.js"
minify_js "js/social-media.js"
minify_js "js/rsvp-manager.js"
minify_js "js/rsvp.js"

echo ""
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total before: $(numfmt --to=iec-i --suffix=B $total_before)"
echo "Total after:  $(numfmt --to=iec-i --suffix=B $total_after)"

if [ $total_before -gt 0 ]; then
  total_reduction=$(echo "scale=1; 100 - ($total_after * 100 / $total_before)" | bc)
  echo "Total saved:  ${total_reduction}%"
fi

echo ""
echo "✅ Minification complete!"

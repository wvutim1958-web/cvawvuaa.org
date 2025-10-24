#!/bin/bash
# Add WVU Masthead, Navigation, and Footer to all admin HTML pages

for file in *.html; do
    # Skip if already has wvu-masthead
    if grep -q "wvu-masthead" "$file"; then
        echo "⏭️  Skipping $file (already has components)"
        continue
    fi
    
    # Skip if doesn't have <body> tag
    if ! grep -q "<body>" "$file"; then
        echo "⏭️  Skipping $file (no body tag found)"
        continue
    fi
    
    echo "✏️  Processing $file..."
    
    # Add masthead and navigation after <body>
    sed -i '/<body>/a\    <!-- WVU Masthead Component -->\n    <div id="wvu-masthead"></div>\n\n    <!-- WVU Primary Navigation Component -->\n    <div id="wvu-navigation"></div>\n' "$file"
    
    # Add footer and component loader before </body>
    sed -i 's|</body>|    <!-- WVU Footer Component -->\n    <div id="wvu-footer"></div>\n\n    <!-- Load WVU Components -->\n    <script src="/includes/component-loader.min.js"></script>\n</body>|' "$file"
    
    echo "✅ Updated $file"
done

echo ""
echo "🎉 Done! WVU components added to all admin pages"

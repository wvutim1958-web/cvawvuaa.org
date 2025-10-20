#!/bin/bash
# Update HTML files to use minified CSS and JS files

echo "🔄 Updating HTML files to use minified assets..."
echo ""

count=0

# Update CSS references in root HTML files
for file in *.html; do
  if [ -f "$file" ]; then
    # Update WVU component CSS files
    sed -i 's|/css/wvu-components\.css|/css/wvu-components.min.css|g' "$file"
    sed -i 's|/css/wvu-cards\.css|/css/wvu-cards.min.css|g' "$file"
    sed -i 's|/css/wvu-breadcrumbs\.css|/css/wvu-breadcrumbs.min.css|g' "$file"
    sed -i 's|/css/wvu-cta\.css|/css/wvu-cta.min.css|g' "$file"
    sed -i 's|/css/styles\.css|/css/styles.min.css|g' "$file"
    sed -i 's|/css/social-media\.css|/css/social-media.min.css|g' "$file"
    
    # Update JavaScript references
    sed -i 's|/includes/component-loader\.js|/includes/component-loader.min.js|g' "$file"
    sed -i 's|/js/wvu-navigation\.js|/js/wvu-navigation.min.js|g' "$file"
    sed -i 's|/js/wvu-breadcrumbs\.js|/js/wvu-breadcrumbs.min.js|g' "$file"
    sed -i 's|/js/theme-toggle\.js|/js/theme-toggle.min.js|g' "$file"
    sed -i 's|/js/search\.js|/js/search.min.js|g' "$file"
    sed -i 's|/js/newsletter-generator\.js|/js/newsletter-generator.min.js|g' "$file"
    sed -i 's|/js/newsletters\.js|/js/newsletters.min.js|g' "$file"
    sed -i 's|/js/gallery\.js|/js/gallery.min.js|g' "$file"
    sed -i 's|/js/social-media\.js|/js/social-media.min.js|g' "$file"
    sed -i 's|/js/rsvp-manager\.js|/js/rsvp-manager.min.js|g' "$file"
    sed -i 's|/js/rsvp\.js|/js/rsvp.min.js|g' "$file"
    
    echo "✓ Updated $file"
    ((count++))
  fi
done

echo ""
echo "✅ Updated $count HTML files to use minified assets"

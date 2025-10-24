#!/bin/bash

# Add WVU component CSS to all admin HTML files

for file in admin/*.html; do
    if [ -f "$file" ]; then
        # Check if the file already has wvu-components.min.css
        if ! grep -q "wvu-components.min.css" "$file"; then
            # Find the line with /css/styles.css and add WVU CSS after it
            if grep -q "/css/styles.css" "$file"; then
                sed -i '/<link rel="stylesheet" href="\/css\/styles.css">/a\    <link rel="stylesheet" href="/css/wvu-components.min.css">' "$file"
                echo "✅ Added WVU CSS to: $file"
            # If no styles.css, look for the first stylesheet link
            elif grep -q '<link rel="stylesheet"' "$file"; then
                sed -i '0,/<link rel="stylesheet"/s//<link rel="stylesheet" href="\/css\/wvu-components.min.css">\n    &/' "$file"
                echo "✅ Added WVU CSS to: $file"
            # If no stylesheets at all, add it in the <head> section
            elif grep -q '<head>' "$file"; then
                sed -i '/<head>/a\    <link rel="stylesheet" href="/css/wvu-components.min.css">' "$file"
                echo "✅ Added WVU CSS to: $file"
            else
                echo "⚠️  Skipped (no suitable location): $file"
            fi
        else
            echo "⏭️  Skipped (already has WVU CSS): $file"
        fi
    fi
done

echo ""
echo "🎉 Done! Updated admin HTML files with WVU component CSS."

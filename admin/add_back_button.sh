#!/bin/bash

# Add "Back to Dashboard" button to all admin HTML files

echo "Adding 'Back to Dashboard' button to all admin HTML files..."
echo ""

count=0

for file in admin/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Skip dashboard.html and index.html
        if [ "$filename" = "dashboard.html" ] || [ "$filename" = "index.html" ]; then
            echo "⏭️  Skipped: $filename (login/dashboard page)"
            continue
        fi
        
        # Check if file already has back-to-dashboard button
        if grep -q "back-to-dashboard" "$file"; then
            echo "⏭️  Skipped: $filename (already has back button)"
            continue
        fi
        
        # Find where to insert - after the nav div, before container/content
        if grep -q '<div id="wvu-navigation"></div>' "$file"; then
            # Insert after navigation div
            sed -i '/<div id="wvu-navigation"><\/div>/a\
\
    <!-- Back to Dashboard Button -->\
    <div class="back-to-dashboard" style="max-width: 1200px; margin: 20px auto; padding: 0 20px;">\
        <a href="/admin/dashboard.html" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #002855, #1e40af); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">\
            <span style="font-size: 1.2rem;">←</span>\
            <span>Back to Dashboard</span>\
        </a>\
    </div>' "$file"
            
            echo "✅ Added button to: $filename"
            ((count++))
        else
            echo "⚠️  No navigation div found in: $filename"
        fi
    fi
done

echo ""
echo "🎉 Done! Added 'Back to Dashboard' button to $count files."

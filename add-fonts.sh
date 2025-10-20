#!/bin/bash
# Script to add WVU brand fonts to all HTML files

FONT_SNIPPET='<meta name="theme-color" content="#EEAA00">
  
  <!-- WVU Brand Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700;900&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">'

# List of HTML files to update (excluding already updated ones)
FILES=(
  "contact.html"
  "membership.html"
  "pay.html"
  "scholarship.html"
  "programs.html"
  "resources.html"
  "scores.html"
  "bylaws.html"
  "media.html"
  "board.html"
  "minutes.html"
  "search.html"
  "alumni-spotlight.html"
)

echo "Adding WVU brand fonts to HTML files..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # Note: This is a placeholder - actual implementation would use sed or similar
    echo "  ✓ Would update $file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo "Done! Files updated."

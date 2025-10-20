#!/bin/bash
# Add H1 headings to pages missing them

echo "Adding H1 headings to pages..."

# Define pages and their appropriate H1 content
declare -A h1_headings=(
  ["404.html"]="<h1>Page Not Found</h1>"
  ["about.html"]="<h1>About the Central Virginia Chapter</h1>"
  ["alumni-spotlight-submit.html"]="<h1>Submit Alumni Spotlight Story</h1>"
  ["alumni-spotlight.html"]="<h1>Alumni Spotlight</h1>"
  ["board.html"]="<h1>Board Members</h1>"
  ["bylaws.html"]="<h1>Chapter Bylaws and Proclamation</h1>"
  ["contact.html"]="<h1>Contact Us</h1>"
  ["media.html"]="<h1>Media Gallery</h1>"
  ["membership.html"]="<h1>Membership Information</h1>"
  ["minutes.html"]="<h1>Meeting Minutes</h1>"
  ["news.html"]="<h1>News and Announcements</h1>"
  ["pay.html"]="<h1>Membership Payment</h1>"
  ["programs.html"]="<h1>Chapter Programs</h1>"
  ["resources.html"]="<h1>WVU Resources</h1>"
  ["scholarship.html"]="<h1>Scholarship Information</h1>"
  ["scores.html"]="<h1>WVU Mountaineer Scores</h1>"
)

# Process each file
for file in "${!h1_headings[@]}"; do
  if [ -f "$file" ]; then
    h1="${h1_headings[$file]}"
    
    # Find the first <main> tag or content section and add h1 after it
    # This is safer than trying to insert at specific line numbers
    if grep -q '<main' "$file"; then
      # Add after <main> tag
      sed -i "s|<main>|<main>\n  $h1|" "$file"
      echo "✅ Added h1 to $file (after <main>)"
    elif grep -q '<div class="wrapper content"' "$file"; then
      # Add after wrapper content div
      sed -i "s|<div class=\"wrapper content\">|<div class=\"wrapper content\">\n  $h1|" "$file"
      echo "✅ Added h1 to $file (after wrapper content)"
    elif grep -q '<div class="content"' "$file"; then
      # Add after content div
      sed -i "s|<div class=\"content\">|<div class=\"content\">\n  $h1|" "$file"
      echo "✅ Added h1 to $file (after content)"
    else
      echo "⚠️  Could not find insertion point for $file (manual review needed)"
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "H1 additions complete! Please review files manually."

#!/bin/bash

# Apply WVU Components to all pages - Full integration
# This script replaces header/footer sections and adds component loading JavaScript

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# List of pages to update
pages=(
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

echo -e "${BLUE}🚀 Applying WVU Design System components to all pages...${NC}\n"

# Create backup
BACKUP_DIR="_backups/pre-full-wvu-components-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}📦 Creating backups in $BACKUP_DIR${NC}\n"

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    cp "$page" "$BACKUP_DIR/"
    echo -e "Processing ${GREEN}$page${NC}..."
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Read the file and process it
    in_old_header=false
    in_old_footer=false
    skip_old_nav_js=false
    
    while IFS= read -r line || [ -n "$line" ]; do
      # Detect start of old header
      if [[ "$line" =~ \<header[[:space:]].*class=\"site\" ]] || [[ "$line" =~ \<header[[:space:]]*\> ]]; then
        in_old_header=true
        # Insert WVU component divs instead
        echo '    <div id="wvu-masthead"></div>' >> "$temp_file"
        echo '    <div id="wvu-navigation"></div>' >> "$temp_file"
        continue
      fi
      
      # Skip lines inside old header
      if [ "$in_old_header" = true ]; then
        if [[ "$line" =~ \</header\> ]]; then
          in_old_header=false
        fi
        continue
      fi
      
      # Detect start of old footer
      if [[ "$line" =~ \<footer[[:space:]].*class=\"site-footer\" ]] || [[ "$line" =~ \<footer[[:space:]]*\> ]]; then
        in_old_footer=true
        # Insert WVU footer div instead
        echo '    <div id="wvu-footer"></div>' >> "$temp_file"
        continue
      fi
      
      # Skip lines inside old footer
      if [ "$in_old_footer" = true ]; then
        if [[ "$line" =~ \</footer\> ]]; then
          in_old_footer=false
        fi
        continue
      fi
      
      # Add id="main-content" to <main> tag if it doesn't have it
      if [[ "$line" =~ \<main[[:space:]]*\> ]]; then
        line='    <main id="main-content">'
      fi
      
      # Skip old mobile menu JavaScript (it's now in wvu-navigation.js)
      if [[ "$line" =~ const.*mobileMenuBtn.*=.*document\.querySelector ]]; then
        skip_old_nav_js=true
        continue
      fi
      
      if [ "$skip_old_nav_js" = true ]; then
        # Look for the end of the old navigation script block
        if [[ "$line" =~ \}\)\(\)\; ]] || [[ "$line" =~ \</script\> ]]; then
          skip_old_nav_js=false
          # Insert component loader script instead
          echo '    <script src="/includes/component-loader.js"></script>' >> "$temp_file"
        fi
        continue
      fi
      
      # Before </body>, add component loader if not already present
      if [[ "$line" =~ \</body\> ]]; then
        # Check if component loader is already in the file
        if ! grep -q "component-loader.js" "$temp_file"; then
          echo '    <script src="/includes/component-loader.js"></script>' >> "$temp_file"
        fi
      fi
      
      # Write the line to temp file
      echo "$line" >> "$temp_file"
      
    done < "$page"
    
    # Replace original with processed version
    mv "$temp_file" "$page"
    
    echo -e "  ${GREEN}✅ Updated $page${NC}\n"
  else
    echo -e "  ${RED}❌ File not found: $page${NC}\n"
  fi
done

echo -e "${GREEN}✨ All pages updated with WVU components!${NC}"
echo -e "${BLUE}📁 Backups saved to: $BACKUP_DIR${NC}"
echo -e "${BLUE}📝 Next: Test all pages and commit changes${NC}\n"

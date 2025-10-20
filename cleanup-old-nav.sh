#!/bin/bash

# Clean up old navigation JavaScript from all pages
# The WVU navigation.js now handles all mobile menu and dropdown functionality

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo -e "${BLUE}🧹 Cleaning up old navigation JavaScript...${NC}\n"

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "Processing $page..."
    
    # Create temp file for clean version
    temp_file=$(mktemp)
    skip_nav_js=false
    skip_theme_js=false
    skip_dropdown_script=false
    
    while IFS= read -r line || [ -n "$line" ]; do
      
      # Skip old mobile nav script
      if [[ "$line" =~ "// Mobile: open/close main nav" ]]; then
        skip_nav_js=true
        continue
      fi
      
      if [ "$skip_nav_js" = true ]; then
        if [[ "$line" =~ "</script>" ]]; then
          skip_nav_js=false
        fi
        continue
      fi
      
      # Skip theme toggle script (will be in wvu-navigation.js)
      if [[ "$line" =~ "// Theme toggle functionality" ]]; then
        skip_theme_js=true
        continue
      fi
      
      if [ "$skip_theme_js" = true ]; then
        if [[ "$line" =~ "</script>" ]]; then
          skip_theme_js=false
        fi
        continue
      fi
      
      # Skip dropdown.js reference (now in wvu-navigation.js)
      if [[ "$line" =~ "<!-- Dropdown Navigation -->" ]]; then
        skip_dropdown_script=true
        continue
      fi
      
      if [ "$skip_dropdown_script" = true ]; then
        if [[ "$line" =~ "dropdown.js" ]]; then
          skip_dropdown_script=false
        fi
        continue
      fi
      
      # Keep the line
      echo "$line" >> "$temp_file"
      
    done < "$page"
    
    # Replace original
    mv "$temp_file" "$page"
    echo -e "  ${GREEN}✅ Cleaned $page${NC}"
  fi
done

echo -e "\n${GREEN}✨ JavaScript cleanup complete!${NC}\n"

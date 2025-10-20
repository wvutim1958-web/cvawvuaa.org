#!/bin/bash

# Replace Google Fonts with official WVU Monotype Fonts CDN
# Phase 2: Adobe/Monotype Fonts Migration

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# List of all HTML pages
pages=(
  "index.html"
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

echo -e "${BLUE}🚀 Migrating to official WVU Fonts (Monotype CDN)...${NC}\n"

# Create backup
BACKUP_DIR="_backups/pre-wvu-fonts-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}📦 Creating backups in $BACKUP_DIR${NC}\n"

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    cp "$page" "$BACKUP_DIR/"
    
    echo "Processing $page..."
    
    # Remove Google Fonts preconnect hints
    sed -i '/fonts.googleapis.com/d' "$page"
    sed -i '/fonts.gstatic.com/d' "$page"
    
    # Remove Google Fonts link
    sed -i '/fonts.googleapis.com\/css2/d' "$page"
    
    # Add WVU Fonts CDN link before the first <link rel="stylesheet">
    # Find the first <link rel="stylesheet"> and insert the WVU fonts before it
    sed -i '0,/<link rel="stylesheet"/{s|<link rel="stylesheet"|  <!-- WVU Official Fonts -->\n  <link rel="preconnect" href="https://cdn.fonts.net">\n  <link href="https://cdn.fonts.net/kit/b339d500-35c3-11ed-aaf7-06b70d83f6b0/b339d500-35c3-11ed-aaf7-06b70d83f6b0.css" rel="stylesheet">\n\n  <link rel="stylesheet"|}'  "$page"
    
    echo -e "  ${GREEN}✅ Updated $page${NC}"
  else
    echo -e "  ❌ File not found: $page"
  fi
done

echo -e "\n${GREEN}✨ Font migration complete!${NC}"
echo -e "${BLUE}📁 Backups saved to: $BACKUP_DIR${NC}"
echo -e "${BLUE}📝 Next: Update CSS font-family declarations${NC}\n"

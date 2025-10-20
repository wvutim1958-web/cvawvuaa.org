#!/bin/bash

###############################################################################
# Image Optimization Script for CVCWVUAA Website
# Optimizes JPG and PNG images while maintaining visual quality
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
total_before=0
total_after=0
files_optimized=0

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   CVCWVUAA Image Optimization Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# Optimize JPG
optimize_jpg() {
    local file="$1"
    local size_before=$(stat -c%s "$file")
    
    jpegoptim --max=85 --strip-all --all-progressive "$file" >/dev/null 2>&1 || return 1
    
    local size_after=$(stat -c%s "$file")
    local saved=$((size_before - size_after))
    local percent=0
    
    if [ $size_before -gt 0 ]; then
        percent=$((saved * 100 / size_before))
    fi
    
    total_before=$((total_before + size_before))
    total_after=$((total_after + size_after))
    files_optimized=$((files_optimized + 1))
    
    if [ $percent -gt 5 ]; then
        printf "  ✓ %-50s %10d → %10d bytes (%3d%% saved)\n" "$(basename "$file")" "$size_before" "$size_after" "$percent"
    fi
}

# Optimize PNG
optimize_png() {
    local file="$1"
    local size_before=$(stat -c%s "$file")
    
    optipng -o2 -quiet "$file" 2>/dev/null || true
    pngquant --quality=80-95 --skip-if-larger --strip --force --ext .png "$file" 2>/dev/null || true
    
    local size_after=$(stat -c%s "$file")
    local saved=$((size_before - size_after))
    local percent=0
    
    if [ $size_before -gt 0 ]; then
        percent=$((saved * 100 / size_before))
    fi
    
    total_before=$((total_before + size_before))
    total_after=$((total_after + size_after))
    files_optimized=$((files_optimized + 1))
    
    if [ $percent -gt 5 ]; then
        printf "  ✓ %-50s %10d → %10d bytes (%3d%% saved)\n" "$(basename "$file")" "$size_before" "$size_after" "$percent"
    fi
}

# Convert bytes to human readable
human_size() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    elif [ $bytes -lt 1073741824 ]; then
        echo "$((bytes / 1048576))MB"
    else
        echo "$((bytes / 1073741824))GB"
    fi
}

# Parse arguments
optimize_root=false
optimize_gallery=false

case "$1" in
    --all)
        optimize_root=true
        optimize_gallery=true
        ;;
    --gallery)
        optimize_gallery=true
        ;;
    --root)
        optimize_root=true
        ;;
    *)
        echo "Usage: $0 [--root|--gallery|--all]"
        echo ""
        echo "  --root     Optimize only root assets"
        echo "  --gallery  Optimize only gallery images"
        echo "  --all      Optimize everything"
        exit 1
        ;;
esac

start_time=$(date +%s)

# Optimize root assets
if [ "$optimize_root" = true ]; then
    echo -e "${YELLOW}➤ Optimizing root assets...${NC}"
    
    find assets -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
        optimize_jpg "$file"
    done
    
    find assets -maxdepth 1 -type f -iname "*.png" | while read -r file; do
        optimize_png "$file"
    done
    
    echo ""
fi

# Optimize gallery
if [ "$optimize_gallery" = true ]; then
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Gallery Optimization (This may take several minutes)${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
    echo ""
    
    for year_dir in assets/gallery/*/; do
        if [ -d "$year_dir" ]; then
            year=$(basename "$year_dir")
            echo -e "${YELLOW}➤ Processing $year...${NC}"
            
            find "$year_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
                optimize_jpg "$file"
            done
            
            find "$year_dir" -type f -iname "*.png" | while read -r file; do
                optimize_png "$file"
            done
            
            echo ""
        fi
    done
fi

# Calculate stats
end_time=$(date +%s)
duration=$((end_time - start_time))
saved=$((total_before - total_after))
percent_saved=0

if [ $total_before -gt 0 ]; then
    percent_saved=$((saved * 100 / total_before))
fi

# Print summary
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              OPTIMIZATION SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Files Optimized:  ${GREEN}$files_optimized${NC}"
echo -e "  Size Before:      ${YELLOW}$(human_size $total_before)${NC}"
echo -e "  Size After:       ${GREEN}$(human_size $total_after)${NC}"
echo -e "  Bytes Saved:      ${GREEN}$(human_size $saved)${NC}"
echo -e "  Reduction:        ${GREEN}$percent_saved%${NC}"
echo -e "  Duration:         ${BLUE}${duration}s${NC}"
echo ""

if [ $percent_saved -ge 50 ]; then
    echo -e "${GREEN}🎉 Excellent! Target of 50%+ reduction achieved!${NC}"
elif [ $percent_saved -ge 30 ]; then
    echo -e "${YELLOW}✓ Good optimization!${NC}"
else
    echo -e "${YELLOW}✓ Optimization complete${NC}"
fi

echo ""

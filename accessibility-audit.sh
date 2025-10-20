#!/bin/bash
# Accessibility Audit Script for CVAWVUAA Website
# Checks common WCAG 2.1 AA accessibility issues

echo "🔍 CVAWVUAA Accessibility Audit"
echo "================================"
echo ""

total_issues=0

# Function to count issues
count_issue() {
  local count=$1
  local message=$2
  if [ $count -gt 0 ]; then
    echo "❌ $message: $count found"
    total_issues=$((total_issues + count))
  else
    echo "✅ $message: None found"
  fi
}

echo "📋 Checking HTML Structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for missing lang attribute
missing_lang=$(grep -l "^<!doctype html>" *.html | xargs grep -L '<html lang=' | wc -l)
count_issue $missing_lang "Pages missing lang attribute"

# Check for images without alt text
images_no_alt=$(grep -r '<img' *.html | grep -v 'alt=' | wc -l)
count_issue $images_no_alt "Images missing alt attribute"

# Check for empty alt attributes (decorative images should use alt='')
images_empty_alt=$(grep -r '<img.*alt=""' *.html | wc -l)
if [ $images_empty_alt -gt 0 ]; then
  echo "ℹ️  Images with empty alt (decorative): $images_empty_alt found"
fi

echo ""
echo "🔘 Checking Form Accessibility..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for inputs without labels
inputs_no_label=$(grep -r '<input' *.html | grep -v 'type="hidden"' | grep -v 'aria-label' | grep -v '<label' | wc -l)
count_issue $inputs_no_label "Form inputs potentially missing labels"

# Check for buttons without accessible text
buttons_no_text=$(grep -r '<button' *.html | grep -v '>' | grep -v 'aria-label' | wc -l)
count_issue $buttons_no_text "Buttons potentially missing accessible text"

echo ""
echo "🎯 Checking ARIA Usage..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for proper ARIA landmarks
pages_with_main=$(grep -l '<main' *.html | wc -l)
pages_with_nav=$(grep -l '<nav' *.html | wc -l)
echo "✅ Pages with <main> landmark: $pages_with_main"
echo "✅ Pages with <nav> landmark: $pages_with_nav"

# Check for aria-label on icon buttons
icon_buttons=$(grep -r 'class=".*-btn"' *.html | grep '<button' | wc -l)
icon_buttons_labeled=$(grep -r 'class=".*-btn"' *.html | grep '<button' | grep 'aria-label' | wc -l)
echo "ℹ️  Icon buttons: $icon_buttons total, $icon_buttons_labeled with aria-label"

echo ""
echo "📝 Checking Heading Structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for pages without h1
pages_no_h1=$(grep -L '<h1' *.html | wc -l)
count_issue $pages_no_h1 "Pages missing <h1> heading"

# Check for multiple h1 elements (should only have one per page)
pages_multiple_h1=$(for file in *.html; do h1_count=$(grep -o '<h1' "$file" | wc -l); if [ $h1_count -gt 1 ]; then echo "$file"; fi; done | wc -l)
count_issue $pages_multiple_h1 "Pages with multiple <h1> headings"

echo ""
echo "🔗 Checking Link Accessibility..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for links with vague text
vague_links=$(grep -ri '<a.*>click here</a>\|<a.*>read more</a>\|<a.*>here</a>' *.html | wc -l)
count_issue $vague_links "Links with vague text (click here, read more, etc.)"

# Check for external links without indication
external_links=$(grep -r 'target="_blank"' *.html | grep -v 'rel="noopener' | wc -l)
if [ $external_links -gt 0 ]; then
  echo "⚠️  External links without rel='noopener noreferrer': $external_links found"
fi

echo ""
echo "⌨️  Checking Keyboard Accessibility..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for skip to main content link
skip_links=$(grep -r 'skip-to-main\|skip-navigation' *.html | wc -l)
echo "✅ Skip navigation links found: $skip_links"

# Check for tabindex misuse (values > 0)
tabindex_positive=$(grep -r 'tabindex="[1-9]' *.html | wc -l)
count_issue $tabindex_positive "Elements with positive tabindex (anti-pattern)"

echo ""
echo "🎨 Checking Visual Accessibility..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for text in all caps (should use CSS text-transform instead)
allcaps_text=$(grep -r '[A-Z]\{10,\}' *.html | grep -v '<!DOCTYPE' | grep -v 'charset=' | grep -v 'content=' | wc -l)
if [ $allcaps_text -gt 0 ]; then
  echo "⚠️  Potential ALL CAPS text in HTML: $allcaps_text instances (should use CSS)"
fi

# Check for title attributes (often inaccessible)
title_attrs=$(grep -r 'title=' *.html | grep -v 'og:title\|twitter:title\|<title>' | wc -l)
if [ $title_attrs -gt 0 ]; then
  echo "ℹ️  Title attributes found: $title_attrs (may be inaccessible on touch devices)"
fi

echo ""
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total critical issues found: $total_issues"
echo ""

if [ $total_issues -eq 0 ]; then
  echo "✅ No critical accessibility issues detected!"
  echo "   Run manual testing with screen readers for complete validation."
else
  echo "⚠️  Issues detected. Review and fix before deployment."
  echo "   See specific issues listed above."
fi

echo ""
echo "📚 Next Steps:"
echo "   1. Fix critical issues listed above"
echo "   2. Test with screen reader (NVDA/JAWS/VoiceOver)"
echo "   3. Test keyboard-only navigation (Tab, Enter, Esc)"
echo "   4. Verify color contrast ratios meet WCAG AA"
echo "   5. Create accessibility statement page"

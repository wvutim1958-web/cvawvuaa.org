# WVU Design System Components - Implementation Plan

**Project:** Central Virginia WVU Alumni Chapter Website  
**Date:** October 20, 2025  
**Phase:** 1 - Essential Elements

---

## Overview

This document outlines the implementation of WVU Design System v2 essential components for brand compliance.

## Components to Implement

### 1. Masthead (`wvu-masthead`)
**Required:** ✅ Yes  
**Purpose:** Primary site identifier with WVU branding  
**Specifications:**
- WVU Logo lockup (Flying WV + "West Virginia University")
- Organization name: "Central Virginia Alumni Chapter"
- Optional: Call-to-action buttons (Apply, Donate, etc.)
- Responsive: Stacks on mobile, horizontal on desktop

**HTML Structure:**
```html
<div class="wvu-masthead bg-wvu-neutral--dark-gray">
  <div class="container">
    <div class="row align-items-center py-2 py-lg-3">
      <div class="col-12 col-lg-8">
        <a href="/" class="text-decoration-none">
          <img src="[WVU Logo SVG]" alt="West Virginia University" class="wvu-masthead__logo" />
          <span class="wvu-masthead__title helvetica-neue-bold text-white">
            Central Virginia Alumni Chapter
          </span>
        </a>
      </div>
      <div class="col-12 col-lg-4">
        <!-- Optional CTA buttons -->
      </div>
    </div>
  </div>
</div>
```

---

### 2. Primary Navigation (`wvu-nav`)
**Required:** ✅ Yes  
**Purpose:** Main site navigation  
**Specifications:**
- Background: `bg-wvu-accent--blue-dark` (#002855)
- Max 7 top-level items (we have 11 - need dropdown consolidation)
- Mobile hamburger menu
- Dropdown support for "About" and "News"
- Social media icons (optional, limit 4)

**Current Navigation:**
- Home
- **About** (dropdown: About Chapter, Membership, Board, Minutes, Bylaws)
- Events
- **News** (dropdown: News, Newsletters, Alumni Spotlight)
- Scores
- Resources
- Programs
- Scholarship
- Media
- Contact

**Proposed Consolidation:**
Keep dropdowns, ensure max depth = 2 levels

**HTML Structure:**
```html
<nav aria-label="Main navigation" class="wvu-site-nav bg-wvu-accent--blue-dark navbar navbar-expand-lg p-0">
  <div class="container">
    <button class="wvu-site-nav__toggle" aria-controls="wvu-site-nav__items" aria-expanded="false">
      <span class="wvu-hamburger">...</span>
      <span>Open Menu</span>
    </button>
    
    <ul class="wvu-site-nav__items list-unstyled d-lg-flex">
      <li><a href="/" class="nav-link">Home</a></li>
      <li class="wvu-site-nav__menu-item-has-children">
        <a href="/about.html" class="nav-link">About</a>
        <ul class="wvu-site-nav__sub-menu">
          <li><a href="/about.html#about-chapter">About the Chapter</a></li>
          <!-- etc -->
        </ul>
      </li>
      <!-- More items -->
    </ul>
  </div>
</nav>
```

---

### 3. Global Footer (`wvu-footer`)
**Required:** ✅ Yes  
**Purpose:** Site footer with contact info and legal links  
**Specifications:**
- Organization contact information
- **Required legal links:**
  - Accreditations
  - Web Standards
  - Privacy Notice
  - Questions or Comments?
- WVU utility links (A-Z Index, Campus Map, Directory, etc.)
- Social media links
- Copyright notice

**HTML Structure:**
```html
<footer class="wvu-footer py-5 bg-wvu-neutral--dark-gray text-white-50">
  <div class="container">
    <div class="row">
      <div class="col-md-4 col-lg-3">
        <p class="helvetica-neue-bold text-white">Central Virginia WVU Alumni Chapter</p>
        <p>Richmond, VA Area</p>
        <p><a href="mailto:info@cvawvuaa.org">info@cvawvuaa.org</a></p>
      </div>
      
      <div class="col-md-8 col-lg-9">
        <div class="row">
          <div class="col-md-6">
            <ul class="list-unstyled small">
              <li><a href="https://about.wvu.edu/wvu-facts">Accreditations</a></li>
              <li><a href="https://webstandards.wvu.edu/">Web Standards</a></li>
              <li><a href="https://www.wvu.edu/privacy">Privacy Notice</a></li>
              <li><a href="/contact.html">Questions or Comments?</a></li>
            </ul>
          </div>
          
          <div class="col-md-6">
            <ul class="list-unstyled small">
              <li><a href="https://www.wvu.edu/SiteIndex/">A-Z Site Index</a></li>
              <li><a href="https://campusmap.wvu.edu/">Campus Map</a></li>
              <li><a href="https://careers.wvu.edu/">WVU Careers</a></li>
              <li><a href="https://directory.wvu.edu/">WVU Directory</a></li>
            </ul>
          </div>
        </div>
        
        <p class="small mt-3">
          © 2025 <a href="https://www.wvu.edu/">West Virginia University</a>. 
          Last updated on October 20, 2025.
        </p>
      </div>
    </div>
  </div>
</footer>
```

---

## Implementation Strategy

### Phase 1: Create Partial Files
1. Create `/includes/masthead.html`
2. Create `/includes/navigation.html`
3. Create `/includes/footer.html`

### Phase 2: Update CSS
1. Add WVU component styles to `/css/wvu-components.css`
2. Import WVU fonts (already done with Google Fonts, will migrate to Adobe Fonts later)
3. Add necessary utility classes

### Phase 3: Update HTML Pages
1. Replace existing `<header>` with masthead include
2. Replace existing nav with WVU nav include
3. Add/update footer with WVU footer include
4. Test across all 16+ pages

### Phase 4: JavaScript
1. Add navigation toggle functionality (mobile menu)
2. Add dropdown keyboard accessibility
3. Test ARIA compliance

---

## Design Tokens

### Colors
- **WVU Blue:** `#002855` (`bg-wvu-accent--blue-dark`, `text-wvu-blue`)
- **WVU Gold:** `#EEAA00` (`bg-wvu-gold`, `text-wvu-gold`)
- **Dark Gray:** `#2C2A29` (`bg-wvu-neutral--dark-gray`)
- **White:** `#FFFFFF`

### Typography
- **Masthead Title:** `helvetica-neue-bold` (Roboto Condensed Bold as temp)
- **Nav Links:** `helvetica-neue` 16px (Roboto Condensed as temp)
- **Footer:** `helvetica-neue` 14px small

### Spacing
- **Masthead:** `py-2 py-lg-3` (responsive padding)
- **Nav:** `p-0` on navbar, `px-1 py-2` on links
- **Footer:** `py-5`

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- ✅ Color contrast ratios meet minimums
- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators visible
- ✅ Screen reader tested

### Specific Requirements
- Navigation: `aria-label="Main navigation"`
- Hamburger: `aria-controls`, `aria-expanded`
- Dropdowns: `aria-haspopup`, proper focus management
- Skip links: Add "Skip to main content"

---

## Testing Checklist

### Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Devices
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px, 414px)

### Functionality
- [ ] Hamburger menu opens/closes
- [ ] Dropdowns work on hover (desktop)
- [ ] Dropdowns work on click/tap (mobile)
- [ ] Keyboard navigation works
- [ ] All links functional
- [ ] Footer links point to correct URLs

### Accessibility
- [ ] Screen reader tested
- [ ] Keyboard-only navigation tested
- [ ] Color contrast verified
- [ ] ARIA attributes correct

---

## Next Steps

1. Get WVU official logo SVG
2. Create component HTML includes
3. Add WVU component CSS
4. Update all pages
5. Test thoroughly
6. Deploy to production

---

## Resources

- **WVU Design System:** https://designsystem.wvu.edu/
- **Component Docs:** https://designsystem.wvu.edu/components/essential-elements
- **GitHub Repo:** https://github.com/wvuweb/wvu-design-system-v2
- **Web Standards:** https://webstandards.wvu.edu/
- **Accessibility Guide:** https://webstandards.wvu.edu/accessibility

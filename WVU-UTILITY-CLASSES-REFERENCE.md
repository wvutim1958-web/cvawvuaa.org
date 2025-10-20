# WVU Design System Utility Classes Reference

**For:** WVU Central Virginia Alumni Chapter  
**Date:** October 20, 2025  
**Purpose:** Complete reference guide for WVU utility classes and implementation guidelines

---

## Table of Contents

1. [Guidelines & Best Practices](#guidelines--best-practices)
2. [Typography Utilities](#typography-utilities)
3. [Color Utilities](#color-utilities)
4. [List Utilities](#list-utilities)
5. [Element Utilities (Slash, Bar, Patterns)](#element-utilities)
6. [Background Effects](#background-effects)
7. [Background Positioning](#background-positioning)
8. [Themes](#themes)
9. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Guidelines & Best Practices

### Accessibility (REQUIRED)
- ✅ **Must meet WCAG 2.1 AA** before launch
- ✅ **Run Siteimprove** - Zero A or AA errors required
- ✅ **Color contrast** - Follow accessible combinations (see Color section)
- ✅ **Guidelines:** https://webstandards.wvu.edu/accessibility

### Design Rules

#### Typography
- **Body copy** - Dark gray on white background (NO textured/colored backgrounds)
- **Text over photos** - Crop for legibility or use vignetting effect
- **Visual hierarchy** - Use `wvu-shout` and `display-*` classes for headlines
- **Alignment** - Don't center large bodies of text (left-align instead)

#### Layout & Spacing
- **Grid alignment** - Use Bootstrap grid, keep spacing consistent
- **Max container width** - 1400px (DO NOT CHANGE)
- **Component padding** - Use `py-5` for outer containers
- **Laws of UX** - Follow https://lawsofux.com/ (e.g., Law of Proximity)

#### Visual Effects
- **Subtle effects only** - Avoid overuse of gradients, shadows
- **NO thick borders** - Stay within framework
- **NO rounded corners** - Unless part of Design System component
- **Patterns** - Use WVU-branded patterns (grid, slashes, topo)

### Required Elements
- ✅ **Masthead** - Logo/wordmark at top left
- ✅ **Navigation** - Clearly defined, consistent across site
- ✅ **Footer** - Required legal links (Privacy, Accreditations)

### Performance Standards
- **Google PageSpeed** - Must score 80+ minimum
- **Tool:** https://developers.google.com/speed/pagespeed/insights/
- **NO CAROUSELS** - Users only click first panel, frustrate users, not truly accessible

### Naming Conventions
- **BEM Format** - `wvu-{block}__{element}--{modifier}`
- **Example:** `wvu-hero__title--blue`
- **Prefix:** Always use `wvu-` prefix

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE 11 (no compatibility mode)

---

## Typography Utilities

### Available Typefaces

| Class Name | Typeface | Usage |
|------------|----------|-------|
| `helvetica-neue` | Helvetica Neue | Body copy (default) |
| `helvetica-neue-bold` | Helvetica Neue Bold | Emphasis |
| `helvetica-neue-light` | Helvetica Neue Light | Subtle text |
| `iowan-old-style` | Iowan Old Style | Serif paragraphs |
| `iowan-old-style-italic` | Iowan Old Style Italic | Quotes, captions |
| `iowan-old-style-black` | Iowan Old Style Black | Bold serif headings |
| `iowan-old-style-black-italic` | Iowan Old Style Black Italic | Stylized headings |
| `wvu-shout` | Helvetica Condensed Black | ALL CAPS headings |

### Example Type Hierarchy

```html
<!-- Primary Header -->
<h2 class="wvu-shout text-wvu-blue display-3 wvu-bar wvu-bar--bottom">
  PRIMARY HEADER
</h2>
<p class="lead">
  Large introductory paragraph text.
</p>

<!-- Secondary Header -->
<h3 class="iowan-old-style-black-italic mt-3">Secondary Header</h3>
<p>Regular body paragraph.</p>

<!-- Tertiary Header -->
<h4 class="iowan-old-style-black wvu-text-letter-spacing text-uppercase h6 mt-3">
  TERTIARY HEADER
</h4>
<p>Supporting body text.</p>
```

### Typography + Bootstrap Classes

Combine with Bootstrap utilities:
- `display-1` through `display-6` - Extra large headings
- `lead` - Larger paragraph text
- `small` - Smaller text
- `text-uppercase` - All caps
- `text-center` / `text-end` - Alignment
- `wvu-text-letter-spacing` - Add letter spacing

---

## Color Utilities

### Color Palette

#### Primary Colors
- `wvu-blue` - #002855 (Official WVU Blue)
- `wvu-gold` - #EAAA00 (Official WVU Gold)

#### Accent Colors
- `wvu-accent--blue-dark` - #1C2B39 (Coal)
- `wvu-accent--blue-light` - #9DDAE6 (Star City Blue)
- `wvu-accent--blue` - #0062A3 (Safety Blue)
- `wvu-accent--yellow` - #FFE539 (Canary)
- `wvu-accent--old-gold` - #7F6310 (Old Gold)
- `wvu-accent--sunset` - #F58672 (Sunset)

#### Neutral Colors
- `wvu-neutral--off-white` - #F7F7F7 (Not Quite White)
- `wvu-neutral--warm-gray-light` - #BEB7B3 (Coopers Gray)
- `wvu-neutral--warm-gray-dark` - #554741 (Rattler Gray)
- `wvu-neutral--warm-gray-medium` - #988E8B (Seneca Gray)
- `wvu-neutral--cream` - #F2E6C2 (Wild Flour)
- `wvu-neutral--tan` - #B3A169 (Buckskin)

### Usage

**Text Colors:**
```html
<p class="text-wvu-blue">Blue text</p>
<p class="text-wvu-gold">Gold text</p>
<p class="text-wvu-accent--blue">Accent blue text</p>
```

**Background Colors:**
```html
<div class="bg-wvu-blue text-white">Blue background</div>
<div class="bg-wvu-gold">Gold background</div>
<div class="bg-wvu-neutral--off-white">Off-white background</div>
```

**Buttons:**
```html
<a href="#" class="btn btn-wvu-blue">Call to Action</a>
<a href="#" class="btn btn-wvu-gold">Call to Action</a>
<a href="#" class="btn btn-wvu-accent--blue">Call to Action</a>
```

**Borders:**
```html
<div class="border border-wvu-gold">Gold bordered element</div>
```

### Accessible Color Combinations

**On Blue Background** (`bg-wvu-blue`):
- ✅ White text (WCAG AA/AAA)
- ✅ Gold text (WCAG AA large)
- ✅ Off-white (WCAG AA)

**On Gold Background** (`bg-wvu-gold`):
- ✅ Blue text (WCAG AA)
- ✅ Black text (WCAG AAA)

**On Light Backgrounds** (off-white, cream):
- ✅ Blue (WCAG AAA)
- ✅ Old Gold (WCAG AA)
- ✅ Warm Gray Dark (WCAG AA)

**Reference:** See full accessibility matrix at https://designsystem.wvu.edu/utilities/color

---

## List Utilities

### Unordered Lists with Icons

#### Arrows
```html
<ul class="wvu-ul-arrows">
  <li>List item with arrow</li>
  <li>Another item</li>
</ul>

<!-- Color variants -->
<ul class="wvu-ul-arrows wvu-ul-arrows-wvu-blue">...</ul>
<ul class="wvu-ul-arrows wvu-ul-arrows-wvu-gold">...</ul>
```

#### Chevrons
```html
<ul class="wvu-ul-chevrons">
  <li>List item with chevron</li>
</ul>

<!-- Color variants -->
<ul class="wvu-ul-chevrons wvu-ul-chevrons-wvu-blue">...</ul>
<ul class="wvu-ul-chevrons wvu-ul-chevrons-wvu-gold">...</ul>
```

#### Slashes
```html
<ul class="wvu-ul-slashes">
  <li>List item with slash</li>
</ul>
```

### Ordered Lists - Numbered

#### Big Numbers
```html
<ol class="wvu-ol-big-numbers">
  <li>
    <h3>Headline Goes Here</h3>
    <p>Description text...</p>
  </li>
</ol>

<!-- Color variants -->
<ol class="wvu-ol-big-numbers wvu-ol-big-numbers-wvu-gold">...</ol>
<ol class="wvu-ol-big-numbers wvu-ol-big-numbers-wvu-blue">...</ol>
<ol class="wvu-ol-big-numbers wvu-ol-big-numbers-white">...</ol>
```

#### Small Numbers
```html
<ol class="wvu-ol-small-numbers">
  <li>
    <h3>Headline</h3>
    <p>Description...</p>
  </li>
</ol>

<!-- Color variants: same as big-numbers -->
```

### Progress Indicators

#### Steps Indicator (Vertical)
```html
<ol class="wvu-ol-progress">
  <li>
    <h3>Step 1</h3>
    <p>Instructions...</p>
  </li>
  <li>
    <h3>Step 2</h3>
    <p>More instructions...</p>
  </li>
</ol>

<!-- Color variants -->
<ol class="wvu-ol-progress wvu-ol-progress-wvu-gold">...</ol>
<ol class="wvu-ol-progress wvu-ol-progress-wvu-blue">...</ol>
```

#### Progress Indicator (Show Active Step)
```html
<ol class="wvu-ol-progress">
  <li>Completed step</li>
  <li class="active">Current step (highlighted)</li>
  <li>Future step</li>
</ol>
```

#### Horizontal Progress Indicator
```html
<ol class="wvu-ol-progress-horizontal">
  <li>
    <p class="sr-only">Step 1</p>
    <p>Apply</p>
  </li>
  <li>
    <p class="sr-only">Step 2</p>
    <p>Review</p>
  </li>
  <li>
    <p class="sr-only">Step 3</p>
    <p>Accept</p>
  </li>
</ol>

<!-- Color variants -->
<ol class="wvu-ol-progress-horizontal wvu-ol-progress-horizontal-wvu-gold">...</ol>
```

### Timeline
```html
<ol class="wvu-ol-timeline wvu-ol-timeline-wvu-gold mt-5">
  <li>
    <div class="p-3 shadow-sm mt-n4 ms-n3 bg-white mb-3">
      <p class="iowan-old-style-black small wvu-text-letter-spacing text-wvu-accent--blue">
        <span class="text-uppercase">March 29, 1987</span>
      </p>
      <h3 class="mt-2 mb-1 h4">Headline Goes Here</h3>
      <p>Event description...</p>
    </div>
  </li>
</ol>

<!-- Color variants -->
<ol class="wvu-ol-timeline wvu-ol-timeline-wvu-blue">...</ol>
<ol class="wvu-ol-timeline wvu-ol-timeline-white">...</ol>
```

**Use Case for Alumni Chapter:**
- Timeline of chapter history
- Scholarship application process
- Event timelines

---

## Element Utilities

### WVU Slash

Adds decorative slash to headers.

**Basic Usage:**
```html
<h2 class="wvu-slash wvu-slash--gold">Headline with Gold Slash</h2>
<h2 class="wvu-slash wvu-slash--blue">Headline with Blue Slash</h2>
<h2 class="wvu-slash wvu-slash--white">Headline with White Slash</h2>
```

**Positioning:**
```html
<!-- Center -->
<h2 class="wvu-slash wvu-slash--gold wvu-slash--center">Centered Slash</h2>

<!-- Right -->
<h2 class="wvu-slash wvu-slash--gold wvu-slash--right">Right Slash</h2>

<!-- Center-Bottom -->
<h2 class="wvu-slash wvu-slash--gold wvu-slash--center-bottom">Center-Bottom Slash</h2>

<!-- Right-Bottom -->
<h2 class="wvu-slash wvu-slash--gold wvu-slash--right-bottom">Right-Bottom Slash</h2>
```

**Transparency:**
```html
<h2 class="wvu-slash wvu-slash--transparent--light">Light Transparent Slash</h2>
<h2 class="wvu-slash wvu-slash--transparent--dark">Dark Transparent Slash</h2>
```

**Fine-Tuning Position:**
Use `wvu-slash--{1-5}-{direction}` where direction is `left`, `right`, `up`, or `down`:
```html
<h2 class="wvu-slash wvu-slash--gold wvu-slash--3-left">Shift slash 3 units left</h2>
```

### WVU Bar

Adds horizontal bar accent to headers.

```html
<!-- Default (top) -->
<h2 class="wvu-bar wvu-shout">HEADER WITH BAR</h2>

<!-- Bottom -->
<h2 class="wvu-bar wvu-bar--bottom wvu-shout">HEADER WITH BAR ON BOTTOM</h2>

<!-- Centered -->
<h2 class="wvu-bar wvu-bar--center wvu-shout">HEADER WITH BAR CENTERED</h2>

<!-- Centered Bottom -->
<h2 class="wvu-bar wvu-bar--center wvu-bar--bottom wvu-shout">CENTERED BOTTOM</h2>

<!-- Right -->
<h2 class="text-end wvu-bar wvu-bar--right wvu-shout w-100">HEADER WITH BAR RIGHT</h2>

<!-- White Bar (for dark backgrounds) -->
<h2 class="wvu-bar wvu-bar--white wvu-shout">HEADER WITH WHITE BAR</h2>
```

### WVU Patterns

#### Grid Pattern
```html
<!-- Standard Grid -->
<div class="wvu-bg-pattern-grid" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">
    Content here
  </div>
</div>

<!-- Transparent Grid -->
<div class="wvu-bg-pattern-grid-transparent" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">
    Content here
  </div>
</div>

<!-- Zoomed Grid -->
<div class="wvu-bg-pattern-grid-zoomed" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">Content</div>
</div>

<!-- Zoomed Transparent Grid -->
<div class="wvu-bg-pattern-grid-zoomed-transparent" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">Content</div>
</div>
```

#### Slashes Pattern
```html
<!-- Gold & Blue Slashes -->
<div class="wvu-bg-pattern-slashes-gold-blue" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">Content</div>
</div>

<!-- Gold, Blue & White Slashes -->
<div class="wvu-bg-pattern-slashes-gold-blue-white" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content">Content</div>
</div>
```

#### Topo Map Background
```html
<!-- Light Topo (for dark backgrounds) -->
<div class="wvu-bg-topo-light bg-dark text-white">
  <div class="wvu-z-index-content">
    Content here
  </div>
</div>

<!-- Dark Topo (for light backgrounds) -->
<div class="wvu-bg-topo-dark">
  <div class="wvu-z-index-content">
    Content here
  </div>
</div>
```

**Important:** Always use `wvu-z-index-content` on text containers when using patterns!

---

## Background Effects

### Vignetting
Darkens edges to improve text legibility over photos.

```html
<!-- Basic vignetting (10-100 in increments of 10) -->
<div class="wvu-bg-vignetting--80" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    <h2>Headline</h2>
    <p>Easy to read text</p>
  </div>
</div>

<!-- Shift vignetting right (when subject is on left) -->
<div class="wvu-bg-vignetting--80 wvu-bg-vignetting--right" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    Content
  </div>
</div>
```

**Values:** `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `100`

### Luminosity Blend Mode
Similar to Photoshop multiply effect. Adds color overlay.

```html
<!-- Luminosity with background color (10-100) -->
<div class="wvu-bg-blend-mode-luminosity--80 bg-wvu-accent--blue-light" 
     style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-wvu-blue">
    Content
  </div>
</div>

<!-- Lower number = more contrast -->
<div class="wvu-bg-blend-mode-luminosity--10 bg-wvu-accent--blue-light" 
     style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    High contrast content
  </div>
</div>
```

**Must include:** Background color class (e.g., `bg-wvu-accent--blue-light`)

### Lighten Effect
```html
<div class="wvu-bg-blend-mode-lighten" style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    Content
  </div>
</div>
```

Uses WVU primary blue as overlay color.

### Combining Effects
```html
<!-- Vignetting + Luminosity + Pattern Grid -->
<div class="wvu-bg-vignetting--80 
            wvu-bg-blend-mode-luminosity--80 
            bg-wvu-accent--blue-dark 
            wvu-bg-pattern-grid-transparent" 
     style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    Multi-effect content
  </div>
</div>

<!-- Vignetting + Lighten -->
<div class="wvu-bg-vignetting--80 wvu-bg-blend-mode-lighten" 
     style="background-image: url(photo.jpg)">
  <div class="wvu-z-index-content text-white">
    Content
  </div>
</div>
```

**Use Case for Alumni Chapter:**
- Hero sections with event photos
- Testimonial backgrounds
- Chapter history timeline images

---

## Background Positioning

### Basic Positioning
```html
<!-- Top -->
<div class="wvu-bg-position-top" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Bottom -->
<div class="wvu-bg-position-bottom" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Center (default) -->
<div class="wvu-bg-position-center" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Left -->
<div class="wvu-bg-position-left" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Right -->
<div class="wvu-bg-position-right" style="background-image: url(photo.jpg)">
  Content
</div>
```

### Mobile-Specific Positioning
```html
<!-- Different position on mobile -->
<div class="wvu-bg-position-center wvu-bg-position-m-top" 
     style="background-image: url(photo.jpg)">
  Centered on desktop, top on mobile
</div>
```

### Responsive Positioning
```html
<!-- Fine-tune with breakpoints and percentages -->
<div class="wvu-bg-position-center-left--75 
            wvu-bg-position-xl-center-right" 
     style="background-image: url(photo.jpg)">
  Different positions per breakpoint
</div>
```

### Spacers for Small Viewports
Prevents text from obscuring subject on mobile.

```html
<!-- Add space above photo on small screens -->
<div class="wvu-bg-position-spacer-top" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Add space above photo on medium and below -->
<div class="wvu-bg-position-spacer-md-top" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Add space below photo -->
<div class="wvu-bg-position-spacer-bottom" style="background-image: url(photo.jpg)">
  Content
</div>

<!-- Add space below photo (medium and below) -->
<div class="wvu-bg-position-spacer-md-bottom" style="background-image: url(photo.jpg)">
  Content
</div>
```

---

## Themes

WVU provides 6 pre-configured theme frameworks:

### 1. Basic Theme (RECOMMENDED FOR ALUMNI CHAPTER)
**Best For:** Informational and marketing sites

**Templates:**
- ✅ Frontpage (Hero + Featured Pages + Calendar + Quicklinks)
- ✅ Backpage (General information pages)
- ✅ Article (Blog/news articles)
- ✅ Article Index (List of articles)
- ✅ Contact Us (Contact info + form)
- ✅ Contact Listing (Staff/board directory)
- ✅ Directory (Full organization listing)
- ✅ Landing Page (Section landing pages)
- ✅ Photo Gallery (Event photos)

### 2. College or Department Theme
**Best For:** Academic units

**Additional Templates:**
- Frontpage - College or Department
- Faculty Member profile
- Program Listing
- Student profile

### 3. Magazine Theme
**Best For:** Online publications

**Templates:**
- Frontpage - Magazine
- Article (with hero)
- Article Index

### 4. Faculty Member Theme
**Best For:** Individual faculty sites

**Templates:**
- Frontpage - Faculty Member
- Backpage
- Article
- Article Index
- Contact Us

### 5. Conference or Event Theme
**Best For:** Conferences/major events

**Templates:**
- Frontpage - Conference or Event
- Backpage
- Profile (speakers)

### 6. Co-Branded Theme
**Best For:** Partner organizations

**Special Feature:** Co-branded masthead
**Same templates as Basic Theme**

**Recommended for cvawvuaa.org: Basic Theme**

---

## Quick Reference Cheat Sheet

### Typography
```css
.helvetica-neue
.helvetica-neue-bold
.helvetica-neue-light
.iowan-old-style
.iowan-old-style-italic
.iowan-old-style-black
.iowan-old-style-black-italic
.wvu-shout
```

### Color Classes
```css
/* Text */
.text-wvu-gold
.text-wvu-blue
.text-wvu-neutral--{color}
.text-wvu-accent--{color}

/* Backgrounds */
.bg-wvu-gold
.bg-wvu-blue
.bg-wvu-neutral--{color}
.bg-wvu-accent--{color}

/* Buttons */
.btn-wvu-gold
.btn-wvu-blue
.btn-wvu-neutral--{color}
.btn-wvu-accent--{color}
```

### Lists
```css
/* Unordered */
.wvu-ul-arrows
.wvu-ul-arrows-wvu-{color}
.wvu-ul-chevrons
.wvu-ul-chevrons-wvu-{color}
.wvu-ul-slashes

/* Ordered */
.wvu-ol-big-numbers
.wvu-ol-big-numbers-wvu-{color}
.wvu-ol-small-numbers
.wvu-ol-small-numbers-wvu-{color}

/* Progress */
.wvu-ol-progress
.wvu-ol-progress-wvu-{color}
.wvu-ol-progress-horizontal
.wvu-ol-progress-horizontal-wvu-{color}

/* Timeline */
.wvu-ol-timeline
.wvu-ol-timeline-wvu-{color}
```

### Elements
```css
/* Slash */
.wvu-slash
.wvu-slash--{color}
.wvu-slash--{position}
.wvu-slash--transparent--light
.wvu-slash--transparent--dark

/* Bar */
.wvu-bar
.wvu-bar--{color}
.wvu-bar--{position}

/* Patterns */
.wvu-bg-pattern-grid
.wvu-bg-pattern-grid-transparent
.wvu-bg-pattern-grid-zoomed
.wvu-bg-pattern-slashes-gold-blue
.wvu-bg-topo-light
.wvu-bg-topo-dark
```

### Background Effects
```css
.wvu-bg-vignetting--{10-100}
.wvu-bg-vignetting--right
.wvu-bg-blend-mode-luminosity--{10-100}
.wvu-bg-blend-mode-lighten
```

### Background Positioning
```css
.wvu-bg-position-{direction}
.wvu-bg-position-m-{direction}
.wvu-bg-position-spacer-top
.wvu-bg-position-spacer-md-top
.wvu-bg-position-spacer-bottom
.wvu-bg-position-spacer-md-bottom
```

### Essential
```css
.wvu-z-index-content  /* Use when adding backgrounds to ensure text stays on top */
.wvu-text-letter-spacing  /* Add letter spacing */
.wvu-grow-shadow  /* Button hover effect */
```

---

## Implementation Examples for Alumni Chapter

### Hero with Slash & Vignetting
```html
<div class="py-5 text-center text-white 
            wvu-bg-vignetting--80 
            wvu-bg-position-center" 
     style="background-image: url(chapter-event.jpg)">
  <div class="container">
    <div class="row wvu-z-index-content">
      <div class="col col-md-9 mx-auto">
        <h1 class="display-2 wvu-shout wvu-slash wvu-slash--gold wvu-slash--center-bottom">
          LET'S GO MOUNTAINEERS
        </h1>
        <p class="iowan-old-style-black-italic h4 mt-4">
          Join the Central Virginia Alumni Chapter
        </p>
        <a href="/membership.html" class="btn btn-wvu-gold btn-lg mt-3">
          Become a Member
        </a>
      </div>
    </div>
  </div>
</div>
```

### Timeline (Chapter History)
```html
<ol class="wvu-ol-timeline wvu-ol-timeline-wvu-gold mt-5">
  <li>
    <div class="p-3 shadow-sm mt-n4 ms-n3 bg-white mb-3">
      <p class="iowan-old-style-black small wvu-text-letter-spacing text-wvu-accent--blue">
        <span class="text-uppercase">November 15, 1995</span>
      </p>
      <h3 class="mt-2 mb-1 h4">Chapter Founded</h3>
      <p>First meeting of Central Virginia Alumni Chapter held in Richmond...</p>
    </div>
  </li>
  <li>
    <div class="p-3 shadow-sm mt-n4 ms-n3 bg-white mb-3">
      <p class="iowan-old-style-black small wvu-text-letter-spacing text-wvu-accent--blue">
        <span class="text-uppercase">September 1, 2000</span>
      </p>
      <h3 class="mt-2 mb-1 h4">First Scholarship Awarded</h3>
      <p>Inaugural $2,500 scholarship presented to local student...</p>
    </div>
  </li>
</ol>
```

### Stats Section
```html
<div class="bg-wvu-blue text-white py-5 text-center">
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <h2 class="display-1 wvu-shout text-wvu-gold">500+</h2>
        <p class="h5">Active Members</p>
      </div>
      <div class="col-md-4">
        <h2 class="display-1 wvu-shout text-wvu-gold">$50K</h2>
        <p class="h5">Scholarships Awarded</p>
      </div>
      <div class="col-md-4">
        <h2 class="display-1 wvu-shout text-wvu-gold">15</h2>
        <p class="h5">Events Per Year</p>
      </div>
    </div>
  </div>
</div>
```

### Event Cards with Hover
```html
<div class="row">
  <div class="col-md-4">
    <div class="card wvu-grow-shadow">
      <img src="tailgate.jpg" class="card-img-top" alt="Tailgate Party">
      <div class="card-body">
        <h3 class="h5 iowan-old-style-black">Football Tailgate</h3>
        <p class="small text-wvu-accent--blue">
          <span class="text-uppercase wvu-text-letter-spacing">October 15, 2025</span>
        </p>
        <p>Join fellow Mountaineers for pre-game festivities...</p>
        <a href="#" class="btn btn-sm btn-wvu-gold">Learn More</a>
      </div>
    </div>
  </div>
  <!-- Repeat for more events -->
</div>
```

---

## Resources

**Official Documentation:**
- Components: https://designsystem.wvu.edu/components
- Templates: https://designsystem.wvu.edu/templates
- Utilities: https://designsystem.wvu.edu/utilities
- Guidelines: https://designsystem.wvu.edu/getting-started/guidelines-and-best-practices
- Themes: https://designsystem.wvu.edu/themes
- Cheat Sheet: https://designsystem.wvu.edu/utilities/cheat-sheet

**Bootstrap 5:**
- Official Docs: https://getbootstrap.com/docs/5.0/
- Cheat Sheet: https://bootstrap-cheatsheet.themeselection.com/

**Support:**
- WVU SCM - Digital: adam.glenn@mail.wvu.edu
- GitHub: https://github.com/wvuweb/wvu-design-system-v2

**Related Documents:**
- `WVU-DESIGN-SYSTEM-IMPLEMENTATION-PLAN.md` - Full implementation roadmap
- `QUICK-START-DESIGN-SYSTEM.md` - Quick start guide
- `WVU-BRAND-COMPLIANCE-AUDIT-2025.md` - Brand compliance audit
- `IMPLEMENTATION-PROGRESS.md` - Progress tracker

---

**Last Updated:** October 20, 2025  
**Next Review:** After Phase 1 implementation  
**Maintained By:** WVU Central Virginia Alumni Chapter Web Team

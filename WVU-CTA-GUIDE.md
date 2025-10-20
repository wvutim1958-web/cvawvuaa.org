# WVU Call-to-Action (CTA) Component Guide

## Overview

The WVU CTA component system provides consistent, accessible, and brand-compliant buttons and calls-to-action across the CVAWVUAA website.

**File:** `/css/wvu-cta.css`

## Button Hierarchy

Use the appropriate button style based on importance:

1. **Primary (Gold)** - Main page action (e.g., "Join Us", "Register Now")
2. **Secondary (Blue)** - Supporting actions (e.g., "Donate", "Learn More")
3. **Tertiary/Outline** - Less emphasis (e.g., "Cancel", "View Details")
4. **Text** - Minimal emphasis (e.g., "Skip", "Close")

## Basic Usage

### Primary Button (Gold)
```html
<a href="/membership.html" class="wvu-cta wvu-cta--primary">Become a Member</a>
```

### Secondary Button (Blue)
```html
<a href="/pay.html" class="wvu-cta wvu-cta--secondary">Donate Now</a>
```

### Tertiary/Outline Button
```html
<button type="button" class="wvu-cta wvu-cta--tertiary">Cancel</button>
```

### Text Button
```html
<a href="#" class="wvu-cta wvu-cta--text">Skip to Content</a>
```

## Button Types

### Links vs Buttons

**Use `<a>` tags for navigation:**
```html
<a href="/events.html" class="wvu-cta wvu-cta--primary">View Events</a>
```

**Use `<button>` for actions:**
```html
<button type="submit" class="wvu-cta wvu-cta--primary">Submit Form</button>
<button type="button" class="wvu-cta wvu-cta--secondary" onclick="openModal()">Open Details</button>
```

## Size Variants

### Small
```html
<a href="#" class="wvu-cta wvu-cta--primary wvu-cta--small">Small Button</a>
```

### Default
```html
<a href="#" class="wvu-cta wvu-cta--primary">Default Button</a>
```

### Large
```html
<a href="#" class="wvu-cta wvu-cta--primary wvu-cta--large">Large Button</a>
```

## With Icons

### Icon Left
```html
<a href="/bylaws.pdf" class="wvu-cta wvu-cta--primary" download>
  <span class="wvu-cta__icon wvu-cta__icon--left">📄</span>
  Download PDF
</a>
```

### Icon Right
```html
<a href="https://wvu.edu" class="wvu-cta wvu-cta--secondary" target="_blank" rel="noopener">
  Visit WVU
  <span class="wvu-cta__icon wvu-cta__icon--right">→</span>
</a>
```

### Icon Only
```html
<button type="button" class="wvu-cta wvu-cta--tertiary wvu-cta--icon-only" aria-label="Close">
  ✕
</button>
```

## Full Width Buttons

### Desktop and Mobile
```html
<a href="/membership.html" class="wvu-cta wvu-cta--primary wvu-cta--full">
  Join Now
</a>
```

### Mobile Only
```html
<a href="/events.html" class="wvu-cta wvu-cta--primary wvu-cta--mobile-full">
  View Events
</a>
```

## Button Groups

### Horizontal Group
```html
<div class="wvu-btn-group">
  <a href="/membership.html" class="wvu-cta wvu-cta--primary">Join Us</a>
  <a href="/pay.html" class="wvu-cta wvu-cta--secondary">Donate</a>
  <a href="/about.html" class="wvu-cta wvu-cta--tertiary">Learn More</a>
</div>
```

### Vertical Group
```html
<div class="wvu-btn-group wvu-btn-group--vertical">
  <a href="/events.html" class="wvu-cta wvu-cta--primary">Upcoming Events</a>
  <a href="/programs.html" class="wvu-cta wvu-cta--secondary">Programs</a>
</div>
```

### Connected Group
```html
<div class="wvu-btn-group wvu-btn-group--connected">
  <button type="button" class="wvu-cta wvu-cta--tertiary">Day</button>
  <button type="button" class="wvu-cta wvu-cta--tertiary">Week</button>
  <button type="button" class="wvu-cta wvu-cta--tertiary">Month</button>
</div>
```

## States

### Disabled
```html
<button type="submit" class="wvu-cta wvu-cta--primary" disabled>
  Submit (form incomplete)
</button>
```

### Loading
```html
<button type="submit" class="wvu-cta wvu-cta--primary wvu-cta--loading">
  Processing...
</button>
```

## Special Variants

### Dark Background
Use on dark backgrounds for better contrast:
```html
<a href="#" class="wvu-cta wvu-cta--dark">Learn More</a>
```

### Gold Outline
Alternative outline style using WVU Gold:
```html
<a href="#" class="wvu-cta wvu-cta--outline-gold">Join Now</a>
```

## Common Patterns

### Form Submit
```html
<form action="/submit" method="post">
  <!-- form fields -->
  <button type="submit" class="wvu-cta wvu-cta--primary">Send Message</button>
</form>
```

### RSVP Button
```html
<a href="/events/event-name.html#rsvp" class="wvu-cta wvu-cta--primary">
  <span class="wvu-cta__icon wvu-cta__icon--left">🎫</span>
  RSVP Now
</a>
```

### Download Button
```html
<a href="/documents/bylaws.pdf" class="wvu-cta wvu-cta--secondary" download>
  <span class="wvu-cta__icon wvu-cta__icon--left">⬇</span>
  Download PDF
</a>
```

### External Link
```html
<a href="https://external-site.com" class="wvu-cta wvu-cta--tertiary" target="_blank" rel="noopener noreferrer">
  Visit Site
  <span class="wvu-cta__icon wvu-cta__icon--right">↗</span>
</a>
```

### Donation Button
```html
<a href="/pay.html" class="wvu-cta wvu-cta--primary wvu-cta--large">
  💛 Support CVAWVUAA
</a>
```

## Accessibility Guidelines

### 1. Use Descriptive Text
❌ Bad:
```html
<a href="/events.html" class="wvu-cta wvu-cta--primary">Click Here</a>
```

✅ Good:
```html
<a href="/events.html" class="wvu-cta wvu-cta--primary">View Upcoming Events</a>
```

### 2. Add ARIA Labels for Icon-Only Buttons
❌ Bad:
```html
<button type="button" class="wvu-cta wvu-cta--icon-only">✕</button>
```

✅ Good:
```html
<button type="button" class="wvu-cta wvu-cta--icon-only" aria-label="Close dialog">✕</button>
```

### 3. Indicate External Links
```html
<a href="https://wvu.edu" class="wvu-cta wvu-cta--secondary" target="_blank" rel="noopener noreferrer">
  Visit WVU
  <span class="wvu-cta__icon wvu-cta__icon--right" aria-hidden="true">↗</span>
  <span class="sr-only">(opens in new window)</span>
</a>
```

### 4. Use Correct Button Type
```html
<!-- Submit form -->
<button type="submit" class="wvu-cta wvu-cta--primary">Submit</button>

<!-- Generic action -->
<button type="button" class="wvu-cta wvu-cta--secondary">Open Menu</button>

<!-- Reset form -->
<button type="reset" class="wvu-cta wvu-cta--tertiary">Clear Form</button>
```

### 5. Ensure Minimum Touch Targets
All buttons automatically meet WCAG 2.1 AA minimum touch target size of 44x44px.

## Migration Guide

### From Old `.btn` Classes

**Old Primary Button:**
```html
<a href="/membership.html" class="btn">Join Us</a>
```

**New:**
```html
<a href="/membership.html" class="wvu-cta wvu-cta--primary">Join Us</a>
```

**Old Outline Button:**
```html
<a href="/pay.html" class="btn outline">Donate</a>
```

**New:**
```html
<a href="/pay.html" class="wvu-cta wvu-cta--tertiary">Donate</a>
```

### Mapping Table

| Old Class | New Classes |
|-----------|-------------|
| `.btn` | `.wvu-cta .wvu-cta--primary` |
| `.btn.outline` | `.wvu-cta .wvu-cta--tertiary` |
| N/A | `.wvu-cta .wvu-cta--secondary` |

## Color Reference

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | Gold (#EAAA00) | Dark (#2C2A29) | Gold |
| Secondary | Blue (#0062A3) | White | Blue |
| Tertiary | Transparent | Blue (#0062A3) | Blue |
| Text | Transparent | Blue (#0062A3) | Transparent |
| Dark | Dark (#2C2A29) | White | Dark |

## Do's and Don'ts

### ✅ Do

- Use primary buttons for the main call-to-action on a page
- Limit to 1-2 primary buttons per page
- Use consistent icon placement (left for actions, right for navigation)
- Provide clear, action-oriented button text
- Use `<button>` for actions, `<a>` for navigation
- Test keyboard navigation (Tab, Enter, Space)

### ❌ Don't

- Don't use multiple primary buttons in the same section
- Don't use vague text like "Click Here" or "Submit"
- Don't rely on color alone to convey meaning
- Don't make buttons too small (< 44px touch target)
- Don't disable buttons without explanation
- Don't use `<a>` tags with `onclick` handlers (use `<button>` instead)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Android (last version)

## Examples in the Wild

See these pages for live examples:

- **Homepage** (`index.html`) - Primary "Become a Member" and "Donate" CTAs
- **Events** (`events.html`) - RSVP and calendar download buttons
- **Bylaws** (`bylaws.html`) - PDF download buttons
- **Contact** (`contact.html`) - Form submit button
- **Membership** (`membership.html`) - Join and pay dues buttons

## Questions?

For assistance or questions about the CTA component system, contact the web development team.

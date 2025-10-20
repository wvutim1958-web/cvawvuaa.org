# Performance Testing Guide
**CVCWVUAA Website Performance Analysis**  
**Date:** October 20, 2025

---

## Overview

This guide provides instructions for testing the performance improvements made through lazy loading implementation and other optimizations.

---

## Testing Tools

### 1. Google PageSpeed Insights (Recommended)
**URL:** https://pagespeed.web.dev/

**Advantages:**
- Free and easy to use
- Tests from Google's servers (realistic conditions)
- Provides mobile and desktop scores
- Includes Core Web Vitals
- Offers specific optimization recommendations

**How to Use:**
1. Visit https://pagespeed.web.dev/
2. Enter the URL to test (e.g., https://cvawvuaa.org/index.html)
3. Click "Analyze"
4. Wait 30-60 seconds for results
5. Review both Mobile and Desktop scores

### 2. Chrome DevTools Lighthouse
**Access:** Chrome Browser → F12 → Lighthouse Tab

**Advantages:**
- Built into Chrome browser
- Local testing (your network speed)
- More control over test conditions
- Can save reports

**How to Use:**
1. Open Chrome and navigate to the page
2. Press F12 to open DevTools
3. Click "Lighthouse" tab
4. Select categories: Performance, Accessibility, Best Practices, SEO
5. Choose device: Mobile or Desktop
6. Click "Generate report"

### 3. WebPageTest
**URL:** https://webpagetest.org/

**Advantages:**
- Advanced testing options
- Multiple test locations worldwide
- Video filmstrip comparison
- Detailed waterfall charts

---

## Pages to Test

### Priority 1: Pages with Lazy Loading ✅

1. **Homepage** - `https://cvawvuaa.org/index.html`
   - **Images:** 10 lazy-loaded images
   - **Expected Impact:** Significant LCP improvement
   - **Baseline:** Test first for comparison

2. **Scholarship Page** - `https://cvawvuaa.org/scholarship.html`
   - **Images:** 1 lazy-loaded image (Mountaineer statue)
   - **Expected Impact:** Moderate improvement
   - **Focus:** Below-fold image loading

3. **Programs Page** - `https://cvawvuaa.org/programs.html`
   - **Images:** 2 lazy-loaded images
   - **Expected Impact:** Good improvement on card images
   - **Focus:** Progressive image loading

4. **Membership Page** - `https://cvawvuaa.org/membership.html`
   - **Images:** 1 lazy-loaded banner image
   - **Expected Impact:** Faster initial render
   - **Focus:** Hero image optimization

### Priority 2: Pages for Comparison

5. **About Page** - `https://cvawvuaa.org/about.html`
   - **Images:** Minimal (logo only)
   - **Purpose:** Baseline comparison

6. **Events Page** - `https://cvawvuaa.org/events.html`
   - **Images:** Multiple event images
   - **Purpose:** Check existing optimizations

---

## Key Metrics to Track

### Core Web Vitals

#### 1. Largest Contentful Paint (LCP)
**What it measures:** Time until the largest content element loads

**Target Values:**
- ✅ **Good:** ≤ 2.5 seconds
- ⚠️ **Needs Improvement:** 2.5 - 4.0 seconds
- ❌ **Poor:** > 4.0 seconds

**Expected Impact of Lazy Loading:**
- 20-40% improvement on image-heavy pages
- Faster perceived load time

#### 2. First Input Delay (FID)
**What it measures:** Time until page responds to user interaction

**Target Values:**
- ✅ **Good:** ≤ 100 milliseconds
- ⚠️ **Needs Improvement:** 100 - 300 milliseconds
- ❌ **Poor:** > 300 milliseconds

**Expected Impact:**
- Minimal direct impact from lazy loading
- May improve if JavaScript execution is reduced

#### 3. Cumulative Layout Shift (CLS)
**What it measures:** Visual stability during page load

**Target Values:**
- ✅ **Good:** ≤ 0.1
- ⚠️ **Needs Improvement:** 0.1 - 0.25
- ❌ **Poor:** > 0.25

**Expected Impact:**
- Should remain stable or improve
- Lazy loading CSS includes sizing to prevent shifts

### Additional Performance Metrics

#### Speed Index
**What it measures:** How quickly content is visually displayed

**Target:** < 3.4 seconds (mobile), < 1.3 seconds (desktop)

#### Total Blocking Time (TBT)
**What it measures:** Time the main thread is blocked

**Target:** < 200 milliseconds (mobile), < 150 milliseconds (desktop)

#### Time to Interactive (TTI)
**What it measures:** Time until page is fully interactive

**Target:** < 3.8 seconds (mobile), < 2.5 seconds (desktop)

---

## Testing Procedure

### Step 1: Baseline Testing (Optional)
If you have access to previous performance data:
1. Compare against pre-optimization scores
2. Document improvement percentages
3. Note specific metric changes

### Step 2: Current State Testing

#### For Each Page:

1. **Mobile Testing**
   ```
   - Navigate to https://pagespeed.web.dev/
   - Enter: https://cvawvuaa.org/[page-name].html
   - Click "Analyze"
   - Wait for results
   - Screenshot or save the report
   ```

2. **Desktop Testing**
   ```
   - Switch to Desktop tab in results
   - Review desktop-specific scores
   - Compare with mobile results
   ```

3. **Record Results**
   ```
   Page: _____________
   
   Mobile Performance Score: ___/100
   Desktop Performance Score: ___/100
   
   Core Web Vitals:
   - LCP: ___ seconds
   - FID: ___ ms
   - CLS: ___
   
   Additional Metrics:
   - Speed Index: ___ seconds
   - TBT: ___ ms
   - TTI: ___ seconds
   ```

### Step 3: Document Findings

Create a results file: `/docs/performance-test-results-2025-10-20.md`

Include:
- All test scores
- Screenshots of key findings
- Comparison with baseline (if available)
- Opportunities identified by PageSpeed Insights
- Prioritized recommendations

---

## Expected Results

### Pages with Lazy Loading

**Homepage (index.html):**
- ✅ Should show improved LCP (10 images lazy loaded)
- ✅ Reduced initial page weight
- ✅ Faster perceived load time
- ⚠️ May show "Defer offscreen images" as passed

**Scholarship/Programs/Membership:**
- ✅ Moderate improvements on image loading
- ✅ Better mobile performance
- ✅ Improved Speed Index

### Common Opportunities

Even with lazy loading, PageSpeed may suggest:

1. **Serve images in next-gen formats** ✅ Already done (AVIF)
2. **Efficiently encode images** ✅ Already optimized
3. **Preconnect to required origins** ✅ Resource hints implemented
4. **Eliminate render-blocking resources** - May need CSS/JS minification
5. **Remove unused JavaScript** - Can be addressed in future
6. **Minimize main-thread work** - May require code optimization

---

## Performance Budget

Set performance budgets for ongoing monitoring:

### Mobile Targets
- Performance Score: **80+** (Good), **90+** (Excellent)
- LCP: **< 2.5s**
- FID: **< 100ms**
- CLS: **< 0.1**

### Desktop Targets
- Performance Score: **90+** (Good), **95+** (Excellent)
- LCP: **< 1.5s**
- FID: **< 50ms**
- CLS: **< 0.1**

---

## Interpreting Results

### Score Ranges

- **90-100** 🟢 Excellent - Site is highly optimized
- **50-89** 🟡 Good - Room for improvement but acceptable
- **0-49** 🔴 Poor - Significant optimization needed

### What to Focus On

1. **If LCP is high:** Focus on image optimization, lazy loading, critical CSS
2. **If FID is high:** Reduce JavaScript execution time, code splitting
3. **If CLS is high:** Set explicit dimensions on images/embeds, avoid layout shifts

---

## Comparison Testing

### Test Different Scenarios

1. **Network Throttling**
   - Test on 3G/4G/Fast 3G
   - Measure impact on slower connections
   - Lazy loading should show bigger improvements

2. **Device Types**
   - Mobile phones (most critical)
   - Tablets
   - Desktop browsers
   - Different screen sizes

3. **Geographic Locations**
   - Test from different regions if possible
   - Use WebPageTest for international testing

---

## Automated Monitoring (Future)

Consider setting up:

1. **Lighthouse CI**
   - Run Lighthouse on every commit
   - Fail builds if scores drop

2. **Real User Monitoring (RUM)**
   - Track actual user performance
   - Google Analytics 4 with Web Vitals

3. **Synthetic Monitoring**
   - Regular scheduled tests
   - Alert on performance regressions

---

## Quick Command Reference

### Test with Lighthouse CLI (if installed)
```bash
# Install
npm install -g lighthouse

# Test a page
lighthouse https://cvawvuaa.org/index.html \
  --preset=perf \
  --view \
  --output=html \
  --output-path=./reports/lighthouse-index.html

# Test mobile
lighthouse https://cvawvuaa.org/index.html \
  --preset=perf \
  --view \
  --emulated-form-factor=mobile

# Test desktop
lighthouse https://cvawvuaa.org/index.html \
  --preset=perf \
  --view \
  --emulated-form-factor=desktop
```

### Batch Test Multiple Pages
```bash
#!/bin/bash
PAGES=("index.html" "scholarship.html" "programs.html" "membership.html")
for page in "${PAGES[@]}"; do
  lighthouse "https://cvawvuaa.org/$page" \
    --preset=perf \
    --output=html \
    --output-path="./reports/lighthouse-$page"
done
```

---

## Resources

- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Web Vitals Guide:** https://web.dev/vitals/
- **Lighthouse Documentation:** https://developer.chrome.com/docs/lighthouse/
- **WebPageTest:** https://webpagetest.org/
- **Chrome DevTools:** https://developer.chrome.com/docs/devtools/

---

## Next Steps After Testing

1. ✅ Document all test results
2. ✅ Identify top 3 optimization opportunities
3. ✅ Create implementation plan for improvements
4. ✅ Set up performance monitoring
5. ✅ Schedule regular performance audits (monthly)

---

**Created:** October 20, 2025  
**Last Updated:** October 20, 2025  
**Maintained by:** CVCWVUAA Web Team

// Mobile-specific interactions for CVCWVUAA
// Enhances touch experience with gestures, click-to-call, and mobile optimizations

class MobileEnhancer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768) ||
           ('ontouchstart' in window);
  }

  init() {
    if (!this.isMobile) return;
    
    console.log('Mobile enhancements active');
    
    // Add mobile-specific body class
    document.body.classList.add('mobile-enhanced');
    
    // Initialize mobile features
    this.setupClickToCall();
    this.setupClickToEmail();
    this.setupTouchGestures();
    this.setupPhotoStripSwipe();
    this.setupMobileNavigation();
    this.setupTapToTop();
    this.setupHapticFeedback();
    this.setupPullToRefresh();
  }

  setupClickToCall() {
    // Convert phone numbers to clickable links
    const phonePatterns = [
      /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, // (123) 456-7890 or similar
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g        // 123-456-7890 or similar
    ];
    
    const textNodes = this.getTextNodes(document.body);
    
    textNodes.forEach(node => {
      let text = node.textContent;
      let modified = false;
      
      phonePatterns.forEach(pattern => {
        if (pattern.test(text)) {
          text = text.replace(pattern, (match) => {
            const cleanNumber = match.replace(/\D/g, '');
            if (cleanNumber.length === 10 || cleanNumber.length === 11) {
              modified = true;
              return `<a href="tel:+1${cleanNumber.slice(-10)}" class="mobile-phone-link">${match}</a>`;
            }
            return match;
          });
        }
      });
      
      if (modified) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = text;
        node.parentNode.replaceChild(wrapper, node);
      }
    });
  }

  setupClickToEmail() {
    // Convert email addresses to mailto links
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const textNodes = this.getTextNodes(document.body);
    
    textNodes.forEach(node => {
      const text = node.textContent;
      if (emailPattern.test(text)) {
        const modifiedText = text.replace(emailPattern, (email) => {
          return `<a href="mailto:${email}" class="mobile-email-link">${email}</a>`;
        });
        
        const wrapper = document.createElement('span');
        wrapper.innerHTML = modifiedText;
        node.parentNode.replaceChild(wrapper, node);
      }
    });
  }

  setupTouchGestures() {
    // Add swipe gestures to cards and images
    const swipeableElements = document.querySelectorAll('.card, .hp-card, img');
    
    swipeableElements.forEach(element => {
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      
      element.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
        element.classList.add('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchmove', (e) => {
        // Add visual feedback for active touch
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);
        
        if (deltaX > 10 || deltaY > 10) {
          element.classList.add('touch-moving');
        }
      }, { passive: true });
      
      element.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = endTime - startTime;
        
        element.classList.remove('touch-active', 'touch-moving');
        
        // Detect swipe (fast horizontal movement)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
          const direction = deltaX > 0 ? 'right' : 'left';
          this.handleSwipe(element, direction);
        }
      }, { passive: true });
    });
  }

  setupPhotoStripSwipe() {
    const photoStrip = document.querySelector('.photo-strip');
    if (!photoStrip) return;
    
    let isScrolling = false;
    let startX = 0;
    
    photoStrip.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isScrolling = false;
    }, { passive: true });
    
    photoStrip.addEventListener('touchmove', (e) => {
      if (!isScrolling) {
        const currentX = e.touches[0].clientX;
        const diffX = Math.abs(currentX - startX);
        
        if (diffX > 10) {
          isScrolling = true;
          photoStrip.style.scrollBehavior = 'smooth';
        }
      }
    }, { passive: true });
    
    photoStrip.addEventListener('touchend', () => {
      isScrolling = false;
    }, { passive: true });
  }

  setupMobileNavigation() {
    // Enhanced mobile navigation
    const nav = document.getElementById('site-nav');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (nav && navToggle) {
      // Close nav when clicking outside
      document.addEventListener('touchstart', (e) => {
        if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Add swipe to close navigation
      let navStartY = 0;
      
      nav.addEventListener('touchstart', (e) => {
        navStartY = e.touches[0].clientY;
      }, { passive: true });
      
      nav.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - navStartY;
        
        // Swipe up to close nav
        if (deltaY < -50) {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }, { passive: true });
    }
  }

  setupTapToTop() {
    // Double-tap header to scroll to top
    const header = document.querySelector('header.site');
    if (!header) return;
    
    let lastTap = 0;
    
    header.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Scrolled to top');
      }
      
      lastTap = currentTime;
    });
  }

  setupHapticFeedback() {
    // Add haptic feedback for supported devices
    const buttons = document.querySelectorAll('button, .btn, a.btn');
    
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        // Haptic feedback for modern browsers
        if ('vibrate' in navigator) {
          navigator.vibrate(10); // Very short vibration
        }
      });
    });
  }

  setupPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    let refreshing = false;
    
    const refreshIndicator = this.createRefreshIndicator();
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0 && !refreshing) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (startY === 0 || refreshing) return;
      
      currentY = e.touches[0].clientY;
      pullDistance = currentY - startY;
      
      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault();
        
        const threshold = 100;
        const progress = Math.min(pullDistance / threshold, 1);
        
        refreshIndicator.style.opacity = progress;
        refreshIndicator.style.transform = `translateY(${pullDistance * 0.5}px) rotate(${progress * 180}deg)`;
        
        if (pullDistance > threshold) {
          refreshIndicator.classList.add('ready');
        } else {
          refreshIndicator.classList.remove('ready');
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (pullDistance > 100 && !refreshing) {
        this.performRefresh(refreshIndicator);
      } else {
        this.resetRefresh(refreshIndicator);
      }
      
      startY = 0;
      pullDistance = 0;
    }, { passive: true });
  }

  createRefreshIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'pull-refresh-indicator';
    indicator.innerHTML = '↻';
    document.body.appendChild(indicator);
    return indicator;
  }

  async performRefresh(indicator) {
    indicator.classList.add('refreshing');
    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(50px)';
    
    try {
      // Simulate refresh - in production, this could reload data
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.showToast('Page refreshed');
    } catch (error) {
      this.showToast('Refresh failed');
    } finally {
      this.resetRefresh(indicator);
    }
  }

  resetRefresh(indicator) {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateY(0)';
    indicator.classList.remove('ready', 'refreshing');
  }

  handleSwipe(element, direction) {
    console.log(`Swiped ${direction} on`, element);
    
    // Add visual feedback
    element.style.transform = `translateX(${direction === 'right' ? '10px' : '-10px'})`;
    setTimeout(() => {
      element.style.transform = '';
    }, 200);
    
    // Could trigger actions like next/prev navigation
    this.triggerHapticFeedback();
  }

  triggerHapticFeedback() {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  getTextNodes(node) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style elements
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    let currentNode;
    while (currentNode = walker.nextNode()) {
      textNodes.push(currentNode);
    }
    
    return textNodes;
  }

  // Static utility methods
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }

  static addMobileClass() {
    if (MobileEnhancer.isMobileDevice()) {
      document.body.classList.add('mobile-device');
    }
  }
}

// Auto-initialize mobile enhancements
document.addEventListener('DOMContentLoaded', () => {
  const mobileEnhancer = new MobileEnhancer();
  
  // Make available globally
  window.MobileEnhancer = MobileEnhancer;
  window.mobileEnhancer = mobileEnhancer;
});

// Add mobile class early
MobileEnhancer.addMobileClass();
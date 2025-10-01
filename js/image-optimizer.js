// Lazy loading and image optimization for CVCWVUAA
// Improves mobile performance by deferring non-critical image loads

class ImageOptimizer {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    // Use Intersection Observer for modern browsers
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.setupScrollListener();
    }
    
    // Process existing images
    this.processImages();
    
    // Handle dynamically added images
    this.setupMutationObserver();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px', // Load images 50px before they come into view
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  setupScrollListener() {
    // Throttled scroll listener for older browsers
    let ticking = false;
    
    const checkImages = () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        if (this.isInViewport(img)) {
          this.loadImage(img);
        }
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(checkImages);
        ticking = true;
      }
    });
    
    // Initial check
    checkImages();
  }

  setupMutationObserver() {
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const images = node.tagName === 'IMG' ? 
                [node] : 
                Array.from(node.querySelectorAll ? node.querySelectorAll('img') : []);
              
              images.forEach(img => this.setupLazyLoading(img));
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  processImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => this.setupLazyLoading(img));
  }

  setupLazyLoading(img) {
    // Skip if already processed or has no src
    if (img.dataset.processed || !img.src) return;
    
    // Skip small images (likely icons or logos)
    if (img.width < 50 && img.height < 50) return;
    
    // Move src to data-src for lazy loading
    if (!img.dataset.src && img.src) {
      img.dataset.src = img.src;
      img.src = this.generatePlaceholder(img.width || 300, img.height || 200);
      img.classList.add('lazy-loading');
    }
    
    // Add to intersection observer
    if (this.observer) {
      this.observer.observe(img);
    }
    
    img.dataset.processed = 'true';
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Fade in effect
      img.style.transition = 'opacity 0.3s ease';
      img.style.opacity = '0';
      
      setTimeout(() => {
        img.src = src;
        img.style.opacity = '1';
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        // Remove data-src to prevent reprocessing
        delete img.dataset.src;
      }, 10);
    };
    
    imageLoader.onerror = () => {
      console.warn('Failed to load image:', src);
      img.classList.add('lazy-error');
    };
    
    imageLoader.src = src;
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top <= windowHeight + 50 && // 50px buffer
      rect.left <= windowWidth &&
      rect.bottom >= -50 &&
      rect.right >= 0
    );
  }

  generatePlaceholder(width, height) {
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Utility method to optimize image URLs
  static optimizeImageUrl(originalUrl, options = {}) {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // For external images or when no optimization service is available,
    // return original URL. In production, you could integrate with services
    // like Cloudinary, ImageKit, or use picture elements with WebP
    
    if (originalUrl.startsWith('http') && !originalUrl.includes(window.location.hostname)) {
      return originalUrl;
    }
    
    // For local images, could add query parameters for future processing
    let optimizedUrl = originalUrl;
    
    if (width || height) {
      const separator = originalUrl.includes('?') ? '&' : '?';
      const params = new URLSearchParams();
      
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      if (quality !== 80) params.set('q', quality.toString());
      if (format !== 'jpg') params.set('f', format);
      
      optimizedUrl += separator + params.toString();
    }
    
    return optimizedUrl;
  }

  // Method to create responsive image elements
  static createResponsiveImage(src, alt, options = {}) {
    const { sizes = [], className = '', loading = 'lazy' } = options;
    
    // Support for WebP with fallback
    const picture = document.createElement('picture');
    
    // Add WebP source if supported
    if (sizes.length > 0) {
      const webpSource = document.createElement('source');
      webpSource.type = 'image/webp';
      webpSource.srcset = sizes.map(size => 
        `${ImageOptimizer.optimizeImageUrl(src, { ...size, format: 'webp' })} ${size.width}w`
      ).join(', ');
      picture.appendChild(webpSource);
    }
    
    // Regular image fallback
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = loading;
    img.className = className;
    
    if (sizes.length > 0) {
      img.srcset = sizes.map(size => 
        `${ImageOptimizer.optimizeImageUrl(src, size)} ${size.width}w`
      ).join(', ');
      img.sizes = '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw';
    }
    
    picture.appendChild(img);
    return picture;
  }
}

// Auto-initialize image optimizer
document.addEventListener('DOMContentLoaded', () => {
  const imageOptimizer = new ImageOptimizer();
  
  // Make available globally
  window.ImageOptimizer = ImageOptimizer;
  window.imageOptimizer = imageOptimizer;
});

// Preload critical images
document.addEventListener('DOMContentLoaded', () => {
  const criticalImages = [
    '/assets/logo.png',
    '/assets/favicon.png'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
});
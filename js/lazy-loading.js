/**
 * Lazy Loading Implementation for CVCWVUAA Website
 * Improves performance by loading images only when they're about to enter viewport
 * Uses Intersection Observer API for efficient detection
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,     // Trigger when 1% of image is visible
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-error'
    };
    
    /**
     * Lazy load images using Intersection Observer
     */
    function initLazyImages() {
        // Get all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        
        if (lazyImages.length === 0) {
            return;
        }
        
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: CONFIG.rootMargin,
                threshold: CONFIG.threshold
            });
            
            // Observe all lazy images
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
            
            console.log(`✅ Lazy loading initialized for ${lazyImages.length} images`);
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => loadImage(img));
            console.log('⚠️ IntersectionObserver not supported, loaded all images immediately');
        }
    }
    
    /**
     * Load a single image
     */
    function loadImage(img) {
        const src = img.dataset.src || img.src;
        
        if (!src) return;
        
        // Add loading class
        img.classList.add(CONFIG.loadingClass);
        
        // Create temporary image to preload
        const tempImg = new Image();
        
        tempImg.onload = function() {
            // Set the actual source
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
            
            // Update srcset if present
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                delete img.dataset.srcset;
            }
            
            // Replace loading class with loaded class
            img.classList.remove(CONFIG.loadingClass);
            img.classList.add(CONFIG.loadedClass);
            
            // Trigger custom event
            img.dispatchEvent(new CustomEvent('lazyloaded', { bubbles: true }));
        };
        
        tempImg.onerror = function() {
            img.classList.remove(CONFIG.loadingClass);
            img.classList.add(CONFIG.errorClass);
            console.error('Failed to load image:', src);
        };
        
        tempImg.src = src;
    }
    
    /**
     * Lazy load background images
     */
    function initLazyBackgrounds() {
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        
        if (lazyBackgrounds.length === 0) {
            return;
        }
        
        if ('IntersectionObserver' in window) {
            const bgObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const bgUrl = element.dataset.bg;
                        
                        if (bgUrl) {
                            element.style.backgroundImage = `url('${bgUrl}')`;
                            element.classList.add(CONFIG.loadedClass);
                            delete element.dataset.bg;
                            observer.unobserve(element);
                        }
                    }
                });
            }, {
                rootMargin: CONFIG.rootMargin,
                threshold: CONFIG.threshold
            });
            
            lazyBackgrounds.forEach(el => bgObserver.observe(el));
            console.log(`✅ Lazy loading initialized for ${lazyBackgrounds.length} background images`);
        } else {
            // Fallback
            lazyBackgrounds.forEach(el => {
                const bgUrl = el.dataset.bg;
                if (bgUrl) {
                    el.style.backgroundImage = `url('${bgUrl}')`;
                    delete el.dataset.bg;
                }
            });
        }
    }
    
    /**
     * Lazy load iframes (social media embeds, videos)
     */
    function initLazyIframes() {
        const lazyIframes = document.querySelectorAll('iframe[data-src]');
        
        if (lazyIframes.length === 0) {
            return;
        }
        
        if ('IntersectionObserver' in window) {
            const iframeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target;
                        
                        if (iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                            iframe.classList.add(CONFIG.loadedClass);
                            delete iframe.dataset.src;
                            observer.unobserve(iframe);
                        }
                    }
                });
            }, {
                rootMargin: CONFIG.rootMargin,
                threshold: CONFIG.threshold
            });
            
            lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
            console.log(`✅ Lazy loading initialized for ${lazyIframes.length} iframes`);
        }
    }
    
    /**
     * Add native lazy loading attribute to images
     */
    function enhanceNativeLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        let count = 0;
        
        images.forEach((img, index) => {
            // Skip first 3 images (above fold)
            if (index >= 3) {
                img.setAttribute('loading', 'lazy');
                count++;
            }
        });
        
        if (count > 0) {
            console.log(`✅ Added native lazy loading to ${count} images`);
        }
    }
    
    /**
     * Initialize all lazy loading features
     */
    function init() {
        console.log('🚀 Initializing lazy loading...');
        
        // Initialize different types of lazy loading
        initLazyImages();
        initLazyBackgrounds();
        initLazyIframes();
        enhanceNativeLazyLoading();
        
        console.log('✅ Lazy loading initialization complete');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for external use
    window.LazyLoader = {
        init: init,
        loadImage: loadImage
    };
})();

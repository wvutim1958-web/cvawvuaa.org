/**
 * WVU Navigation Component JavaScript
 * Handles mobile menu toggle and dropdown accessibility
 */

(function() {
  'use strict';
  
  // Mobile menu toggle
  const navToggle = document.querySelector('.wvu-site-nav__toggle');
  const navItems = document.getElementById('wvu-site-nav-items');
  
  if (navToggle && navItems) {
    navToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navItems.classList.toggle('open');
    });
  }
  
  // Dropdown menu handling for mobile
  const dropdownParents = document.querySelectorAll('.wvu-site-nav__menu-item-has-children');
  
  dropdownParents.forEach(function(parent) {
    const link = parent.querySelector('a');
    const submenu = parent.querySelector('.wvu-site-nav__sub-menu');
    
    if (link && submenu) {
      // On mobile, prevent default click and toggle dropdown
      link.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
          e.preventDefault();
          parent.classList.toggle('open');
        }
      });
      
      // Desktop: hover to open
      if (window.innerWidth >= 992) {
        parent.addEventListener('mouseenter', function() {
          this.classList.add('open');
        });
        
        parent.addEventListener('mouseleave', function() {
          this.classList.remove('open');
        });
      }
    }
  });
  
  // Keyboard navigation support
  document.addEventListener('keydown', function(e) {
    // Escape key closes menus
    if (e.key === 'Escape') {
      // Close mobile menu
      if (navToggle && navItems && navItems.classList.contains('open')) {
        navToggle.click();
      }
      
      // Close dropdown menus
      dropdownParents.forEach(function(parent) {
        parent.classList.remove('open');
      });
    }
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navItems && navItems.classList.contains('open')) {
      if (!e.target.closest('.wvu-site-nav')) {
        navToggle.click();
      }
    }
  });
  
  // Handle window resize - close mobile menu if opened when resizing to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth >= 992 && navItems && navItems.classList.contains('open')) {
        navItems.classList.remove('open');
        if (navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    }, 250);
  });
  
})();

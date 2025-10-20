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
  const navLinks = document.querySelectorAll('.wvu-site-nav__menu a');
  
  navLinks.forEach(function(link) {
    link.addEventListener('keydown', function(e) {
      const parent = this.parentElement;
      const submenu = parent.querySelector('.wvu-site-nav__sub-menu');
      
      // Enter or Space on parent link opens submenu
      if (submenu && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        parent.classList.toggle('open');
        
        // Focus first submenu item when opening
        if (parent.classList.contains('open')) {
          const firstSubmenuLink = submenu.querySelector('a');
          if (firstSubmenuLink) {
            firstSubmenuLink.focus();
          }
        }
      }
      
      // Escape closes submenu
      if (e.key === 'Escape') {
        const openParent = this.closest('.wvu-site-nav__menu-item-has-children.open');
        if (openParent) {
          openParent.classList.remove('open');
          openParent.querySelector('a').focus();
        }
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.wvu-site-nav')) {
      document.querySelectorAll('.wvu-site-nav__menu-item-has-children.open').forEach(function(item) {
        item.classList.remove('open');
      });
    }
  });
})();

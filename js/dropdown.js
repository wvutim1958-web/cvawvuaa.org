// Enhanced dropdown functionality for all pages
// Handles both desktop click and mobile touch interactions
// Also maintains hover functionality for desktop users

(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }

  function initDropdowns() {
    // Handle mobile nav toggle
    const navBtn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (navBtn && nav) {
      navBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Handle dropdown functionality for all devices
    document.querySelectorAll('.menu.dropdown').forEach(menu => {
      const btn = menu.querySelector('.dropbtn');
      const panel = menu.querySelector('.dropdown-panel');
      
      if (btn && panel) {
        // Click functionality for all devices
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Close other dropdowns first
          document.querySelectorAll('.menu.dropdown').forEach(otherMenu => {
            if (otherMenu !== menu) {
              otherMenu.classList.remove('open');
              const otherBtn = otherMenu.querySelector('.dropbtn');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });
          
          // Toggle current dropdown
          const isOpen = menu.classList.toggle('open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu.dropdown')) {
        document.querySelectorAll('.menu.dropdown').forEach(menu => {
          menu.classList.remove('open');
          const btn = menu.querySelector('.dropbtn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.menu.dropdown').forEach(menu => {
          menu.classList.remove('open');
          const btn = menu.querySelector('.dropbtn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
})();
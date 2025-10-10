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

    // Handle dropdown functionality
    // On desktop: hover shows dropdown (CSS), click does nothing (just use dropdown items)
    // On mobile: click toggles dropdown
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobile = window.innerWidth <= 768;
    
    if (isTouchDevice || isMobile) {
      // Mobile: Click toggles dropdown
      document.querySelectorAll('.menu.dropdown').forEach(menu => {
        const btn = menu.querySelector('.dropbtn');
        const panel = menu.querySelector('.dropdown-panel');
        
        if (btn && panel) {
          // Determine the main page URL based on button text
          const btnText = btn.textContent.trim().toLowerCase();
          let mainPageUrl = '/about.html';
          if (btnText.includes('news')) {
            mainPageUrl = '/news/';
          }
          
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // If already open, navigate to main page instead
            if (menu.classList.contains('open')) {
              window.location.href = mainPageUrl;
              return;
            }
            
            // Close other dropdowns first
            document.querySelectorAll('.menu.dropdown').forEach(otherMenu => {
              if (otherMenu !== menu) {
                otherMenu.classList.remove('open');
                const otherBtn = otherMenu.querySelector('.dropbtn');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
              }
            });
            
            // Open current dropdown
            menu.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
          });
        }
      });
    }
    // Desktop: No JavaScript needed - CSS :hover handles everything!

    // Close dropdown when clicking outside (mobile/touch only)
    if (isTouchDevice || isMobile) {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu.dropdown')) {
          document.querySelectorAll('.menu.dropdown').forEach(menu => {
            menu.classList.remove('open');
            const btn = menu.querySelector('.dropbtn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

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
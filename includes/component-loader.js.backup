// Load WVU Components
(function() {
  // Wait for DOM to be ready
  function loadComponents() {
    console.log('Loading WVU components...');
    
    // Load Masthead
    fetch('/includes/masthead.html')
      .then(response => {
        console.log('Masthead fetch response:', response.status);
        return response.text();
      })
      .then(html => {
        const mastheadEl = document.getElementById('wvu-masthead');
        if (mastheadEl) {
          mastheadEl.innerHTML = html;
          console.log('Masthead loaded successfully');
        } else {
          console.error('Element #wvu-masthead not found');
        }
      })
      .catch(err => console.error('Error loading masthead:', err));
    
    // Load Navigation  
    fetch('/includes/navigation.html')
      .then(response => {
        console.log('Navigation fetch response:', response.status);
        return response.text();
      })
      .then(html => {
        const navEl = document.getElementById('wvu-navigation');
        if (navEl) {
          navEl.innerHTML = html;
          console.log('Navigation loaded successfully');
          // Load navigation JavaScript after HTML is inserted
          const script = document.createElement('script');
          script.src = '/js/wvu-navigation.js';
          document.body.appendChild(script);
        } else {
          console.error('Element #wvu-navigation not found');
        }
      })
      .catch(err => console.error('Error loading navigation:', err));
    
    // Load Footer
    fetch('/includes/footer.html')
      .then(response => {
        console.log('Footer fetch response:', response.status);
        return response.text();
      })
      .then(html => {
        const footerEl = document.getElementById('wvu-footer');
        if (footerEl) {
          footerEl.innerHTML = html;
          console.log('Footer loaded successfully');
          // Update year stamp after footer loads
          const yearElement = document.getElementById('year');
          if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
          }
        } else {
          console.error('Element #wvu-footer not found');
        }
      })
      .catch(err => console.error('Error loading footer:', err));
  }
  
  // Load components when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
  } else {
    loadComponents();
  }
})();

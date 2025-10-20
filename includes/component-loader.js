<script>
  // Load WVU Components
  (function() {
    // Load Masthead
    fetch('/includes/masthead.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('wvu-masthead').innerHTML = html;
      })
      .catch(err => console.error('Error loading masthead:', err));
    
    // Load Navigation  
    fetch('/includes/navigation.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('wvu-navigation').innerHTML = html;
        // Load navigation JavaScript after HTML is inserted
        const script = document.createElement('script');
        script.src = '/js/wvu-navigation.js';
        document.body.appendChild(script);
      })
      .catch(err => console.error('Error loading navigation:', err));
    
    // Load Footer
    fetch('/includes/footer.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('wvu-footer').innerHTML = html;
      })
      .catch(err => console.error('Error loading footer:', err));
  })();
</script>

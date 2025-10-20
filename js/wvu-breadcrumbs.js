/**
 * WVU Breadcrumb Navigation Generator
 * Automatically generates breadcrumb navigation with schema.org markup
 * Based on current page URL
 */

(function() {
  'use strict';
  
  /**
   * Generate breadcrumbs based on the current page path
   */
  function generateBreadcrumbs() {
    const breadcrumbContainer = document.getElementById('wvu-breadcrumbs');
    if (!breadcrumbContainer) return;
    
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Don't show breadcrumbs on homepage
    if (currentPath === '/' || currentPage === 'index.html') {
      breadcrumbContainer.style.display = 'none';
      return;
    }
    
    // Page name mapping (filename to display name)
    const pageNames = {
      'about.html': 'About',
      'board.html': 'Board Members',
      'bylaws.html': 'Bylaws',
      'contact.html': 'Contact',
      'events.html': 'Events',
      'membership.html': 'Membership',
      'pay.html': 'Join & Donate',
      'programs.html': 'Programs',
      'resources.html': 'Resources',
      'scholarship.html': 'Scholarship',
      'scores.html': 'Scores',
      'news.html': 'News',
      'alumni-spotlight.html': 'Alumni Spotlight',
      'alumni-spotlight-submit.html': 'Submit Your Story',
      'media.html': 'Media',
      'minutes.html': 'Meeting Minutes',
      'search.html': 'Search'
    };
    
    // Get the display name for current page
    const currentPageName = pageNames[currentPage] || currentPage.replace('.html', '').replace(/-/g, ' ');
    
    // Build breadcrumb items with schema.org markup
    const breadcrumbItems = [
      {
        name: 'Home',
        url: '/',
        position: 1
      },
      {
        name: currentPageName,
        url: currentPath,
        position: 2,
        isCurrentPage: true
      }
    ];
    
    // Generate HTML with schema.org structured data
    const breadcrumbHTML = `
      <nav class="wvu-breadcrumbs" aria-label="Breadcrumb">
        <div class="wvu-breadcrumbs__container">
          <ol class="wvu-slash-list" itemscope itemtype="https://schema.org/BreadcrumbList">
            ${breadcrumbItems.map(item => `
              <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                ${item.isCurrentPage ? 
                  `<span itemprop="name">${item.name}</span>` :
                  `<a href="${item.url}" itemprop="item">
                    <span itemprop="name">${item.name}</span>
                  </a>`
                }
                <meta itemprop="position" content="${item.position}" />
              </li>
            `).join('')}
          </ol>
        </div>
      </nav>
    `;
    
    breadcrumbContainer.innerHTML = breadcrumbHTML;
  }
  
  // Initialize breadcrumbs when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateBreadcrumbs);
  } else {
    generateBreadcrumbs();
  }
  
})();

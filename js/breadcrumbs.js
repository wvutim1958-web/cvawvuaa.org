// Breadcrumb navigation utility for CVCWVUAA site
// Generates and manages breadcrumb navigation based on page hierarchy

class BreadcrumbManager {
  constructor() {
    this.pathMappings = {
      // Map of URL paths to readable names
      '': 'Home',
      'index.html': 'Home',
      'about.html': 'About the Chapter',
      'pay.html': 'Membership',
      'board.html': 'Board Members',
      'minutes.html': 'Meeting Minutes',
      'bylaws.html': 'Bylaws & Proclamation',
      'events.html': 'Events',
      'scores.html': 'Scores',
      'resources.html': 'Resources',
      'programs.html': 'Programs',
      'scholarship.html': 'Scholarship',
      'media.html': 'Media',
      'news.html': 'Calendar',
      'search.html': 'Search',
      'contact.html': 'Contact',
      'alumni-spotlight.html': 'Alumni Spotlight',
      'membership.html': 'Membership',
      'thanks.html': 'Thank You',
      
      // Subdirectories
      'programs': 'Programs',
      'scores': 'Scores',
      'events': 'Events',
      'news': 'News',
      'resources': 'Resources',
      
      // Specific pages
      'programs/bears-blankets.html': 'Bears & Blankets',
      'scores/high-school.html': 'High School Scores',
      'scores/live.html': 'Live Scores',
      'events/rsvp.html': 'Event RSVP',
      'news/index.html': 'News Archive',
      'resources/index.html': 'Resource Center'
    };
    
    this.init();
  }

  init() {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (breadcrumbContainer) {
      this.renderBreadcrumb(breadcrumbContainer);
    } else {
      // Auto-inject after main nav if no explicit container
      this.autoInject();
    }
  }

  getCurrentPath() {
    const path = window.location.pathname;
    // Remove leading slash and handle root
    return path === '/' ? '' : path.substring(1);
  }

  getPathSegments() {
    const currentPath = this.getCurrentPath();
    if (!currentPath) return [];
    
    const segments = [];
    const parts = currentPath.split('/');
    
    // Build cumulative paths
    let buildPath = '';
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) buildPath += '/';
      buildPath += parts[i];
      
      // For directory paths, also check if there's a mapping for just the directory
      const dirName = parts[i];
      const displayName = this.pathMappings[buildPath] || this.pathMappings[dirName] || this.formatName(parts[i]);
      
      segments.push({
        path: '/' + buildPath,
        name: displayName,
        isLast: i === parts.length - 1
      });
    }
    
    return segments;
  }

  formatName(filename) {
    // Convert filename to readable format
    return filename
      .replace(/\.html?$/, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  renderBreadcrumb(container, options = {}) {
    const segments = this.getPathSegments();
    
    // Don't show breadcrumbs for top-level pages unless forced
    if (segments.length <= 1 && !options.forceShow) {
      container.style.display = 'none';
      return;
    }

    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', 'Breadcrumb navigation');

    const list = document.createElement('ol');
    list.className = 'breadcrumb-list';

    // Always start with Home
    const homeItem = document.createElement('li');
    homeItem.className = 'breadcrumb-item';
    homeItem.innerHTML = '<a href="/index.html">Home</a>';
    list.appendChild(homeItem);

    // Add path segments
    segments.forEach(segment => {
      const item = document.createElement('li');
      item.className = 'breadcrumb-item';
      
      if (segment.isLast) {
        item.innerHTML = `<span class="breadcrumb-current">${segment.name}</span>`;
      } else {
        item.innerHTML = `<a href="${segment.path}">${segment.name}</a>`;
      }
      
      list.appendChild(item);
    });

    nav.appendChild(list);
    container.innerHTML = '';
    container.appendChild(nav);
    container.style.display = 'block';
  }

  autoInject() {
    const main = document.querySelector('main .wrapper');
    const segments = this.getPathSegments();
    
    // Only auto-inject for deeper pages
    if (!main || segments.length <= 1) return;

    const breadcrumbDiv = document.createElement('div');
    breadcrumbDiv.id = 'breadcrumb-container';
    
    // Insert after wrapper but before first child
    if (main.firstChild) {
      main.insertBefore(breadcrumbDiv, main.firstChild);
    } else {
      main.appendChild(breadcrumbDiv);
    }
    
    this.renderBreadcrumb(breadcrumbDiv);
  }

  // Utility to manually add breadcrumbs with custom paths
  static create(container, customPaths) {
    const manager = new BreadcrumbManager();
    if (customPaths) {
      Object.assign(manager.pathMappings, customPaths);
    }
    manager.renderBreadcrumb(container, { forceShow: true });
    return manager;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BreadcrumbManager();
});

// Make available globally
window.BreadcrumbManager = BreadcrumbManager;
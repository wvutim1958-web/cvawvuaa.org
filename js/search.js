// Unified search functionality for CVCWVUAA site
// Searches across news posts, minutes, and events with real-time filtering

class CVCWVUAASearch {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('search-container');
    this.placeholder = options.placeholder || 'Search news, events, minutes...';
    this.minLength = options.minLength || 2;
    this.data = {
      news: [],
      minutes: [],
      events: []
    };
    this.init();
  }

  async init() {
    if (!this.container) return;
    this.render();
    await this.loadData();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-wrapper">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            id="search-input" 
            placeholder="${this.placeholder}"
            autocomplete="off"
            spellcheck="false"
          >
          <button id="search-clear" style="display:none">&times;</button>
        </div>
        <div class="search-filters">
          <label><input type="checkbox" id="filter-news" checked> News</label>
          <label><input type="checkbox" id="filter-minutes" checked> Minutes</label>
          <label><input type="checkbox" id="filter-events" checked> Events</label>
        </div>
        <div id="search-results" class="search-results" style="display:none">
          <div class="search-status"></div>
          <div class="results-list"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector('#search-input');
    const clear = this.container.querySelector('#search-clear');
    const filters = this.container.querySelectorAll('.search-filters input');

    input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    input.addEventListener('focus', () => this.showResults());
    clear.addEventListener('click', () => this.clearSearch());
    
    filters.forEach(filter => {
      filter.addEventListener('change', () => this.handleSearch(input.value));
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideResults();
      }
    });
  }

  async loadData() {
    try {
      // Load news posts
      const newsRes = await fetch('/news/posts.json', { cache: 'no-store' });
      if (newsRes.ok) {
        const posts = await newsRes.json();
        this.data.news = posts.map(post => ({
          ...post,
          type: 'news',
          searchText: `${post.title} ${post.author || ''}`.toLowerCase(),
          url: `/news/index.html#${post.slug}`
        }));
      }

      // Load minutes
      const minutesRes = await fetch('/assets/minutes/minutes.json', { cache: 'no-store' });
      if (minutesRes.ok) {
        const minutes = await minutesRes.json();
        this.data.minutes = minutes.map(minute => ({
          ...minute,
          type: 'minutes',
          searchText: `${minute.title || ''} ${minute.note || ''}`.toLowerCase(),
          url: minute.url || `/assets/minutes/${minute.file}`
        }));
      }

      // Parse events from events page (static for now)
      this.data.events = [
        {
          title: 'Robert Morris Game Watch',
          date: '2025-08-30',
          type: 'events',
          searchText: 'robert morris game watch football',
          url: '/events.html#robert-morris'
        },
        {
          title: 'Pittsburgh Game Watch', 
          date: '2025-09-13',
          type: 'events',
          searchText: 'pittsburgh game watch football pitt',
          url: '/events.html#pittsburgh'
        },
        {
          title: 'UCF Game Watch',
          date: '2025-10-18', 
          type: 'events',
          searchText: 'ucf game watch football orlando',
          url: '/events.html#ucf'
        },
        {
          title: 'Colorado Game Watch',
          date: '2025-11-08',
          type: 'events', 
          searchText: 'colorado game watch football',
          url: '/events.html#colorado'
        }
      ];
    } catch (error) {
      console.warn('Search: Could not load all data sources', error);
    }
  }

  handleSearch(query) {
    const input = this.container.querySelector('#search-input');
    const clear = this.container.querySelector('#search-clear');
    
    if (query.length === 0) {
      clear.style.display = 'none';
      this.hideResults();
      return;
    }

    clear.style.display = 'block';

    if (query.length < this.minLength) {
      this.showResults();
      this.updateStatus(`Type ${this.minLength - query.length} more character${this.minLength - query.length === 1 ? '' : 's'}...`);
      this.updateResults([]);
      return;
    }

    const results = this.search(query);
    this.showResults();
    this.updateStatus(`${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`);
    this.updateResults(results);
  }

  search(query) {
    const lowerQuery = query.toLowerCase();
    const activeFilters = this.getActiveFilters();
    
    let results = [];

    // Search each data source
    ['news', 'minutes', 'events'].forEach(type => {
      if (!activeFilters.includes(type)) return;
      
      const matches = this.data[type].filter(item => 
        item.searchText.includes(lowerQuery) ||
        (item.title && item.title.toLowerCase().includes(lowerQuery))
      );
      
      results = results.concat(matches);
    });

    // Sort by relevance and date
    results.sort((a, b) => {
      // Exact title matches first
      const aExact = a.title?.toLowerCase().includes(lowerQuery) ? 0 : 1;
      const bExact = b.title?.toLowerCase().includes(lowerQuery) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      
      // Then by date (newest first)
      return (b.date || '').localeCompare(a.date || '');
    });

    return results.slice(0, 20); // Limit results
  }

  getActiveFilters() {
    const filters = this.container.querySelectorAll('.search-filters input:checked');
    return Array.from(filters).map(f => f.id.replace('filter-', ''));
  }

  showResults() {
    const results = this.container.querySelector('#search-results');
    results.style.display = 'block';
  }

  hideResults() {
    const results = this.container.querySelector('#search-results');
    results.style.display = 'none';
  }

  updateStatus(message) {
    const status = this.container.querySelector('.search-status');
    status.textContent = message;
  }

  updateResults(results) {
    const container = this.container.querySelector('.results-list');
    
    if (results.length === 0) {
      container.innerHTML = '<div class="no-results">No results found</div>';
      return;
    }

    container.innerHTML = results.map(item => `
      <div class="search-result" data-type="${item.type}">
        <div class="result-header">
          <a href="${item.url}" class="result-title">${this.highlightQuery(item.title || 'Untitled')}</a>
          <span class="result-type">${this.getTypeLabel(item.type)}</span>
        </div>
        <div class="result-meta">
          ${item.date ? this.formatDate(item.date) : ''}
          ${item.author ? ` • ${item.author}` : ''}
          ${item.note ? ` • ${item.note}` : ''}
        </div>
      </div>
    `).join('');
  }

  highlightQuery(text) {
    const query = this.container.querySelector('#search-input').value;
    if (!query || query.length < this.minLength) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  getTypeLabel(type) {
    const labels = {
      news: 'News',
      minutes: 'Minutes', 
      events: 'Event'
    };
    return labels[type] || type;
  }

  formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  clearSearch() {
    const input = this.container.querySelector('#search-input');
    const clear = this.container.querySelector('#search-clear');
    
    input.value = '';
    clear.style.display = 'none';
    this.hideResults();
    input.focus();
  }
}

// Auto-initialize if search container exists
document.addEventListener('DOMContentLoaded', () => {
  const searchContainer = document.getElementById('search-container');
  if (searchContainer) {
    new CVCWVUAASearch();
  }
});
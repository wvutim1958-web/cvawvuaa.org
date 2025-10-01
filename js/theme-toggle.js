// Dark mode toggle functionality for CVCWVUAA site
// Simple and reliable theme switching with localStorage persistence

console.log('Theme toggle script loading...');

class ThemeManager {
  constructor() {
    console.log('ThemeManager constructor called');
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    console.log('ThemeManager init called');
    // Get saved theme or detect system preference
    const savedTheme = localStorage.getItem('cvcwvuaa-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    console.log('Initial theme:', this.currentTheme);
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('cvcwvuaa-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  applyTheme(theme) {
    console.log('Applying theme:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.updateToggleButtons();
  }

  setTheme(theme) {
    console.log('Setting theme to', theme);
    this.applyTheme(theme);
    console.log('Document data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    localStorage.setItem('cvcwvuaa-theme', theme);
  }

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', currentTheme, 'to', newTheme);
    this.setTheme(newTheme);
  }

  updateToggleButtons() {
    const buttons = document.querySelectorAll('.theme-toggle');
    buttons.forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      const text = btn.querySelector('.theme-text');
      
      if (this.currentTheme === 'dark') {
        if (icon) icon.textContent = '☀️';
        if (text) text.textContent = 'Light';
        btn.setAttribute('aria-label', 'Switch to light theme');
      } else {
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = 'Dark';
        btn.setAttribute('aria-label', 'Switch to dark theme');
      }
    });
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.innerHTML = `
      <span class="theme-icon">🌙</span>
      <span class="theme-text">Dark</span>
    `;
    
    button.addEventListener('click', () => this.toggle());
    this.updateToggleButtons();
    
    return button;
  }

  // Auto-inject toggle into navigation if nav exists
  autoInjectToggle() {
    console.log('autoInjectToggle called');
    // First, bind to existing theme toggle buttons
    const existingToggles = document.querySelectorAll('.theme-toggle');
    console.log('Found existing theme toggle buttons:', existingToggles.length);
    
    if (existingToggles.length > 0) {
      existingToggles.forEach((button, index) => {
        console.log(`Button ${index}:`, button, 'Already bound?', button.dataset.bound);
        if (!button.dataset.bound) {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Theme toggle button clicked!');
            this.toggle();
          });
          button.dataset.bound = 'true';
          console.log(`Bound click handler to button ${index}`);
        }
      });
      return; // Don't create new buttons if manual ones exist
    }
    
    // If no existing toggles, create one in the nav
    const nav = document.querySelector('.nav');
    if (nav) {
      console.log('Creating new toggle button in nav');
      const toggleButton = this.createToggleButton();
      nav.appendChild(toggleButton);
    }
    
    // Update all toggle buttons
    this.updateToggleButtons();
  }
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Theme toggle DOMContentLoaded fired');
  
  // Create theme manager
  const themeManager = new ThemeManager();
  console.log('Theme manager created:', themeManager);
  
  // Set up theme toggle buttons
  themeManager.autoInjectToggle();
  
  // Make available globally for manual usage
  window.themeManager = themeManager;
  
  console.log('Theme toggle initialization complete');
});
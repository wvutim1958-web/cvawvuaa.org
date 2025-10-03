// PWA Installation Manager for CVCWVUAA
// Handles service worker registration and app installation prompts

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version available');
          this.showUpdateNotification();
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstalledMessage();
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('PWA is running in standalone mode');
    }

    // Add install button to pages
    this.createInstallButton();
  }

  createInstallButton() {
    // Don't show if already installed
    if (this.isInstalled) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.className = 'pwa-install-btn';
    installBtn.innerHTML = `
      <span class="install-icon">📱</span>
      <span class="install-text">Install App</span>
    `;
    installBtn.title = 'Install CVCWVUAA app for offline access';
    installBtn.style.display = 'none';
    
    installBtn.addEventListener('click', () => this.installApp());

    // Add to navigation or create floating button
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.appendChild(installBtn);
    } else {
      // Floating button for pages without nav
      installBtn.classList.add('pwa-floating');
      document.body.appendChild(installBtn);
    }
  }

  showInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn && this.deferredPrompt && !this.isInstalled) {
      btn.style.display = 'flex';
    }
  }

  hideInstallButton() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.style.display = 'none';
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    try {
      const result = await this.deferredPrompt.prompt();
      console.log('Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        console.log('User accepted PWA install');
      } else {
        console.log('User dismissed PWA install');
      }
    } catch (error) {
      console.error('Error during PWA install:', error);
    }

    this.deferredPrompt = null;
  }

  showUpdateNotification() {
    // Simple update notification
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <span>App update available!</span>
        <button onclick="window.location.reload()">Update</button>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  showInstalledMessage() {
    // Show brief confirmation
    const message = document.createElement('div');
    message.className = 'pwa-installed-message';
    message.innerHTML = `
      <div class="installed-content">
        <span class="install-icon">✅</span>
        <span>App installed successfully!</span>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // Utility methods for checking PWA status
  static isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  static isOnline() {
    return navigator.onLine;
  }

  static canInstall() {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }
}

// Auto-initialize PWA manager
document.addEventListener('DOMContentLoaded', () => {
  const pwaManager = new PWAManager();
  
  // Make available globally
  window.PWAManager = PWAManager;
  window.pwaManager = pwaManager;
});

// Handle online/offline status changes
window.addEventListener('online', () => {
  console.log('Connection restored');
  document.body.classList.remove('offline');
  document.body.classList.add('online');
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  document.body.classList.remove('online');
  document.body.classList.add('offline');
});
// Social Media Integration for CVCWVUAA
// Handles sharing buttons, social feeds, and social media management

const SOCIAL_CONFIG = {
  // Social Media Accounts (update these with real handles)
  accounts: {
    facebook: 'https://facebook.com/CVCWVUAA',
    twitter: 'https://twitter.com/CVCWVUAA', 
    instagram: 'https://instagram.com/CVCWVUAA',
    linkedin: 'https://linkedin.com/company/CVCWVUAA',
    youtube: 'https://youtube.com/@CVCWVUAA'
  },
  
  // Sharing configuration
  sharing: {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    twitter: 'https://twitter.com/intent/tweet?url=',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=',
    email: 'mailto:?subject=Check out this WVU Alumni content&body='
  }
};

class SocialMediaManager {
  constructor() {
    this.currentUrl = window.location.href;
    this.pageTitle = document.title;
    this.init();
  }

  init() {
    this.createSocialLinks();
    this.createSharingButtons();
    this.addMetaTags();
    this.initSocialFeeds();
  }

  // Create social media follow links
  createSocialLinks() {
    const socialContainer = document.querySelector('.social-links');
    if (!socialContainer) return;

    const socialHTML = `
      <div class="social-media-links">
        <h3>Follow Us</h3>
        <div class="social-icons">
          <a href="${SOCIAL_CONFIG.accounts.facebook}" target="_blank" rel="noopener" class="social-link facebook" aria-label="Follow us on Facebook">
            <span class="social-icon">📘</span> Facebook
          </a>
          <a href="${SOCIAL_CONFIG.accounts.twitter}" target="_blank" rel="noopener" class="social-link twitter" aria-label="Follow us on Twitter">
            <span class="social-icon">🐦</span> Twitter
          </a>
          <a href="${SOCIAL_CONFIG.accounts.instagram}" target="_blank" rel="noopener" class="social-link instagram" aria-label="Follow us on Instagram">
            <span class="social-icon">📷</span> Instagram
          </a>
          <a href="${SOCIAL_CONFIG.accounts.linkedin}" target="_blank" rel="noopener" class="social-link linkedin" aria-label="Follow us on LinkedIn">
            <span class="social-icon">💼</span> LinkedIn
          </a>
          <a href="${SOCIAL_CONFIG.accounts.youtube}" target="_blank" rel="noopener" class="social-link youtube" aria-label="Subscribe to our YouTube">
            <span class="social-icon">📺</span> YouTube
          </a>
        </div>
      </div>
    `;
    
    socialContainer.innerHTML = socialHTML;
  }

  // Create sharing buttons for current page
  createSharingButtons() {
    const shareContainers = document.querySelectorAll('.share-buttons, .social-share');
    if (shareContainers.length === 0) return;

    const encodedUrl = encodeURIComponent(this.currentUrl);
    const encodedTitle = encodeURIComponent(this.pageTitle);

    const shareHTML = `
      <div class="share-section">
        <h4>Share This Page</h4>
        <div class="share-buttons-grid">
          <button onclick="socialManager.shareOn('facebook')" class="share-btn facebook" aria-label="Share on Facebook">
            📘 Facebook
          </button>
          <button onclick="socialManager.shareOn('twitter')" class="share-btn twitter" aria-label="Share on Twitter">
            🐦 Twitter
          </button>
          <button onclick="socialManager.shareOn('linkedin')" class="share-btn linkedin" aria-label="Share on LinkedIn">
            💼 LinkedIn
          </button>
          <button onclick="socialManager.shareOn('email')" class="share-btn email" aria-label="Share via Email">
            ✉️ Email
          </button>
          <button onclick="socialManager.copyLink()" class="share-btn copy" aria-label="Copy Link">
            🔗 Copy Link
          </button>
        </div>
      </div>
    `;

    shareContainers.forEach(container => {
      container.innerHTML = shareHTML;
    });
  }

  // Share on specific platform
  shareOn(platform) {
    const encodedUrl = encodeURIComponent(this.currentUrl);
    const encodedTitle = encodeURIComponent(this.pageTitle);
    
    let shareUrl;
    
    switch(platform) {
      case 'facebook':
        shareUrl = `${SOCIAL_CONFIG.sharing.facebook}${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `${SOCIAL_CONFIG.sharing.twitter}${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `${SOCIAL_CONFIG.sharing.linkedin}${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `${SOCIAL_CONFIG.sharing.email}${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      }
    }
  }

  // Copy current page link
  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.currentUrl);
      this.showNotification('Link copied to clipboard!', 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('Link copied to clipboard!', 'success');
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `social-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Add social media meta tags
  addMetaTags() {
    const head = document.head;
    const currentUrl = window.location.href;
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || 
                      'Central Virginia Chapter of the WVU Alumni Association - Stay connected to Mountaineer Nation';
    const image = 'https://cvawvuaa.org/assets/logo.png'; // Update with actual domain

    // Open Graph tags for Facebook
    this.addMetaTag('property', 'og:url', currentUrl);
    this.addMetaTag('property', 'og:type', 'website');
    this.addMetaTag('property', 'og:title', title);
    this.addMetaTag('property', 'og:description', description);
    this.addMetaTag('property', 'og:image', image);
    this.addMetaTag('property', 'og:site_name', 'CVCWVUAA');

    // Twitter Card tags
    this.addMetaTag('name', 'twitter:card', 'summary_large_image');
    this.addMetaTag('name', 'twitter:site', '@CVCWVUAA');
    this.addMetaTag('name', 'twitter:title', title);
    this.addMetaTag('name', 'twitter:description', description);
    this.addMetaTag('name', 'twitter:image', image);
  }

  addMetaTag(attribute, name, content) {
    if (!document.querySelector(`meta[${attribute}="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  // Initialize social media feeds (placeholder for future API integration)
  initSocialFeeds() {
    const feedContainers = document.querySelectorAll('.social-feed');
    if (feedContainers.length === 0) return;

    feedContainers.forEach(container => {
      container.innerHTML = `
        <div class="social-feed-placeholder">
          <h3>Latest from Social Media</h3>
          <p>🔄 Social media feeds will be displayed here.</p>
          <p>Connect with us on our social platforms for the latest updates!</p>
          <div class="feed-links">
            <a href="${SOCIAL_CONFIG.accounts.facebook}" target="_blank">Facebook</a>
            <a href="${SOCIAL_CONFIG.accounts.twitter}" target="_blank">Twitter</a>
            <a href="${SOCIAL_CONFIG.accounts.instagram}" target="_blank">Instagram</a>
          </div>
        </div>
      `;
    });
  }
}

// Initialize social media manager
let socialManager;
document.addEventListener('DOMContentLoaded', () => {
  socialManager = new SocialMediaManager();
});

// Add CSS animations
const socialStyles = document.createElement('style');
socialStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(socialStyles);
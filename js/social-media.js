// Social Media Integration for CVCWVUAA
// Handles sharing buttons, social feeds, and social media management

const SOCIAL_CONFIG = {
  // Social Media Accounts - Real CVCWVUAA accounts
  accounts: {
    facebook: 'https://www.facebook.com/CentralVirginiaWVUAlumni',
    twitter: null, // Not active yet
    instagram: 'https://www.instagram.com/cvcwvuaa',
    linkedin: null, // Not active yet
    youtube: null // Not active yet
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

    // Hide this section - we'll use the Connect With Us cards instead
    socialContainer.style.display = 'none';
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
            Facebook
          </button>
          <button onclick="socialManager.shareOn('twitter')" class="share-btn twitter" aria-label="Share on Twitter">
            Twitter
          </button>
          <button onclick="socialManager.shareOn('linkedin')" class="share-btn linkedin" aria-label="Share on LinkedIn">
            LinkedIn
          </button>
          <button onclick="socialManager.shareOn('email')" class="share-btn email" aria-label="Share via Email">
            Email
          </button>
          <button onclick="socialManager.copyLink()" class="share-btn copy" aria-label="Copy Link">
            Copy Link
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

  // Initialize social media feeds with Facebook Page Plugin
  initSocialFeeds() {
    const feedContainers = document.querySelectorAll('.social-feed');
    if (feedContainers.length === 0) return;

    feedContainers.forEach(container => {
      if (SOCIAL_CONFIG.accounts.facebook) {
        // Create enhanced social card with Facebook plugin attempt
        container.innerHTML = `
          <div class="social-feed-container">
            <h3>Connect With Us</h3>
            
            <!-- Social Media Cards -->
            <div class="social-cards-grid">
              <a href="${SOCIAL_CONFIG.accounts.facebook}" target="_blank" rel="noopener" class="social-card facebook-card">
                <div class="social-card-icon">📘</div>
                <div class="social-card-content">
                  <h4>Follow on Facebook</h4>
                  <p>See our latest posts, photos, and event updates</p>
                  <span class="social-card-button">Visit Page →</span>
                </div>
              </a>
              
              ${SOCIAL_CONFIG.accounts.instagram ? `
              <a href="${SOCIAL_CONFIG.accounts.instagram}" target="_blank" rel="noopener" class="social-card instagram-card">
                <div class="social-card-icon">📷</div>
                <div class="social-card-content">
                  <h4>Follow on Instagram</h4>
                  <p>View photos and stories from our events</p>
                  <span class="social-card-button">View Profile →</span>
                </div>
              </a>
              ` : ''}
            </div>
            

          </div>
        `;
        
        // Facebook SDK not needed since we're not using the feed plugin
      } else {
        // Fallback if no Facebook account
        container.innerHTML = `
          <div class="social-feed-placeholder">
            <h3>Latest from Social Media</h3>
            <p>Connect with us on our social platforms for the latest updates!</p>
          </div>
        `;
      }
    });
  }

  // Load Facebook SDK
  loadFacebookSDK() {
    // Add Facebook root div if not exists
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.insertBefore(fbRoot, document.body.firstChild);
    }
    
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      FB.init({
        xfbml: true,
        version: 'v18.0'
      });
    };
    
    // Add Facebook SDK script
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => {
      console.error('Failed to load Facebook SDK');
      // Show fallback message
      document.querySelectorAll('.social-feed').forEach(container => {
        container.innerHTML = `
          <div class="social-feed-placeholder">
            <h3>Latest from Facebook</h3>
            <p>Visit our <a href="${SOCIAL_CONFIG.accounts.facebook}" target="_blank" rel="noopener">Facebook page</a> to see our latest posts and updates!</p>
          </div>
        `;
      });
    };
    
    document.body.appendChild(script);
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
/**
 * Simple Member Portal - Guaranteed Working Version
 * Simplified for maximum compatibility
 */

// Immediately Available Global Object
window.SimpleMemberPortal = {
  initialized: false,
  currentUser: null,
  
  // Demo members
  demoMembers: {
    'member@cvawvuaa.org': {
      email: 'member@cvawvuaa.org',
      name: 'Demo Member',
      password: 'member123',
      memberType: 'member'
    },
    'john.doe@email.com': {
      email: 'john.doe@email.com', 
      name: 'John Doe',
      password: 'password123',
      memberType: 'member'
    }
  },
  
  // Initialize
  init: function() {
    this.initialized = true;
    console.log('✅ SimpleMemberPortal initialized');
    return this;
  },
  
  // Show login modal
  showLoginModal: function() {
    console.log('📋 Showing login modal...');
    
    // Remove existing modal
    const existing = document.querySelector('.simple-modal');
    if (existing) existing.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'simple-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">🔐 Member Login</h3>
          <button onclick="this.closest('.simple-modal').remove()" style="
            background: none; border: none; font-size: 24px; cursor: pointer;
            color: #999; width: 30px; height: 30px;
          ">×</button>
        </div>
        
        <form onsubmit="window.SimpleMemberPortal.handleLogin(event)">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;">Email:</label>
            <input type="email" id="simple-email" required style="
              width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;
              box-sizing: border-box;
            " placeholder="member@cvawvuaa.org">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px;">Password:</label>
            <input type="password" id="simple-password" required style="
              width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;
              box-sizing: border-box;
            " placeholder="member123">
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" onclick="this.closest('.simple-modal').remove()" style="
              padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;
            ">Cancel</button>
            <button type="submit" style="
              padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;
            ">Login</button>
          </div>
        </form>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px;">
          <p><strong>Demo Accounts:</strong></p>
          <p>📧 member@cvawvuaa.org / member123</p>
          <p>📧 john.doe@email.com / password123</p>
        </div>
      </div>
    `;
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  },
  
  // Handle login
  handleLogin: function(event) {
    event.preventDefault();
    
    const email = document.getElementById('simple-email').value;
    const password = document.getElementById('simple-password').value;
    
    console.log('🔍 Attempting login:', email);
    
    // Check credentials
    const member = this.demoMembers[email];
    if (member && member.password === password) {
      this.currentUser = member;
      console.log('✅ Login successful:', member.name);
      
      // Close modal
      document.querySelector('.simple-modal').remove();
      
      // Show success message
      this.showNotification('✅ Login successful! Welcome ' + member.name, 'success');
      
      // Update UI
      this.updateLoginStatus();
    } else {
      console.log('❌ Login failed for:', email);
      this.showNotification('❌ Invalid email or password', 'error');
    }
  },
  
  // Show notification
  showNotification: function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1001;
      padding: 15px 20px; border-radius: 5px; color: white; font-weight: bold;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
  
  // Update login status
  updateLoginStatus: function() {
    console.log('🔄 Updating login status...');
    
    const loginSection = document.getElementById('login-section');
    const memberSection = document.getElementById('member-section');
    
    if (this.currentUser) {
      console.log('👤 User logged in, showing member content');
      if (loginSection) loginSection.style.display = 'none';
      if (memberSection) memberSection.style.display = 'block';
    } else {
      console.log('👤 User not logged in, showing login form');
      if (loginSection) loginSection.style.display = 'block';
      if (memberSection) memberSection.style.display = 'none';
    }
  },
  
  // Logout
  logout: function() {
    this.currentUser = null;
    this.showNotification('👋 Logged out successfully', 'info');
    this.updateLoginStatus();
  },
  
  // Show registration modal
  showRegistrationModal: function() {
    this.showNotification('📝 Registration coming soon! Use demo accounts for now.', 'info');
  }
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize immediately
window.SimpleMemberPortal.init();

// Also make available as memberPortal for compatibility
window.memberPortal = window.SimpleMemberPortal;

// Set global variables
try {
  memberPortal = window.SimpleMemberPortal;
} catch (e) {
  console.log('Could not set global memberPortal (strict mode)');
}

console.log('🚀 Simple Member Portal loaded successfully!');
console.log('- SimpleMemberPortal available:', typeof window.SimpleMemberPortal);
console.log('- memberPortal available:', typeof window.memberPortal);
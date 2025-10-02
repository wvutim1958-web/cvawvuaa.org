/**
 * Member Portal System
 * Handles member authentication, exclusive content, and member benefits
 */
class MemberPortal {
  constructor() {
    this.currentUser = null;
    this.members = this.loadMembers();
    this.memberData = this.loadMemberData();
    this.initialized = false;
    
    // Initialize synchronously for immediate availability
    this.init();
  }

  init() {
    try {
      // Add demo members first (no async needed)
      this.addDemoMembers();
      this.saveMembers();
      
      this.setupEventListeners();
      this.checkLoginStatus();
      this.initialized = true;
      console.log('Member Portal initialized successfully');
      
      // Try to load additional data asynchronously (non-blocking)
      this.loadAdditionalData();
    } catch (error) {
      console.error('Member Portal initialization error:', error);
      this.initialized = true; // Still mark as initialized to allow usage
    }
  }

  // Load additional data asynchronously (optional)
  async loadAdditionalData() {
    try {
      const boardResponse = await fetch('content/board-members.json', { cache: 'no-store' });
      if (boardResponse.ok) {
        const boardMembers = await boardResponse.json();
        console.log('Loaded additional board member data');
        // This is just supplementary data, don't overwrite existing demo data
      }
    } catch (error) {
      console.log('Additional data load failed (this is OK):', error);
    }
  }



  // Add demo members for testing
  addDemoMembers() {
    const demoMembers = [
      {
        email: 'member@cvawvuaa.org',
        name: 'Demo Member',
        password: this.hashPassword('member123'),
        memberType: 'member',
        joinDate: '2023-06-15',
        benefits: ['events', 'newsletter', 'directory', 'resources', 'priority'],
        profile: {
          degree: 'BS Business Administration 2018',
          location: 'Richmond, VA'
        }
      },
      {
        email: 'john.doe@email.com',
        name: 'John Doe',
        password: this.hashPassword('password123'),
        memberType: 'member',
        joinDate: '2022-01-10',
        benefits: ['events', 'newsletter', 'directory', 'resources', 'priority'],
        profile: {
          degree: 'MS Engineering 2015',
          location: 'Virginia Beach, VA',
          company: 'Tech Company Inc.'
        }
      }
    ];

    demoMembers.forEach(member => {
      if (!this.members[member.email]) {
        this.members[member.email] = member;
      }
    });
  }

  // Simple hash function for demo (use bcrypt in production)
  hashPassword(password) {
    // Simple hash for demo - use proper encryption in production
    return btoa(password + 'salt_cvcwvuaa').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Load members from localStorage
  loadMembers() {
    const stored = localStorage.getItem('cvcwvuaa-members');
    return stored ? JSON.parse(stored) : {};
  }

  // Save members to localStorage
  saveMembers() {
    localStorage.setItem('cvcwvuaa-members', JSON.stringify(this.members));
  }

  // Load member-specific data
  loadMemberData() {
    const stored = localStorage.getItem('cvcwvuaa-member-data');
    return stored ? JSON.parse(stored) : {};
  }

  // Save member data
  saveMemberData() {
    localStorage.setItem('cvcwvuaa-member-data', JSON.stringify(this.memberData));
  }

  // Check if user is logged in
  checkLoginStatus() {
    const sessionUser = sessionStorage.getItem('cvcwvuaa-session');
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      this.currentUser = userData;
      this.updateUIForLoggedInUser();
    } else {
      this.updateUIForLoggedOutUser();
    }
  }

  // Login function
  login(email, password) {
    const hashedPassword = this.hashPassword(password);
    const member = this.members[email.toLowerCase()];

    if (member && member.password === hashedPassword) {
      this.currentUser = {
        email: member.email,
        name: member.name,
        memberType: member.memberType,
        benefits: member.benefits,
        profile: member.profile
      };

      // Save session
      sessionStorage.setItem('cvcwvuaa-session', JSON.stringify(this.currentUser));
      
      // Update login timestamp
      member.lastLogin = new Date().toISOString();
      this.saveMembers();

      this.updateUIForLoggedInUser();
      this.showNotification(`Welcome back, ${member.name}!`, 'success');
      
      return true;
    } else {
      this.showNotification('Invalid email or password', 'error');
      return false;
    }
  }

  // Logout function
  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('cvcwvuaa-session');
    this.updateUIForLoggedOutUser();
    this.showNotification('You have been logged out', 'info');
  }

  // Register new member
  register(memberData) {
    const email = memberData.email.toLowerCase();
    
    if (this.members[email]) {
      this.showNotification('Email already registered', 'error');
      return false;
    }

    const newMember = {
      email: email,
      name: memberData.name,
      password: this.hashPassword(memberData.password),
      memberType: 'member',
      joinDate: new Date().toISOString(),
      benefits: ['events', 'newsletter', 'directory', 'resources', 'priority'],
      profile: {
        degree: memberData.degree || '',
        location: memberData.location || '',
        phone: memberData.phone || ''
      },
      status: 'active' // All members get immediate access
    };

    this.members[email] = newMember;
    this.saveMembers();

    this.showNotification('Registration successful! Your account is pending approval.', 'success');
    return true;
  }

  // Check if user has specific benefit
  hasBenefit(benefit) {
    if (!this.currentUser) return false;
    return this.currentUser.benefits.includes(benefit);
  }

  // Get list of user's benefits with friendly names
  getBenefits() {
    if (!this.currentUser) return [];
    
    const benefitNames = {
      'events': '🎫 Event Access',
      'newsletter': '📧 Newsletter Archive',
      'directory': '👥 Member Directory',
      'resources': '💎 Member Resources',
      'priority': '⭐ Priority Support'
    };
    
    return this.currentUser.benefits.map(benefit => 
      benefitNames[benefit] || benefit
    );
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get member directory (available to all members)
  getMemberDirectory() {
    return Object.values(this.members)
      .filter(member => member.status !== 'pending' && member.profile)
      .map(member => ({
        name: member.name,
        email: member.email,
        degree: member.profile.degree,
        location: member.profile.location,
        company: member.profile.company,
        memberType: member.memberType
      }));
  }

  // Get member statistics (admin only)
  getMemberStats() {
    if (!this.currentUser || this.currentUser.memberType !== 'board') {
      return null;
    }

    const allMembers = Object.values(this.members);
    return {
      total: allMembers.length,
      active: allMembers.filter(m => m.status !== 'pending').length,
      pending: allMembers.filter(m => m.status === 'pending').length,
      board: allMembers.filter(m => m.memberType === 'board').length,
      premium: allMembers.filter(m => m.memberType === 'premium').length,
      regular: allMembers.filter(m => m.memberType === 'regular').length
    };
  }

  // Update UI for logged in user
  updateUIForLoggedInUser() {
    const loginSection = document.getElementById('login-section');
    const memberSection = document.getElementById('member-section');
    const loginButton = document.querySelector('.login-btn');
    
    if (loginSection) loginSection.style.display = 'none';
    if (memberSection) memberSection.style.display = 'block';
    
    // Update login button in navigation
    if (loginButton) {
      loginButton.textContent = `👤 ${this.currentUser.name}`;
      loginButton.onclick = () => this.showMemberMenu();
    }

    // Update member dashboard
    this.updateMemberDashboard();
    
    // Show/hide content based on benefits
    this.updateContentVisibility();
  }

  // Update UI for logged out user
  updateUIForLoggedOutUser() {
    const loginSection = document.getElementById('login-section');
    const memberSection = document.getElementById('member-section');
    const loginButton = document.querySelector('.login-btn');
    
    if (loginSection) loginSection.style.display = 'block';
    if (memberSection) memberSection.style.display = 'none';
    
    // Update login button in navigation
    if (loginButton) {
      loginButton.textContent = '🔐 Member Login';
      loginButton.onclick = () => this.showLoginModal();
    }

    // Hide member-only content
    this.updateContentVisibility();
  }

  // Update member dashboard content
  updateMemberDashboard() {
    if (!this.currentUser) return;

    const dashboardContent = document.getElementById('member-dashboard-content');
    if (!dashboardContent) return;

    const benefitsList = this.currentUser.benefits.map(benefit => {
      const labels = {
        events: '🎫 Event Access',
        newsletter: '📧 Newsletters',
        directory: '👥 Member Directory',
        exclusive: '💎 Exclusive Content',
        priority: '⭐ Priority Access'
      };
      return `<span class="benefit-badge">${labels[benefit] || benefit}</span>`;
    }).join('');

    dashboardContent.innerHTML = `
      <div class="member-profile">
        <h3>Welcome, ${this.currentUser.name}!</h3>
        <div class="member-info">
          <p><strong>Member Type:</strong> ${this.currentUser.memberType.charAt(0).toUpperCase() + this.currentUser.memberType.slice(1)}</p>
          <p><strong>Email:</strong> ${this.currentUser.email}</p>
          ${this.currentUser.profile.degree ? `<p><strong>Degree:</strong> ${this.currentUser.profile.degree}</p>` : ''}
          ${this.currentUser.profile.location ? `<p><strong>Location:</strong> ${this.currentUser.profile.location}</p>` : ''}
        </div>
        <div class="member-benefits">
          <h4>Your Benefits:</h4>
          <div class="benefits-list">${benefitsList}</div>
        </div>
      </div>
    `;
  }

  // Update content visibility based on member status
  updateContentVisibility() {
    // Show/hide member-only content
    const memberOnlyElements = document.querySelectorAll('.member-only');
    const premiumOnlyElements = document.querySelectorAll('.premium-only');
    const boardOnlyElements = document.querySelectorAll('.board-only');

    memberOnlyElements.forEach(el => {
      el.style.display = this.isLoggedIn() ? 'block' : 'none';
    });

    premiumOnlyElements.forEach(el => {
      el.style.display = this.hasBenefit('exclusive') ? 'block' : 'none';
    });

    boardOnlyElements.forEach(el => {
      el.style.display = (this.currentUser && this.currentUser.memberType === 'board') ? 'block' : 'none';
    });
  }

  // Show login modal
  showLoginModal() {
    const modal = this.createModal('Member Login', `
      <form id="login-form">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email:</label>
          <input type="email" id="login-email" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Password:</label>
          <input type="password" id="login-password" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
            <input type="checkbox" id="remember-me">
            <span>Remember me</span>
          </label>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" onclick="console.log('Cancel clicked'); const modal = this.closest('div[style*=\"fixed\"]'); if(modal) modal.remove();" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Login</button>
        </div>
      </form>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 14px;">
        <p>Demo Accounts:</p>
        <p><strong>Regular Member:</strong> member@cvawvuaa.org / member123</p>
        <p><strong>Premium Member:</strong> premium@cvawvuaa.org / premium123</p>
        <p style="margin-top: 12px;">
          <a href="#" onclick="memberPortal.showRegistrationModal(); const modal = this.closest('div[style*=\"fixed\"]'); if(modal) modal.remove();">Register for new account</a>
        </p>
      </div>
    `);

    document.body.appendChild(modal);

    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (this.login(email, password)) {
        modal.remove();
      }
    });
  }

  // Show registration modal
  showRegistrationModal() {
    const modal = this.createModal('Register for Membership', `
      <form id="registration-form">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Full Name *:</label>
          <input type="text" id="reg-name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email *:</label>
          <input type="email" id="reg-email" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Password *:</label>
          <input type="password" id="reg-password" required minlength="6" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">WVU Degree (optional):</label>
          <input type="text" id="reg-degree" placeholder="e.g., BS Computer Science 2020" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Location (optional):</label>
          <input type="text" id="reg-location" placeholder="e.g., Richmond, VA" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 14px;">
            <input type="checkbox" id="reg-terms" required style="margin-top: 4px;">
            <span>I agree to the membership terms and confirm I am a WVU alumni, student, friend, or family member.</span>
          </label>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" onclick="console.log('Cancel clicked'); const modal = this.closest('div[style*=\"fixed\"]'); if(modal) modal.remove();" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button type="submit" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
        </div>
      </form>
    `);

    document.body.appendChild(modal);

    // Handle registration form submission
    document.getElementById('registration-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const memberData = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        degree: document.getElementById('reg-degree').value,
        location: document.getElementById('reg-location').value
      };
      
      if (this.register(memberData)) {
        modal.remove();
      }
    });
  }

  // Show member menu
  showMemberMenu() {
    const menuItems = [
      '<a href="#" onclick="memberPortal.showMemberDashboard()">👤 My Dashboard</a>',
      '<a href="#" onclick="memberPortal.showMemberDirectory()">👥 Member Directory</a>',
      '<a href="#" onclick="memberPortal.showExclusiveContent()">💎 Member Resources</a>',
      '<hr style="margin: 8px 0;">',
      '<a href="#" onclick="memberPortal.logout()">🚪 Logout</a>'
    ].filter(item => item).join('');

    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position: absolute; top: 100%; right: 0; z-index: 1000;
      background: white; border: 1px solid #ddd; border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;
      padding: 8px 0;
    `;
    dropdown.innerHTML = menuItems;

    // Style the links
    dropdown.querySelectorAll('a').forEach(link => {
      link.style.cssText = `
        display: block; padding: 8px 16px; text-decoration: none;
        color: #333; border: none; background: none; width: 100%;
        text-align: left; cursor: pointer;
      `;
      link.addEventListener('mouseenter', () => link.style.background = '#f8f9fa');
      link.addEventListener('mouseleave', () => link.style.background = 'transparent');
    });

    // Position and show dropdown
    const loginButton = document.querySelector('.login-btn');
    if (loginButton) {
      const buttonRect = loginButton.getBoundingClientRect();
      dropdown.style.position = 'fixed';
      dropdown.style.top = (buttonRect.bottom + 5) + 'px';
      dropdown.style.right = (window.innerWidth - buttonRect.right) + 'px';
    }

    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown() {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      });
    }, 100);
  }

  // Show member dashboard
  showMemberDashboard() {
    // Instead of navigating, show dashboard modal (for file:// compatibility)
    const modal = this.createModal('👤 Member Dashboard', `
      <div style="text-align: center; padding: 20px;">
        <div class="member-profile">
          <h3>Welcome back, ${this.currentUser.profile.name}!</h3>
          <div class="member-info">
            <p><strong>Membership Type:</strong> ${this.currentUser.memberType.charAt(0).toUpperCase() + this.currentUser.memberType.slice(1)} Member</p>
            <p><strong>Email:</strong> ${this.currentUser.email}</p>
            ${this.currentUser.profile.degree ? `<p><strong>Degree:</strong> ${this.currentUser.profile.degree}</p>` : ''}
            ${this.currentUser.profile.location ? `<p><strong>Location:</strong> ${this.currentUser.profile.location}</p>` : ''}
          </div>
          
          <div class="benefits-list">
            <h4>Your Member Benefits:</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 16px 0;">
              ${this.getBenefits().map(benefit => `<span class="benefit-badge">${benefit}</span>`).join('')}
            </div>
          </div>
          
          <div style="margin-top: 20px;">
            <p><strong>Quick Actions:</strong></p>
            <button onclick="memberPortal.showMemberDirectory(); const modal = this.closest('div[style*=\"fixed\"]'); if(modal) modal.remove();" style="margin: 4px; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">👥 View Member Directory</button>
            <button onclick="memberPortal.showExclusiveContent(); const modal = this.closest('div[style*=\"fixed\"]'); if(modal) modal.remove();" style="margin: 4px; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">💎 Member Resources</button>
          </div>
        </div>
      </div>
    `);
    document.body.appendChild(modal);
  }

  // Show member directory
  showMemberDirectory() {
    const members = this.getMemberDirectory();
    
    const membersList = members.map(member => `
      <div style="padding: 12px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 8px;">
        <h5 style="margin: 0 0 4px 0;">${member.name}</h5>
        <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${member.degree || 'WVU Alumni'}</p>
        ${member.location ? `<p style="margin: 0 0 4px 0; font-size: 14px;">📍 ${member.location}</p>` : ''}
        ${member.company ? `<p style="margin: 0 0 4px 0; font-size: 14px;">🏢 ${member.company}</p>` : ''}
        <div style="margin-top: 8px;">
          <span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 3px; font-size: 12px;">
            ${member.memberType.charAt(0).toUpperCase() + member.memberType.slice(1)} Member
          </span>
        </div>
      </div>
    `).join('');

    const modal = this.createModal('Member Directory', `
      <div style="margin-bottom: 16px;">
        <input type="text" id="directory-search" placeholder="Search members..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="max-height: 400px; overflow-y: auto;">
        ${membersList || '<p>No members found.</p>'}
      </div>
    `);

    document.body.appendChild(modal);

    // Add search functionality
    const searchInput = document.getElementById('directory-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const memberElements = modal.querySelectorAll('[style*="padding: 12px"]');
        
        memberElements.forEach(el => {
          const text = el.textContent.toLowerCase();
          el.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
      });
    }
  }

  // Create modal helper
  createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px; box-sizing: border-box;
    `;

    modal.innerHTML = `
      <div style="
        background: white; border-radius: 12px; max-width: 500px; width: 100%;
        max-height: 80vh; overflow-y: auto; padding: 24px; box-sizing: border-box;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0;">${title}</h3>
          <button class="modal-close-btn" style="
            background: none; border: none; font-size: 24px; cursor: pointer;
            color: #999; padding: 0; width: 32px; height: 32px; display: flex;
            align-items: center; justify-content: center; transition: color 0.2s;
          ">×</button>
        </div>
        <div>${content}</div>
      </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Add event listener to close button for extra reliability
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button event listener triggered');
        modal.remove();
      });
      
      // Add hover effects
      closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.color = '#333';
      });
      closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.color = '#999';
      });
    }

    // Add keyboard escape support
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    return modal;
  }

  // Setup event listeners
  setupEventListeners() {
    // Add member login button to navigation if it doesn't exist
    this.addLoginButtonToNavigation();
  }

  // Add login button to navigation
  addLoginButtonToNavigation() {
    const nav = document.getElementById('site-nav');
    if (nav && !nav.querySelector('.login-btn')) {
      const loginBtn = document.createElement('button');
      loginBtn.className = 'login-btn';
      loginBtn.style.cssText = `
        background: none; border: 1px solid #ddd; color: #333;
        padding: 6px 12px; border-radius: 4px; cursor: pointer;
        font-size: 14px; margin-left: 8px;
      `;
      loginBtn.textContent = '🔐 Member Login';
      loginBtn.onclick = () => this.showLoginModal();
      
      nav.appendChild(loginBtn);
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      padding: 12px 20px; border-radius: 8px; color: white;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px; animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .benefit-badge {
    display: inline-block;
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 8px;
    margin-bottom: 4px;
  }
  .member-profile {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  .member-info p {
    margin: 4px 0;
  }
  .benefits-list {
    margin-top: 8px;
  }
`;
document.head.appendChild(style);

// Initialize Member Portal
console.log('=== MEMBER PORTAL INITIALIZATION ===');
console.log('MemberPortal class available:', typeof MemberPortal);

// Define global variables first
let memberPortal;
let globalMemberPortal;

// Initialize function
function initializeMemberPortal() {
  try {
    console.log('Creating MemberPortal instance...');
    memberPortal = new MemberPortal();
    console.log('MemberPortal created successfully:', memberPortal.initialized);
    
    // Make available globally in multiple ways
    window.memberPortal = memberPortal;
    globalMemberPortal = memberPortal;
    
    // Also try to set as global variable (non-strict mode)
    try {
      eval('var memberPortal = window.memberPortal');
    } catch (e) {
      console.log('Could not create global memberPortal variable (strict mode)');
    }
    
    console.log('✅ MemberPortal initialization complete');
    console.log('- memberPortal:', typeof memberPortal);
    console.log('- window.memberPortal:', typeof window.memberPortal);
    console.log('- globalMemberPortal:', typeof globalMemberPortal);
    
    return memberPortal;
  } catch (error) {
    console.error('❌ Error creating MemberPortal:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

// Run initialization immediately
const portalInstance = initializeMemberPortal();

// Also export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MemberPortal, memberPortal: portalInstance };
}
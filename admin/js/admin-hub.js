/**
 * CVCWVUAA Admin Hub - Optimized JavaScript
 * Performance-optimized admin authentication and UI management
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // SHA-256 hash of admin password (T58C62)
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        storageKey: 'adminAuth',
        animationDuration: 500
    };
    
    // DOM Elements (cached for performance)
    const elements = {
        loginScreen: null,
        adminContent: null,
        passwordInput: null,
        errorMessage: null,
        loginButton: null
    };
    
    /**
     * Initialize DOM element references
     */
    function cacheDOMElements() {
        elements.loginScreen = document.getElementById('loginScreen');
        elements.adminContent = document.getElementById('adminContent');
        elements.passwordInput = document.getElementById('passwordInput');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.loginButton = document.querySelector('.login-box button');
    }
    
    /**
     * Hash password using SHA-256
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password in hex format
     */
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Verify password against stored hash
     * @param {string} password - Plain text password to verify
     * @returns {Promise<boolean>} - True if password matches
     */
    async function verifyPassword(password) {
        try {
            const hash = await hashPassword(password);
            return hash === CONFIG.passwordHash;
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }
    
    /**
     * Check if user is already authenticated
     * @returns {boolean}
     */
    function isAuthenticated() {
        return sessionStorage.getItem(CONFIG.storageKey) === 'true';
    }
    
    /**
     * Set authentication status
     * @param {boolean} status
     */
    function setAuthentication(status) {
        sessionStorage.setItem(CONFIG.storageKey, status.toString());
    }
    
    /**
     * Show admin content with fade-in animation
     */
    function showAdminContent() {
        if (!elements.loginScreen || !elements.adminContent) return;
        
        // Hide login screen
        elements.loginScreen.style.display = 'none';
        
        // Show admin content with fade-in
        elements.adminContent.style.display = 'block';
        elements.adminContent.classList.add('fade-in');
        
        // Focus management for accessibility
        const firstLink = elements.adminContent.querySelector('a');
        if (firstLink) {
            firstLink.focus();
        }
    }
    
    /**
     * Show error message with shake animation
     * @param {string} message - Error message to display
     */
    function showError(message) {
        if (!elements.errorMessage || !elements.passwordInput) return;
        
        // Show error message
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
        
        // Clear password input
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
        
        // Shake animation
        elements.passwordInput.style.animation = `shake ${CONFIG.animationDuration}ms`;
        setTimeout(() => {
            elements.passwordInput.style.animation = '';
        }, CONFIG.animationDuration);
    }
    
    /**
     * Handle password check
     */
    async function checkPassword() {
        if (!elements.passwordInput || !elements.loginButton) return;
        
        const password = elements.passwordInput.value.trim();
        
        // Validate input
        if (!password) {
            showError('⚠️ Please enter a password');
            return;
        }
        
        // Show loading state
        const originalButtonText = elements.loginButton.innerHTML;
        elements.loginButton.innerHTML = '<span class="loading-spinner"></span> Verifying...';
        elements.loginButton.disabled = true;
        
        try {
            // Verify password
            const isValid = await verifyPassword(password);
            
            if (isValid) {
                // Correct password
                setAuthentication(true);
                showAdminContent();
            } else {
                // Wrong password
                showError('❌ Incorrect password. Please try again.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            showError('❌ Authentication failed. Please try again.');
        } finally {
            // Restore button state
            elements.loginButton.innerHTML = originalButtonText;
            elements.loginButton.disabled = false;
        }
    }
    
    /**
     * Handle Enter key press in password input
     * @param {KeyboardEvent} event
     */
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkPassword();
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        if (elements.passwordInput) {
            elements.passwordInput.addEventListener('keypress', handleKeyPress);
        }
        
        if (elements.loginButton) {
            elements.loginButton.addEventListener('click', checkPassword);
        }
    }
    
    /**
     * Initialize the admin hub
     */
    function init() {
        // Cache DOM elements
        cacheDOMElements();
        
        // Check if already authenticated
        if (isAuthenticated()) {
            showAdminContent();
        } else {
            // Setup event listeners for login
            setupEventListeners();
            
            // Focus password input for better UX
            if (elements.passwordInput) {
                elements.passwordInput.focus();
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose checkPassword for inline onclick (backwards compatibility)
    window.checkPassword = checkPassword;
    
})();

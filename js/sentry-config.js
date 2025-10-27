// Sentry Error Tracking Configuration
// Sign up at https://sentry.io to get your DSN

// Only initialize Sentry if DSN is configured
if (window.SENTRY_DSN) {
  Sentry.init({
    dsn: window.SENTRY_DSN,
    environment: window.location.hostname === 'cvawvuaa.org' ? 'production' : 'development',
    
    // Track performance
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Track user sessions
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out common noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // Random plugins/extensions
      'fb_xd_fragment',
    ],
    
    // Add custom context
    beforeSend(event, hint) {
      // Add Firebase user info if available
      if (window.auth && window.auth.currentUser) {
        event.user = {
          id: window.auth.currentUser.uid,
          email: window.auth.currentUser.email,
        };
      }
      
      // Add page context
      event.contexts = event.contexts || {};
      event.contexts.page = {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
      };
      
      return event;
    },
  });
  
  console.log('✅ Sentry error tracking initialized');
} else {
  console.log('ℹ️ Sentry DSN not configured - error tracking disabled');
  console.log('Sign up at https://sentry.io and add SENTRY_DSN to enable error tracking');
}

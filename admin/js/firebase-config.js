// Firebase Configuration for CVCWVUAA
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Instructions to get your Firebase credentials:
// 1. Go to https://console.firebase.google.com/
// 2. Click "Add project" or select existing project
// 3. Project name: "CVCWVUAA"
// 4. Enable Google Analytics (optional)
// 5. Go to Project Settings (gear icon) > General
// 6. Scroll to "Your apps" section
// 7. Click the web icon (</>)
// 8. Register app with nickname "CVCWVUAA Website"
// 9. Copy the config values and replace above
// 10. Enable Firestore Database in Build > Firestore Database

// Initialize Firebase
let app, db, auth;

function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Please check your internet connection.');
        return false;
    }
    
    try {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}

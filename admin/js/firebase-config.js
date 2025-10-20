// Firebase Configuration for CVCWVUAA
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "AIzaSyDIMIbLTc2OgTTu6qFYdGgzO8CYU-rGmec",
    authDomain: "cvcwvuaa-904e2.firebaseapp.com",
    projectId: "cvcwvuaa-904e2",
    storageBucket: "cvcwvuaa-904e2.firebasestorage.app",
    messagingSenderId: "182842873773",
    appId: "1:182842873773:web:cbee30eeff8fee4c2ff324",
    measurementId: "G-5ZYMGSZBJ3"
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

// Auto-initialize Firebase when this script loads
initializeFirebase();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}

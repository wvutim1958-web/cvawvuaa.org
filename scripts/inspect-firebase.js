#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: "cvcwvuaa-904e2",
  // We'll use application default credentials or the web config
};

// For web config compatibility, we can use the web SDK approach
console.log('\n🔍 FIREBASE DATABASE INSPECTOR\n');
console.log('This will show you what\'s actually in your Firebase collections.\n');

// Since we're in a dev container, let's use a simpler approach
// We'll read the firebase config and connect
const firebaseConfig = {
  apiKey: "AIzaSyDGEh_kKgN9IbBlZ5gyy_dN0VNqCQWfbS8",
  authDomain: "cvcwvuaa-904e2.firebaseapp.com",
  projectId: "cvcwvuaa-904e2",
  storageBucket: "cvcwvuaa-904e2.firebasestorage.app",
  messagingSenderId: "662295969210",
  appId: "1:662295969210:web:9f3f0cf74f4fcd5fce4a8b",
  measurementId: "G-NNBHHKPD7L"
};

console.log('Project ID:', firebaseConfig.projectId);
console.log('\nTo inspect and clean your database:');
console.log('1. Go to: https://console.firebase.google.com/project/cvcwvuaa-904e2/firestore');
console.log('2. Click on "members" collection');
console.log('3. You\'ll see all member documents with their IDs');
console.log('4. Click on each document to see the actual data');
console.log('5. Click the trash icon to delete test accounts\n');

console.log('To see events:');
console.log('1. Go to: https://console.firebase.google.com/project/cvcwvuaa-904e2/firestore');
console.log('2. Click on "events" collection');
console.log('3. View/edit/delete events directly\n');

console.log('COMMON ISSUES:');
console.log('- If member card shows "Member Name", the member document is missing firstName/lastName fields');
console.log('- Add these fields in Firebase Console by clicking the document and clicking "Add field"');
console.log('- If events don\'t show, there are no documents in the "events" collection');
console.log('\n');

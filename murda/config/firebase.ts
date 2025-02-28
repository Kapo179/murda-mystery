import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  // Your firebase config goes here
  // This should be filled with actual values from Firebase console
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app, auth }; 
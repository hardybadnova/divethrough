
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsrrK1Xxv9fqKUwDeoFBk1tl4PuUI6FOI",
  authDomain: "diveone-19314.firebaseapp.com",
  projectId: "diveone-19314",
  storageBucket: "diveone-19314.firebasestorage.app",
  messagingSenderId: "12946835574",
  appId: "1:12946835574:web:35e6784f34273542bc3757",
  databaseURL: "https://diveone-19314-default-rtdb.firebaseio.com", // Added for Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const firestore = getFirestore(app);

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

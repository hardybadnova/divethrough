
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsrrK1Xxv9fqKUwDeoFBk1tl4PuUI6FOI",
  authDomain: "diveone-19314.firebaseapp.com",
  projectId: "diveone-19314",
  storageBucket: "diveone-19314.firebasestorage.app",
  messagingSenderId: "12946835574",
  appId: "1:12946835574:web:35e6784f34273542bc3757"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBsrrK1Xxv9fqKUwDeoFBk1tl4PuUI6FOI",
  authDomain: "diveone-19314.firebaseapp.com",
  projectId: "diveone-19314",
  storageBucket: "diveone-19314.firebasestorage.app",
  messagingSenderId: "12946835574",
  appId: "1:12946835574:web:35e6784f34273542bc3757"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
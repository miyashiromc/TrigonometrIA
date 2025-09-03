
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0H6MPZCEDBOb3XUvuYekQrJJAkkzd0tg",
  authDomain: "aitrigonometria.firebaseapp.com",
  projectId: "aitrigonometria",
  storageBucket: "aitrigonometria.firebasestorage.app",
  messagingSenderId: "822652198420",
  appId: "1:822652198420:web:107298a65df3cb64c85101",
  measurementId: "G-JT98M3J8TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider, analytics };

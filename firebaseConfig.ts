// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9cUSEywI8dARDgcmzQPlPXbM1LB80oEw",
  authDomain: "trigonometriatutor.firebaseapp.com",
  projectId: "trigonometriatutor",
  storageBucket: "trigonometriatutor.firebasestorage.app",
  messagingSenderId: "66160278182",
  appId: "1:66160278182:web:375740f3a0ced434785267",
  measurementId: "G-8KPG2YDQ22"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
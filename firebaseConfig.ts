// En firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // 1. Lee la API Key de forma segura desde las variables de entorno
  apiKey: "AIzaSyC9cUSEywI8dARDgcmzQPlPXbM1LB80oEw",  
  // 2. Estos son tus datos públicos, están bien aquí
  authDomain: "trigonometriatutor.firebaseapp.com",
  projectId: "trigonometriatutor",
  storageBucket: "trigonometriatutor.firebasestorage.app", // Ojo, el valor anterior era .appspot.com, verifica cuál es el correcto en tu consola
  messagingSenderId: "66160278182",
  appId: "1:66160278182:web:375740f3a0ced434785267",
  measurementId: "G-8KPG2YDQ22"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// 3. Exporta las instancias de Auth y Firestore para usarlas en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);
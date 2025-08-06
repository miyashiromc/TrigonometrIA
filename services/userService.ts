// En services/userService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig'; // Importamos la configuración central
import type { User, UserData } from '../types'; // Cita: miyashiromc/trigonometria/TrigonometrIA-e028480dc2a01df85beb94ea07e37d3d5e51814e/types.ts
import { getDefaultAnalyticsData } from './analyticsService'; // Cita: miyashiromc/trigonometria/TrigonometrIA-e028480dc2a01df85beb94ea07e37d3d5e51814e/services/analyticsService.ts

// --- Función Auxiliar para Crear/Obtener Perfiles en Firestore ---
const manageUserProfile = async (firebaseUser: FirebaseUser, email?: string): Promise<User> => {
  const userDocRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    // Si el usuario ya tiene un perfil, lo devolvemos
    return userDoc.data().profile as User;
  } else {
    // Si es la primera vez que inicia sesión, creamos su perfil
    const newUserProfile: User = {
      // El 'id' ahora estará en el documento de Firestore, no en el perfil
      username: firebaseUser.displayName || email?.split('@')[0] || 'Nuevo Usuario',
      email: firebaseUser.email,
      avatar: 'avatar1' // Avatar por defecto
    };
    
    const newUserData: UserData = {
      profile: newUserProfile,
      analytics: getDefaultAnalyticsData() // Cita: miyashiromc/trigonometria/TrigonometrIA-e028480dc2a01df85beb94ea07e37d3d5e51814e/services/analyticsService.ts
    }
    
    await setDoc(userDocRef, newUserData);
    return newUserProfile;
  }
};

// Obtiene todos los datos de un usuario
export const getUserData = async (uid: string): Promise<UserData | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() as UserData : null;
}

// Guarda los datos de un usuario
export const saveUserData = async (uid: string, data: UserData) => {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, data, { merge: true }); // Usamos merge para no sobrescribir todo
};

// --- Funciones de Autenticación Reales ---
export const registerUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await manageUserProfile(userCredential.user, email);
    return { success: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.' };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') return { success: false, message: 'Este correo ya está en uso.' };
    return { success: false, message: 'Error: La contraseña debe tener al menos 6 caracteres.' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await manageUserProfile(userCredential.user, email);
    return { success: true, user: userProfile };
  } catch (error: any) {
    return { success: false, message: 'Correo o contraseña incorrectos.' };
  }
};

export const loginWithGoogle = async (): Promise<{ success: boolean; user?: User; message?: string }> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const userProfile = await manageUserProfile(result.user);
    return { success: true, user: userProfile };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') return { success: false, message: 'El proceso fue cancelado.' };
    return { success: false, message: 'Ocurrió un error con el inicio de sesión de Google.' };
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export function getCurrentUser() {
  throw new Error('Function not implemented.');
}

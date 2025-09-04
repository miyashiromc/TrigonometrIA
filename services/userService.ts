"""// En services/userService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';
import type { User, UserData } from '../types';
import { getDefaultAnalyticsData } from './analyticsService';

// Guarda una solicitud del usuario en la base de datos.
export const saveUserRequest = async (uid: string, requestText: string) => {
  try {
    const requestsCollectionRef = collection(db, "users", uid, "requests");
    await addDoc(requestsCollectionRef, {
      request_text: requestText,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving user request: ", error);
    // Opcional: manejar el error, por ejemplo, reintentar o notificar.
  }
};
""

// --- Función Auxiliar para Crear/Obtener Perfiles en Firestore ---
const manageUserProfile = async (firebaseUser: FirebaseUser, email?: string): Promise<User> => {
  const userDocRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userProfile = userDoc.data().profile as User;
    userProfile.id = firebaseUser.uid; // Siempre añadimos el ID al objeto que usará la App.
    return userProfile;
  } else {
    // Este es el objeto COMPLETO que usará la App. SÍ incluye el ID.
    const newUserProfile: User = {
      id: firebaseUser.uid,
      username: firebaseUser.displayName || email?.split('@')[0] || 'Nuevo Usuario',
      email: firebaseUser.email,
      avatar: 'avatar1'
    };

    // Este es el objeto que guardaremos en Firestore. NO incluye el ID en el sub-objeto 'profile'
    // para no duplicar datos (ya que el ID del documento es el ID del usuario).
    // ---> ¡AQUÍ ESTÁ EL ÚNICO CAMBIO NECESARIO! <---
    // Quitamos la declaración de tipo ": UserData" para que TypeScript no nos exija un 'id' aquí.
    const userDataForFirestore = {
      profile: {
          username: newUserProfile.username,
          email: newUserProfile.email,
          avatar: newUserProfile.avatar
      },
      analytics: getDefaultAnalyticsData()
    };
    
    await setDoc(userDocRef, userDataForFirestore);
    
    // Devolvemos el perfil completo para que la App lo use inmediatamente.
    return newUserProfile;
  }
};

// Obtiene todos los datos de un usuario desde Firestore.
export const getUserData = async (uid: string): Promise<UserData | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        // La corrección más importante: Nos aseguramos de que el perfil que le
        // llega a la aplicación SIEMPRE tenga el ID.
        data.profile.id = uid;
        return data;
    }
    
    return null;
}

// Guarda los datos de un usuario.
export const saveUserData = async (uid: string, data: UserData) => {
    // Hacemos una copia profunda para no mutar el estado original de React.
    const dataToSave = JSON.parse(JSON.stringify(data));
    
    // Antes de guardar, eliminamos el 'id' del sub-objeto 'profile' para
    // mantener nuestra base de datos limpia y sin datos duplicados.
    if (dataToSave.profile) {
      delete dataToSave.profile.id;
    }
    
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, dataToSave, { merge: true });
};

// --- Funciones de Autenticación (sin cambios) ---
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
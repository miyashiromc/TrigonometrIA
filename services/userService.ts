
import type { User, UserData } from '../types';
import { getDefaultAnalyticsData } from './analyticsService';

const DB_KEY = 'trigTutorUsersDB';
const SESSION_KEY = 'trigTutorCurrentUser';

// --- Database Simulation ---

// Internal type that includes the password. This should not be exposed to the UI.
interface StoredUserData extends UserData {
    password?: string;
}

const getUsersDB = (): Record<string, StoredUserData> => {
  try {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch (e) {
    console.error("Failed to read user DB from localStorage", e);
    return {};
  }
};

const saveUsersDB = (db: Record<string, StoredUserData>) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save user DB to localStorage", e);
  }
};

// --- Public API ---

export const registerUser = (username: string, password_plaintext: string): { success: boolean, message: string } => {
  const db = getUsersDB();
  if (db[username]) {
    return { success: false, message: 'El nombre de usuario ya existe.' };
  }

  // NOTE: In a real app, NEVER store plaintext passwords.
  // This should be a securely hashed password.
  const password_stored = password_plaintext; 

  db[username] = {
    profile: {
      username: username,
      avatar: 'avatar1'
    },
    analytics: getDefaultAnalyticsData(),
    password: password_stored
  }; 

  saveUsersDB(db);
  return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
};


export const loginUser = (username: string, password_plaintext: string): { success: boolean, message: string, user?: User } => {
  const db = getUsersDB();
  const userData = db[username];

  if (!userData) {
    return { success: false, message: 'El usuario no existe.' };
  }

  // NOTE: In a real app, use a secure password comparison function.
  if (userData.password !== password_plaintext) {
    return { success: false, message: 'Contraseña incorrecta.' };
  }

  setCurrentUser(username);
  return { success: true, message: 'Inicio de sesión exitoso.', user: userData.profile };
};

export const logoutUser = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("Could not log out user.", e);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const username = sessionStorage.getItem(SESSION_KEY);
    if (!username) return null;
    
    const db = getUsersDB();
    return db[username]?.profile || null;
  } catch (e) {
    console.error("Could not get current user.", e);
    return null;
  }
};

const setCurrentUser = (username: string) => {
    try {
        sessionStorage.setItem(SESSION_KEY, username);
    } catch (e) {
        console.error("Could not set current user.", e);
    }
};

export const getUserData = (username: string): UserData | null => {
    const db = getUsersDB();
    const storedData = db[username];
    if (!storedData) {
        return null;
    }
    const { password, ...userData } = storedData;
    return userData;
};

export const saveUserData = (username: string, data: UserData) => {
    const db = getUsersDB();
    if (db[username]) {
        const password = db[username].password;
        db[username] = { ...data, password };
        saveUsersDB(db);
    }
};

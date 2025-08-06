import React, { useState } from 'react';
import * as userService from '../services/userService';
import type { User } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!username.trim() || !password.trim()) {
      setError("El nombre de usuario y la contraseña no pueden estar vacíos.");
      return;
    }

    if (isLoginView) {
      const result = userService.loginUser(username, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message);
      }
    } else {
      const result = userService.registerUser(username, password);
      if (result.success) {
        setSuccessMessage(result.message);
        setIsLoginView(true); // Switch to login view after successful registration
        setUsername('');
        setPassword('');
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 dark:from-dark-base-100 dark:via-dark-base-200 dark:to-dark-base-100 p-4">
      <div className="w-full max-w-sm mx-auto p-8 bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-base-content dark:text-dark-base-content">
          <span className="text-brand-primary">TrigTutor IA</span>
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isLoginView ? 'Inicia sesión para continuar' : 'Crea una cuenta para empezar'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-base-100 dark:bg-dark-base-200 text-base-content dark:text-dark-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder="Nombre de usuario"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-base-100 dark:bg-dark-base-200 text-base-content dark:text-dark-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none"
            placeholder="Contraseña"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}

          <button
            type="submit"
            className="w-full p-3 bg-brand-primary text-white font-bold text-lg rounded-lg hover:bg-brand-secondary transition-colors duration-200 disabled:bg-gray-400"
          >
            {isLoginView ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-base-100 dark:bg-dark-base-200 text-gray-500 dark:text-gray-400">O</span>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="w-full p-3 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 text-base-content dark:text-dark-base-content font-semibold rounded-lg hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
        </button>

        <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setSuccessMessage(null); }} className="font-semibold text-brand-primary hover:underline ml-1">
            {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Avatar1Icon } from './icons/Avatar1Icon';
import { Avatar2Icon } from './icons/Avatar2Icon';
import { Avatar3Icon } from './icons/Avatar3Icon';
import { Avatar4Icon } from './icons/Avatar4Icon';

interface ProfileViewProps {
  user: User;
  onAvatarChange: (avatarId: string) => void;
  onProfileSave: (updatedUser: Partial<User>) => void; // Nueva prop para guardar
  // Podríamos añadir onPasswordChange aquí en el futuro
}

const avatars: { id: string; icon: React.ReactNode }[] = [
  { id: 'avatar1', icon: <Avatar1Icon /> },
  { id: 'avatar2', icon: <Avatar2Icon /> },
  { id: 'avatar3', icon: <Avatar3Icon /> },
  { id: 'avatar4', icon: <Avatar4Icon /> },
];

export default function ProfileView({ user, onAvatarChange, onProfileSave }: ProfileViewProps): React.ReactNode {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    username: user.username,
    age: user.age,
    institution: user.institution,
    educationLevel: user.educationLevel,
  });

  // Sincroniza el formulario si el usuario cambia desde fuera
  useEffect(() => {
    setFormData({
      username: user.username,
      age: user.age,
      institution: user.institution,
      educationLevel: user.educationLevel,
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onProfileSave(formData);
    setIsEditing(false);
  };
  
  const currentAvatar = avatars.find(a => a.id === user.avatar) || avatars[0];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="bg-base-100 dark:bg-dark-base-200 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Tu Perfil</h1>
        
        <div className="relative mb-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-brand-primary/10 p-2">
            <div className="w-full h-full rounded-full bg-base-200 dark:bg-dark-base-300 flex items-center justify-center overflow-hidden">
                {currentAvatar.icon}
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DE INFORMACIÓN PERSONAL (FORMULARIO) --- */}
        <div className="w-full mt-6">
          {!isEditing ? (
            // --- VISTA DE SOLO LECTURA ---
            <div className="text-center w-full">
              <h2 className="text-2xl font-semibold text-brand-primary">{user.username}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {user.educationLevel || 'Nivel educativo no especificado'}
              </p>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Editar Perfil
              </button>
            </div>
          ) : (
            // --- VISTA DE EDICIÓN ---
            <div className="w-full space-y-4 animate-fadeIn">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de Usuario</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Edad</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div>
                    <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nivel Educativo</label>
                    <select
                        name="educationLevel"
                        id="educationLevel"
                        value={formData.educationLevel || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-dark-base-300"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Bachillerato">Bachillerato</option>
                        <option value="Universidad">Universidad</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
              </div>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institución Educativa</label>
                <input
                  type="text"
                  name="institution"
                  id="institution"
                  value={formData.institution || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                <button onClick={handleSave} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg">Guardar Cambios</button>
              </div>
            </div>
          )}
        </div>

        {/* --- SECCIÓN DE AVATAR Y CONTRASEÑA --- */}
        <div className="w-full mt-8 pt-6 border-t border-base-200 dark:border-dark-base-300">
            <h3 className="text-xl font-semibold mb-4 text-center">Elige tu Avatar</h3>
            <div className="grid grid-cols-4 gap-4">
                {avatars.map(avatar => (
                    <button
                        key={avatar.id}
                        onClick={() => onAvatarChange(avatar.id)}
                        className={`p-2 rounded-full transition-all duration-200 ${user.avatar === avatar.id ? 'ring-4 ring-brand-primary' : 'hover:ring-2 hover:ring-brand-secondary'}`}
                        aria-label={`Seleccionar ${avatar.id}`}
                    >
                        <div className="bg-base-200 dark:bg-dark-base-300 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center overflow-hidden">
                            {avatar.icon}
                        </div>
                    </button>
                ))}
            </div>
        </div>
        
         
      </div>
    </div>
  );
}
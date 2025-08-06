import React from 'react';
import type { User } from '../types';
import { Avatar1Icon } from './icons/Avatar1Icon';
import { Avatar2Icon } from './icons/Avatar2Icon';
import { Avatar3Icon } from './icons/Avatar3Icon';
import { Avatar4Icon } from './icons/Avatar4Icon';

interface ProfileViewProps {
  user: User;
  onAvatarChange: (avatarId: string) => void;
}

const avatars: { id: string; icon: React.ReactNode }[] = [
  { id: 'avatar1', icon: <Avatar1Icon /> },
  { id: 'avatar2', icon: <Avatar2Icon /> },
  { id: 'avatar3', icon: <Avatar3Icon /> },
  { id: 'avatar4', icon: <Avatar4Icon /> },
];

export default function ProfileView({ user, onAvatarChange }: ProfileViewProps): React.ReactNode {
  const currentAvatar = avatars.find(a => a.id === user.avatar) || avatars[0];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="bg-base-100 dark:bg-dark-base-200 p-8 rounded-2xl shadow-xl flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Tu Perfil</h1>
        
        <div className="relative mb-6">
          <div className="w-40 h-40 rounded-full bg-brand-primary/10 p-2">
            <div className="w-full h-full rounded-full bg-base-200 dark:bg-dark-base-300 flex items-center justify-center overflow-hidden">
                {currentAvatar.icon}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-brand-primary">{user.username}</h2>
        <p className="text-gray-500 dark:text-gray-400">Usuario de TrigTutor IA</p>

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
                        <div className="bg-base-200 dark:bg-dark-base-300 rounded-full w-20 h-20 flex items-center justify-center overflow-hidden">
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
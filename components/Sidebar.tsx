import React from 'react';
import type { View } from '../types';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowLeftOnRectangleIcon } from './icons/ArrowLeftOnRectangleIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-brand-primary text-white' : 'hover:bg-base-300 dark:hover:bg-dark-base-300'}`}
    aria-current={isActive ? 'page' : undefined}
    >
    {icon}
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

export default function Sidebar({ currentView, setView, onLogout }: SidebarProps): React.ReactNode {
  return (
    <aside className="w-24 bg-base-100 dark:bg-dark-base-200 p-2 flex flex-col items-center shadow-lg">
      <div className="text-brand-primary font-bold text-lg my-4">T.IA</div>
      <nav className="w-full flex-1">
        <NavItem 
          icon={<ChatBubbleLeftRightIcon />}
          label="Chat"
          isActive={currentView === 'chat'}
          onClick={() => setView('chat')}
        />
        <NavItem 
          icon={<DocumentTextIcon />}
          label="Contenido"
          isActive={currentView === 'content'}
          onClick={() => setView('content')}
        />
        <NavItem 
          icon={<ClipboardCheckIcon />}
          label="Ejercicios"
          isActive={currentView === 'exercises'}
          onClick={() => setView('exercises')}
        />
         <NavItem 
          icon={<BookOpenIcon />}
          label="Recursos"
          isActive={currentView === 'resources'}
          onClick={() => setView('resources')}
        />
        <NavItem 
          icon={<ChartBarIcon />}
          label="Estadísticas"
          isActive={currentView === 'analytics'}
          onClick={() => setView('analytics')}
        />
        <NavItem 
          icon={<UserCircleIcon />}
          label="Perfil"
          isActive={currentView === 'profile'}
          onClick={() => setView('profile')}
        />
      </nav>
      <div className="w-full mt-auto">
         <button 
            onClick={onLogout}
            className="w-full flex flex-col items-center justify-center p-3 my-2 rounded-lg transition-colors duration-200 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
            title="Cerrar Sesión"
          >
          <ArrowLeftOnRectangleIcon />
          <span className="text-xs mt-1 font-medium">Salir</span>
        </button>
      </div>
    </aside>
  );
}
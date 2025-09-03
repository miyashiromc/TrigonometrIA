import React from 'react';
import type { AnalyticsData } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface AnalyticsViewProps {
  data: AnalyticsData;
  onReset: () => void;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${Math.floor(remainingSeconds)}s`;
};

const StatCard = ({ icon, title, value, footer }: { icon: React.ReactNode; title: string; value: string | number; footer?: string }) => (
  <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
    <div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">{icon}</div>
        <h3 className="font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
      </div>
      <p className="text-4xl font-bold mt-4">{value}</p>
    </div>
    {footer && <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{footer}</p>}
  </div>
);

const PerformanceCard = ({ title, correct, incorrect }: { title: string; correct: number; incorrect: number }) => {
  const total = correct + incorrect;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(0) : '0';

  return (
    <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="flex items-center justify-around text-center">
        <div>
          <p className="text-3xl font-bold text-green-500">{correct}</p>
          <p className="text-sm text-gray-500">Aciertos</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-500">{incorrect}</p>
          <p className="text-sm text-gray-500">Errores</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-brand-primary">{percentage}%</p>
          <p className="text-sm text-gray-500">Precisión</p>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsView({ data, onReset }: AnalyticsViewProps): React.ReactNode {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Tus Estadísticas</h1>
        
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Aquí puedes ver un resumen de tu progreso y actividad en la aplicación.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<ChatBubbleLeftRightIcon />} title="Tiempo en Chat" value={formatTime(data.timeSpentInViews.chat)} />
        <StatCard icon={<DocumentTextIcon />} title="Tiempo en Contenido" value={formatTime(data.timeSpentInViews.content)} />
        <StatCard icon={<ClipboardCheckIcon />} title="Tiempo en Ejercicios" value={formatTime(data.timeSpentInViews.exercises)} />
        <StatCard icon={<BookOpenIcon />} title="Tiempo en Recursos" value={formatTime(data.timeSpentInViews.resources)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <StatCard
            icon={<VolumeUpIcon />}
            title="Reproducciones de Audio"
            value={data.audioPlays.content + data.audioPlays.exercises}
            footer={`Contenido: ${data.audioPlays.content} | Ejercicios: ${data.audioPlays.exercises}`}
          />
        </div>

        <div className="space-y-6">
          <PerformanceCard title="Rendimiento en Ejercicios" correct={data.exerciseStats.correct} incorrect={data.exerciseStats.incorrect} />
          <PerformanceCard title="Rendimiento en Quizzes" correct={data.quizStats.correct} incorrect={data.quizStats.incorrect} />
        </div>
      </div>
    </div>
  );
}

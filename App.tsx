
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ContentView from './components/ContentView';
import ExercisesView from './components/ExercisesView';
import ResourcesView from './components/ResourcesView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import * as geminiService from './services/geminiService';
import * as analyticsService from './services/analyticsService';
import * as userService from './services/userService';
import type { View, ChatMessage, GeneratedContent, ExerciseContent, UserData, User } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';




export default function App(): React.ReactNode {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  

  const [activeView, setActiveView] = useState<View>('exercises');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [generatedExercise, setGeneratedExercise] = useState<ExerciseContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContentTopic, setCurrentContentTopic] = useState<string | null>(null);
  const [currentExerciseTopic, setCurrentExerciseTopic] = useState("Seno, Coseno y Tangente");
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, string[]>>({});
  
  const timeTrackerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario ha iniciado sesión
        const data = await userService.getUserData(firebaseUser.uid);
        if (data) {
          setCurrentUser(data.profile);
          setUserData(data);
        }
      } else {
        // Usuario ha cerrado sesión
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthLoading(false); // Terminamos de verificar, quitamos la pantalla de carga
    });
    
    // Esto limpia el "oyente" cuando el componente se cierra para evitar problemas
    return () => unsubscribe(); 
  }, []);
  

  // En App.tsx, dentro de la función updateUserData

const updateUserData = (newUserData: UserData) => {
  // ----> AÑADE ESTA LÍNEA PARA DEPURAR <----
  console.log('Inspeccionando el objeto currentUser:', currentUser);

  if (currentUser) {
    setUserData(newUserData);
    // Esta es la línea que probablemente causa el problema
    userService.saveUserData(currentUser.id, newUserData);
  }
};

  useEffect(() => {
    if (!userData) return;

    if (timeTrackerRef.current) {
      clearInterval(timeTrackerRef.current);
    }
    timeTrackerRef.current = setInterval(() => {
        updateUserData({ ...userData, analytics: analyticsService.updateTimeSpent(userData.analytics, activeView, 1) });
    }, 1000);

    return () => {
      if (timeTrackerRef.current) {
        clearInterval(timeTrackerRef.current);
      }
    };
  }, [activeView, userData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  // En App.tsx, dentro del componente App y junto a las otras funciones 'handle'

const handleProfileUpdate = (updatedProfileData: Partial<User>) => {
  if (userData && currentUser) {
    // 1. Creamos una copia actualizada del perfil
    const newProfile: User = {
      ...currentUser,
      ...updatedProfileData,
    };
    
    // 2. Creamos una copia actualizada de todos los datos del usuario
    const newUserData: UserData = {
      ...userData,
      profile: newProfile,
    };

    // 3. Actualizamos el estado local para que la UI reaccione inmediatamente
    setCurrentUser(newProfile);
    setUserData(newUserData);

    // 4. Llamamos a la función que guarda en la base de datos (esta ya la tienes)
    //    La función saveUserData se encargará de quitar el 'id' antes de guardar.
    userService.saveUserData(currentUser.id, newUserData);
  }
};

  const handleLogout = () => {
    userService.logoutUser();
    setCurrentUser(null);
  };
  
  const handleUpdateAvatar = (avatar: string) => {
    if(userData) {
      const newUserData: UserData = {
        ...userData,
        profile: {
          ...userData.profile,
          avatar: avatar
        }
      };
      updateUserData(newUserData);
      setCurrentUser(newUserData.profile);
    }
  };
  

  const handleTopicSubmit = useCallback(async (topic: string) => {
    console.log('Submitting topic with user:', currentUser);
    if (currentUser) {
      await userService.saveUserRequest(currentUser.id, topic);
    }
    setIsLoading(true);
    setError(null);
    setHistory(prev => [...prev, { role: 'model', text: '', isLoading: true }]);

    try {
        const validationResult = await geminiService.validarTema(topic);

        if (validationResult.is_relevant) {
            setCurrentContentTopic(topic);
            const content = await geminiService.generarContenidoEducativo(topic);
            setGeneratedContent(content);
            setHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage?.isLoading) {
                    lastMessage.text = `¡Claro! He generado una explicación sobre **${topic}**. Puedes ver los detalles en la pestaña 'Contenido'.`;
                    lastMessage.isLoading = false;
                }
                return newHistory;
            });
            setActiveView('content');
        } else {
            setHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage?.isLoading) {
                    lastMessage.text = `Lo siento, mi especialidad es la trigonometría y las matemáticas. El tema que mencionaste no parece estar relacionado.\n\nTe sugiero explorar uno de estos temas:`;
                    lastMessage.isLoading = false;
                    lastMessage.suggestions = validationResult.suggested_topics;
                }
                return newHistory;
            });
            setActiveView('chat');
        }
    } catch (err: any) {
        console.error(err);
        const message = err.message || "";
        const errorMessage = message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? "Límite de solicitudes excedido. Por favor, espera un momento y vuelve a intentarlo."
            : "Ha ocurrido un error al procesar tu solicitud.";
        setError(errorMessage);
        setHistory(prev => prev.slice(0, -1)); // Remove the loading message
        setActiveView('chat');
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const handleNewExercise = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedExercise(null);
    setCurrentExerciseTopic(topic);

    try {
        const historyForTopic = exerciseHistory[topic] || [];
        const exercise = await geminiService.generarEjercicioTrigonometria(topic, historyForTopic);
        setGeneratedExercise(exercise);
        setExerciseHistory(prev => ({
            ...prev,
            [topic]: [...(prev[topic] || []), exercise.question]
        }));
    } catch (err) {
        console.error(err);
        const message = (err as any).message || "";
        const errorMessage = message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? "Límite de solicitudes excedido. Por favor, intenta de nuevo en unos momentos."
            : "No se pudo generar un nuevo ejercicio. Por favor, inténtalo de nuevo.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [exerciseHistory]);

  const handleResetAnalytics = () => {
    if(userData) {
      updateUserData({
        ...userData,
        analytics: analyticsService.getDefaultAnalyticsData()
      });
    }
  };

  const handleAudioPlay = (type: 'content' | 'exercises') => {
    if(userData) updateUserData({ ...userData, analytics: analyticsService.incrementAudioPlays(userData.analytics, type) });
  };
  
  const handleQuizComplete = (correct: number, incorrect: number) => {
    if(userData) updateUserData({ ...userData, analytics: analyticsService.recordQuizResults(userData.analytics, correct, incorrect) });
  };
  
  const handleExerciseAnswer = (isCorrect: boolean) => {
    if(userData) updateUserData({ ...userData, analytics: analyticsService.recordExerciseResult(userData.analytics, isCorrect) });
  };
  
  if (!currentUser || !userData) {
 return <LoginView onLogin={handleLogin} /> as React.ReactElement;
  }

  const renderView = () => {
    let viewContent;

    switch (activeView) {
      case 'chat':
        viewContent = <ChatView history={history} setHistory={setHistory} onTopicSubmit={handleTopicSubmit} isLoading={isLoading} error={error} setError={setError} />;
        break;
      case 'content':
        if (isLoading && !generatedContent) {
           viewContent = <div className="flex flex-col justify-center items-center h-full"><LoadingSpinner /><p className="mt-4">Generando contenido...</p></div>;
        } else if (generatedContent) {
           viewContent = <ContentView 
              content={generatedContent} 
              topic={currentContentTopic} 
              onAudioPlay={() => handleAudioPlay('content')}
              onQuizComplete={handleQuizComplete}
            />;
        } else {
            viewContent = <div className="flex justify-center items-center h-full"><p className="text-center text-gray-500 p-8">Usa el chat para buscar un tema y ver el contenido aquí.</p></div>;
        }
        break;
      case 'exercises':
        viewContent = <ExercisesView 
            topic={currentExerciseTopic} 
            initialExercise={generatedExercise} 
            onNewExercise={handleNewExercise} 
            isLoading={isLoading} 
            error={error}
            onAudioPlay={() => handleAudioPlay('exercises')}
            onAnswer={handleExerciseAnswer}
        />;
        break;
      case 'resources':
        viewContent = <ResourcesView />;
        break;
      case 'analytics':
        viewContent = <AnalyticsView data={userData.analytics} onReset={handleResetAnalytics} />;
        break;
      case 'profile':viewContent = <ProfileView 
                  user={userData.profile} 
                  onAvatarChange={handleUpdateAvatar}
                  onProfileSave={handleProfileUpdate} // <-- AÑADE ESTA LÍNEA
                />;
  break;
        break;
      default:
        viewContent = <ChatView history={history} setHistory={setHistory} onTopicSubmit={handleTopicSubmit} isLoading={isLoading} error={error} setError={setError} />;
        break;
    }
     return viewContent;
  };
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 4. MODIFICA esta condición. El `handleLogin` puede estar vacío porque
  //    onAuthStateChanged ya hace el trabajo pesado.
  if (!currentUser || !userData) {
    return <LoginView onLogin={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-base-200 dark:bg-dark-base-100 text-base-content dark:text-dark-base-content">
      <Sidebar currentView={activeView} setView={setActiveView} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
}

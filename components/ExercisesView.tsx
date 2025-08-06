import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseContent, ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import MarkdownRenderer from './MarkdownRenderer';
import * as geminiService from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

const exerciseTopics = [
    "Seno, Coseno y Tangente", "Teorema de Pitágoras", "Círculo Unitario",
    "Identidades Trigonométricas", "Leyes de Senos y Cosenos", "Radianes"
];

interface ExercisesViewProps {
    topic: string;
    initialExercise: ExerciseContent | null;
    onNewExercise: (topic: string) => void;
    isLoading: boolean;
    error: string | null;
    onAudioPlay: () => void;
    onAnswer: (isCorrect: boolean) => void;
}

export default function ExercisesView({ topic: initialTopic, initialExercise, onNewExercise, isLoading, error, onAudioPlay, onAnswer }: ExercisesViewProps): React.ReactNode {
    const [currentExercise, setCurrentExercise] = useState<ExerciseContent | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(initialTopic);

    // Tutor Chat State
    const [tutorChatHistory, setTutorChatHistory] = useState<ChatMessage[]>([]);
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const tutorInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoading) {
            setCurrentExercise(initialExercise);
            setSelectedOption(null);
            setIsAnswered(false);
            setTutorChatHistory([]);
        }
    }, [initialExercise, isLoading]);

    useEffect(() => {
        setCurrentTopic(initialTopic);
    }, [initialTopic]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [tutorChatHistory, isTutorLoading]);

    const speakText = useCallback((text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, []);

    const handleSpeak = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (currentExercise) {
            onAudioPlay();
            const textToSpeak = `Pregunta: ${currentExercise.question}. Opciones: ${currentExercise.options.map((o, i) => `Opción ${String.fromCharCode(65 + i)}: ${o.text}`).join('. ')}. ${isAnswered ? `Explicación: ${currentExercise.explanation}` : ''}`;
            speakText(textToSpeak);
        }
    }, [isSpeaking, currentExercise, isAnswered, speakText, onAudioPlay]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        }
    }, []);

    const handleSelectOption = (index: number) => {
        if (isAnswered || !currentExercise) return;
        const isCorrect = index === currentExercise.correctAnswerIndex;
        onAnswer(isCorrect);
        setSelectedOption(index);
        setIsAnswered(true);
    };

    const handleNewExercise = (newTopic: string) => {
        setCurrentTopic(newTopic);
        onNewExercise(newTopic);
    };

    const handleTutorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const question = tutorInputRef.current?.value;
        if (!question || isTutorLoading || !currentExercise) return;

        const userMessage: ChatMessage = { role: 'user', text: question };
        setTutorChatHistory(prev => [...prev, userMessage]);
        setIsTutorLoading(true);
        if (tutorInputRef.current) tutorInputRef.current.value = "";

        try {
            const responseText = await geminiService.getExerciseClarification(currentExercise, question);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setTutorChatHistory(prev => [...prev, modelMessage]);
        } catch (err: any) {
            console.error(err);
            const message = err.message || "";
            const errorText = message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
                ? "He alcanzado mi límite de consultas por ahora. Por favor, intenta de nuevo en unos momentos."
                : "Lo siento, hubo un problema al contactar a mi tutor interno. Por favor, inténtalo de nuevo.";
            const errorMessage: ChatMessage = { role: 'model', text: errorText };
            setTutorChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsTutorLoading(false);
        }
    };

    const getButtonClass = (index: number) => {
        if (!isAnswered) {
            return "bg-base-100 dark:bg-dark-base-200 hover:bg-base-300 dark:hover:bg-dark-base-300";
        }
        if (index === currentExercise?.correctAnswerIndex) {
            return "bg-green-200 dark:bg-green-800 border-green-500";
        }
        if (index === selectedOption) {
            return "bg-red-200 dark:bg-red-800 border-red-500";
        }
        return "bg-base-100 dark:bg-dark-base-200 opacity-60";
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col justify-center items-center min-h-[20rem] bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-xl p-6">
                    <LoadingSpinner />
                    <p className="mt-4 text-base-content dark:text-dark-base-content">Generando ejercicio sobre "{currentTopic}"...</p>
                </div>
            );
        }

        if (error) {
             return (
                <div className="text-center p-8 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 rounded-lg shadow-md">
                     <p className="font-bold">Error</p>
                     <p>{error}</p>
                </div>
            );
        }

        if (currentExercise) {
            return (
                <div className="bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-xl p-6 relative animate-fadeIn">
                    <button
                        onClick={handleSpeak}
                        className="absolute top-4 right-4 bg-brand-secondary text-white p-3 rounded-full hover:bg-brand-primary transition-colors"
                        aria-label={isSpeaking ? "Detener lectura" : "Leer ejercicio en voz alta"}
                    >
                        {isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
                    </button>

                    <h2 className="text-xl font-semibold mb-4 pr-12">{currentExercise.question}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        {currentExercise.options.map((option, index) => (
                            <button key={index} onClick={() => handleSelectOption(index)} disabled={isAnswered} className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${getButtonClass(index)}`}>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                                {option.text}
                            </button>
                        ))}
                    </div>

                    {isAnswered && (
                        <div className="mt-6 space-y-6 animate-fadeIn">
                            <div className="p-4 bg-base-200 dark:bg-dark-base-300 rounded-lg">
                                <h3 className="font-bold text-lg mb-2">Explicación:</h3>
                                <MarkdownRenderer content={currentExercise.explanation} />
                            </div>

                            <div className="p-4 bg-base-200 dark:bg-dark-base-300 rounded-lg">
                                <h3 className="font-bold text-lg mb-2 text-brand-primary">¿Tienes dudas? ¡Pregúntame!</h3>
                                <div ref={chatContainerRef} className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-4 border-b border-base-300 dark:border-dark-base-100 pb-4">
                                    {tutorChatHistory.length === 0 && (
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Escribe una pregunta sobre este ejercicio en el cuadro de abajo.</p>
                                    )}
                                    {tutorChatHistory.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary text-white flex items-center justify-center"><BotIcon /></div>}
                                            <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-base-100 dark:bg-dark-base-200'}`}>
                                                <MarkdownRenderer content={msg.text} />
                                            </div>
                                            {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-300 dark:bg-dark-base-300 text-base-content dark:text-dark-base-content flex items-center justify-center"><UserIcon /></div>}
                                        </div>
                                    ))}
                                    {isTutorLoading && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary text-white flex items-center justify-center"><BotIcon /></div>
                                            <div className="max-w-md p-3 rounded-lg shadow-sm bg-base-100 dark:bg-dark-base-200">
                                                <LoadingSpinner />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={handleTutorSubmit} className="flex items-center gap-2 pt-4">
                                    <input
                                        ref={tutorInputRef}
                                        type="text"
                                        placeholder="Ej: ¿Por qué se usa el seno aquí?"
                                        className="w-full p-2 bg-base-100 dark:bg-dark-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-base-content dark:text-dark-base-content"
                                        disabled={isTutorLoading}
                                    />
                                    <button type="submit" className="bg-brand-primary p-2.5 rounded-lg text-white disabled:bg-gray-400" disabled={isTutorLoading}>
                                        <SendIcon />
                                    </button>
                                </form>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={() => handleNewExercise(currentTopic)}
                                    disabled={isLoading}
                                    className="bg-brand-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-brand-primary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Generar otro ejercicio sobre "{currentTopic}"
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="text-center p-8 bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-md min-h-[10rem] flex items-center justify-center">
                 <p className="text-lg text-gray-600 dark:text-gray-400">Selecciona un tema para comenzar a practicar.</p>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-center">Ejercicios de Práctica</h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Selecciona un tema para generar un nuevo ejercicio.</p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {exerciseTopics.map(t => (
                    <button key={t} onClick={() => handleNewExercise(t)} disabled={isLoading} className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTopic === t && !isLoading ? 'bg-brand-primary text-white' : 'hover:bg-base-100 dark:bg-dark-base-200 hover:bg-base-300 dark:hover:bg-dark-base-300'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
}
import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedContent, QuizQuestion } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import * as geminiService from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ContentViewProps {
    content: GeneratedContent;
    topic: string | null;
    onAudioPlay: () => void;
    onQuizComplete: (correct: number, incorrect: number) => void;
}

export default function ContentView({ content, topic, onAudioPlay, onQuizComplete }: ContentViewProps): React.ReactNode {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const [allQuizQuestions, setAllQuizQuestions] = useState<QuizQuestion[]>(content.quiz);
    const [quiz, setQuiz] = useState<QuizQuestion[]>(content.quiz.slice(0, 5));
    const [quizBatch, setQuizBatch] = useState(0);

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isGeneratingNew, setIsGeneratingNew] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setAllQuizQuestions(content.quiz);
        setQuiz(content.quiz.slice(0, 5));
        setQuizBatch(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
        setGenerateError(null);
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [content]);

    const handleSpeak = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (contentRef.current) {
            onAudioPlay();
            const textToSpeak = contentRef.current.innerText;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'es-ES';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    }, [isSpeaking, onAudioPlay]);

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    const handleSubmitQuiz = () => {
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        quiz.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswerIndex) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        });
        setScore(correctAnswers);
        setIsSubmitted(true);
        onQuizComplete(correctAnswers, incorrectAnswers);
    };

    const handleGenerateNewQuiz = async () => {
        if (!topic || isGeneratingNew) return;

        const nextBatchIndex = quizBatch + 1;
        const nextBatchQuestions = allQuizQuestions.slice(nextBatchIndex * 5, (nextBatchIndex + 1) * 5);

        if (nextBatchQuestions.length > 0) {
            setQuiz(nextBatchQuestions);
            setQuizBatch(nextBatchIndex);
            setSelectedAnswers({});
            setIsSubmitted(false);
            setScore(0);
            return;
        }

        setIsGeneratingNew(true);
        setGenerateError(null);
        try {
            const newQuestions = await geminiService.generarNuevasPreguntas(topic);
            setAllQuizQuestions(newQuestions);
            setQuiz(newQuestions.slice(0, 5));
            setQuizBatch(0);
            setSelectedAnswers({});
            setIsSubmitted(false);
            setScore(0);
        } catch (e: any) {
            console.error("Failed to generate new quiz", e);
            const message = e.message || "";
            const errorMessage = message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
                ? "Límite de solicitudes excedido. Por favor, inténtalo de nuevo en unos momentos."
                : "No se pudieron generar nuevas preguntas.";
            setGenerateError(errorMessage);
        } finally {
            setIsGeneratingNew(false);
        }
    };

    const allQuestionsAnswered = quiz && Object.keys(selectedAnswers).length === quiz.length;

    const getOptionClass = (questionIndex: number, optionIndex: number) => {
        if (!isSubmitted) {
            return selectedAnswers[questionIndex] === optionIndex
                ? 'bg-brand-secondary/20 ring-2 ring-brand-primary'
                : 'bg-base-200 dark:bg-dark-base-300 hover:bg-base-300 dark:hover:bg-dark-base-100';
        }

        const isCorrect = quiz[questionIndex].correctAnswerIndex === optionIndex;
        const isSelected = selectedAnswers[questionIndex] === optionIndex;

        if (isCorrect) {
            return 'bg-green-200 dark:bg-green-800 ring-2 ring-green-500';
        }
        if (isSelected && !isCorrect) {
            return 'bg-red-200 dark:bg-red-800 ring-2 ring-red-500';
        }
        return 'bg-base-200 dark:bg-dark-base-300 opacity-60';
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="p-6 md:p-8 relative">
                     <button
                        onClick={handleSpeak}
                        className="absolute top-6 right-6 bg-brand-secondary text-white p-3 rounded-full hover:bg-brand-primary transition-colors"
                        aria-label={isSpeaking ? "Detener lectura" : "Leer contenido en voz alta"}
                    >
                        {isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
                    </button>
                    <div ref={contentRef}>
                        <MarkdownRenderer content={content.html} />
                    </div>
                </div>
            </div>

            {quiz && quiz.length > 0 && (
                 <div className="bg-base-100 dark:bg-dark-base-200 rounded-2xl shadow-xl p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-center mb-4">Prueba tus Conocimientos</h2>
                    {isSubmitted && (
                         <div className="text-center bg-brand-primary/10 text-brand-primary dark:text-dark-base-content dark:bg-brand-primary/20 p-4 rounded-lg mb-6">
                            <p className="text-xl font-bold">Resultados: ¡Obtuviste {score} de {quiz.length} correctas!</p>
                        </div>
                    )}
                    <div className="space-y-8">
                        {quiz.map((q, qIndex) => (
                            <div key={`${qIndex}-${q.question}`} className="pt-6 border-t border-base-200 dark:border-dark-base-300 first:border-t-0 first:pt-0">
                                 <div className="flex items-start gap-3 mb-4">
                                     {isSubmitted && (
                                        <div className="flex-shrink-0 mt-0.5">
                                            {selectedAnswers[qIndex] === q.correctAnswerIndex 
                                                ? <div className="text-green-500"><CheckCircleIcon /></div>
                                                : <div className="text-red-500"><XCircleIcon /></div>
                                            }
                                        </div>
                                    )}
                                     <p className="font-semibold text-lg flex-1">{qIndex + 1}. {q.question}</p>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIndex) => (
                                        <button 
                                            key={oIndex}
                                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                            disabled={isSubmitted}
                                            className={`p-3 rounded-lg text-left transition-all duration-200 ${getOptionClass(qIndex, oIndex)}`}
                                        >
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                                            {opt.text}
                                        </button>
                                    ))}
                                 </div>
                                 {isSubmitted && selectedAnswers[qIndex] !== q.correctAnswerIndex && q.explanation && (
                                    <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 animate-fadeIn">
                                        <h4 className="font-bold text-red-700 dark:text-red-300 mb-1">Retroalimentación:</h4>
                                        <div className="text-sm text-red-800 dark:text-red-200">
                                            <MarkdownRenderer content={q.explanation} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-base-200 dark:border-dark-base-300 flex flex-col items-center">
                        <div className="flex justify-center gap-4">
                            {!isSubmitted ? (
                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={!allQuestionsAnswered}
                                    className="bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-brand-secondary transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    Enviar Respuestas
                                </button>
                            ) : (
                                 <button
                                    onClick={handleGenerateNewQuiz}
                                    disabled={isGeneratingNew}
                                    className="bg-brand-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-brand-primary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isGeneratingNew ? <><LoadingSpinner /> Generando...</> : 'Generar Otras Preguntas'}
                                </button>
                            )}
                        </div>
                        {generateError && (
                            <div className="text-center text-red-500 mt-4" role="alert">
                                {generateError}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
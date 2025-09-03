
import { GoogleGenAI, Type } from "@google/genai";
import type { ExerciseContent, GeneratedContent, QuizQuestion } from '../types';

/*
 * =========================================================================
 *  NOTA DE SEGURIDAD
 * =========================================================================
 *  La clave API se maneja a través de `process.env.API_KEY`. En un
 *  entorno de producción, esta clave nunca debe exponerse del lado del
 *  cliente. Para una implementación segura, se debe usar un servidor proxy.
 * =========================================================================
 */
if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = "gemini-2.5-flash";


// --- Caching Utilities ---
const CACHE_PREFIX = "gemini-cache:";
const CACHE_EXPIRATION_MS = 1000 * 60 * 60; // 1 hour

interface CacheEntry<T> {
    timestamp: number;
    data: T;
}

function getFromCache<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const entry: CacheEntry<T> = JSON.parse(item);
        if (Date.now() - entry.timestamp > CACHE_EXPIRATION_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return entry.data;
    } catch (e) {
        console.error("Failed to read from cache:", e);
        return null;
    }
}

function setInCache<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
        timestamp: Date.now(),
        data: data,
    };
    try {
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
        console.error("Failed to write to cache:", e);
    }
}
// --- End Caching Utilities ---


export interface TopicValidationResult {
  is_relevant: boolean;
  suggested_topics: string[];
}

export async function validarTema(topic: string): Promise<TopicValidationResult> {
    const cacheKey = `${CACHE_PREFIX}validarTema:${topic.toLowerCase().trim()}`;
    const cachedResult = getFromCache<TopicValidationResult>(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    const validationPrompt = `Eres un asistente de IA para una aplicación de tutoría de trigonometría. Tu tarea es validar si el tema de un usuario está relacionado con la trigonometría o las matemáticas en general. Sé flexible y permite temas matemáticos amplios (cálculo, álgebra, geometría), pero rechaza temas que no estén relacionados (por ejemplo, historia, biología, literatura).

    Analiza el siguiente tema: "${topic}"

    Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura. No incluyas ninguna otra palabra o formato como "json" o \`\`\`.
    {
      "is_relevant": boolean,
      "suggested_topics": ["tema1", "tema2", "tema3"]
    }

    - "is_relevant" debe ser 'true' si el tema es de matemáticas o trigonometría, y 'false' si no lo es.
    - "suggested_topics" debe ser un array con tres sugerencias de temas de trigonometría si "is_relevant" es 'false'. Si es 'true', debe ser un array vacío.`;
    
    const validationSchema = {
      type: Type.OBJECT,
      properties: {
        is_relevant: {
          type: Type.BOOLEAN,
          description: "Si el tema es relevante para matemáticas o trigonometría."
        },
        suggested_topics: {
          type: Type.ARRAY,
          description: "Sugerencias de temas si no es relevante. Vacío si es relevante.",
          items: {
            type: Type.STRING
          }
        }
      },
      required: ["is_relevant", "suggested_topics"]
    };

    const response = await ai.models.generateContent({
        model: textModel,
        contents: validationPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: validationSchema
        }
    });

    try {
        const result = JSON.parse(response.text);
        setInCache(cacheKey, result);
        return result as TopicValidationResult;
    } catch (e) {
        console.error("Failed to parse validation response:", response.text);
        return { is_relevant: false, suggested_topics: ["Ley de Senos", "Círculo Unitario", "Teorema de Pitágoras"] };
    }
}


export async function generarContenidoEducativo(topic: string): Promise<GeneratedContent> {
    const cacheKey = `${CACHE_PREFIX}generarContenido:${topic.toLowerCase().trim()}`;
    const cachedResult = getFromCache<GeneratedContent>(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    const prompt = `Genera una página educativa completa sobre "${topic}" en español, dirigida a estudiantes de secundaria.
    Estructura del contenido:
    1. **Título Principal**: Usa un H1 (#) con el nombre del tema.
    2. **Introducción**: Usa un H2 (##). Escribe un párrafo (100-150 palabras) que explique qué es el tema, su importancia en trigonometría y una aplicación práctica para captar interés.
    3. **Conceptos Clave**: Usa un H2 (##). Proporciona una lista de 3-5 ideas principales en viñetas (* o -), con explicaciones claras y un breve ejemplo por concepto.
    4. **Fórmulas Importantes**: Usa un H2 (##). Muestra las fórmulas clave en bloques de código Markdown (\`\`\`). Incluye una breve descripción de cada fórmula (su propósito y variables).
    5. **Ejemplo Resuelto**: Usa un H2 (##). Proporciona un problema resuelto paso a paso que aplique el tema, mostrando el razonamiento y cálculos.
    6. **Aplicaciones Prácticas**: Usa un H2 (##). Escribe un párrafo (50-100 palabras) sobre usos reales del tema (por ejemplo, en arquitectura, navegación).
    
    Además del contenido, crea un quiz de 10 preguntas clave de opción múltiple basadas en el contenido que generaste. Cada pregunta debe tener 4 opciones. Para cada pregunta, proporciona una explicación detallada que aclare por qué la respuesta correcta es la correcta.

    Tu respuesta DEBE ser un objeto JSON válido con la siguiente estructura. No incluyas ninguna otra palabra o formato como "json" o \`\`\`.
    {
      "html": "...",
      "quiz": [
        {
          "question": "...",
          "options": [{ "text": "..." }, ...],
          "correctAnswerIndex": 0,
          "explanation": "..."
        }
      ]
    }`;

    const contentSchema = {
        type: Type.OBJECT,
        properties: {
            html: { type: Type.STRING, description: "El contenido educativo en formato Markdown." },
            quiz: {
                type: Type.ARRAY,
                description: "Un quiz con 10 preguntas de opción múltiple.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { text: { type: Type.STRING } },
                                required: ["text"]
                            }
                        },
                        correctAnswerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING, description: "Explicación detallada de por qué la respuesta es correcta." }
                    },
                    required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
            }
        },
        required: ["html", "quiz"]
    };

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: contentSchema
        }
    });
    
    try {
        const result = JSON.parse(response.text);
        setInCache(cacheKey, result);
        return result as GeneratedContent;
    } catch (e) {
        console.error("Failed to parse content response:", response.text, e);
        throw new Error("No se pudo analizar la respuesta del contenido generado.");
    }
}

export async function generarNuevasPreguntas(topic: string): Promise<QuizQuestion[]> {
     const prompt = `Crea un quiz de 5 preguntas clave de opción múltiple sobre "${topic}" en español, para estudiantes de secundaria. Cada pregunta debe tener 4 opciones. Para cada pregunta, proporciona una explicación detallada que aclare por qué la respuesta correcta es la correcta.

    Tu respuesta DEBE ser un array de objetos JSON válido con la siguiente estructura. No incluyas ninguna otra palabra o formato como "json" o \`\`\`.
    [
      {
        "question": "Pregunta 1...",
        "options": [{ "text": "Opción A" }, ...],
        "correctAnswerIndex": 0,
        "explanation": "Explicación de la respuesta correcta..."
      }
    ]`;

    const quizSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { text: { type: Type.STRING } },
                        required: ["text"]
                    }
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING, description: "Explicación detallada de por qué la respuesta es correcta." }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
    };
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema
        }
    });
    
    try {
        let quiz = JSON.parse(response.text);
        if (quiz && quiz.length > 5) {
            quiz = quiz.slice(0, 5);
        }
        return quiz as QuizQuestion[];
    } catch (e) {
        console.error("Failed to parse new questions response:", response.text, e);
        throw new Error("No se pudo analizar la respuesta de las nuevas preguntas.");
    }
}


export async function generarEjercicioTrigonometria(topic: string, history: string[] = []): Promise<ExerciseContent> {
     const historyPrompt = history.length > 0
        ? `
IMPORTANTE: Ya se han mostrado los siguientes ejercicios. Para asegurar la variedad, DEBES crear un problema completamente NUEVO que sea distinto a los del historial. No repitas los mismos problemas ni crees variaciones simples cambiando solo los números. Sé creativo.

Historial de ejercicios anteriores (NO REPETIR):
${history.map((q) => `- "${q}"`).join('\n')}
`
        : '';

     const exercisePrompt = `Crea un ejercicio de opción múltiple **NUEVO y DIFERENTE** sobre "${topic}" en español.${historyPrompt}
    
    La pregunta debe ser relevante y de nivel de secundaria. Proporciona 4 opciones de respuesta (una correcta y tres incorrectas plausibles). Indica el índice de la respuesta correcta y una explicación clara y concisa de la solución.
    
    Tu respuesta DEBE ser un objeto JSON válido con la siguiente estructura. No incluyas ninguna otra palabra o formato como "json" o \`\`\`.
    {
      "question": "El texto de la pregunta...",
      "options": [
        { "text": "Opción A" },
        { "text": "Opción B" },
        { "text": "Opción C" },
        { "text": "Opción D" }
      ],
      "correctAnswerIndex": 2, // Índice de la respuesta correcta (0-3)
      "explanation": "Una explicación detallada de por qué esa es la respuesta correcta."
    }`;

    const exerciseSchema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING } },
                    required: ["text"]
                }
            },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
    };

    const exerciseResponse = await ai.models.generateContent({
        model: textModel,
        contents: exercisePrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: exerciseSchema
        }
    });

    try {
        const exerciseData = JSON.parse(exerciseResponse.text);
        return exerciseData as ExerciseContent;
    } catch (e) {
        console.error("Failed to parse exercise response:", exerciseResponse.text, e);
        throw new Error("No se pudo analizar la respuesta del ejercicio generado.");
    }
}

export async function getExerciseClarification(
    exercise: ExerciseContent,
    userQuestion: string
): Promise<string> {
    const cacheKey = `${CACHE_PREFIX}clarification:${exercise.question}:${userQuestion.toLowerCase().trim()}`;
    const cachedResult = getFromCache<string>(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }

    const prompt = `
        Eres un tutor de trigonometría amable y servicial. Un estudiante acaba de intentar resolver el siguiente ejercicio y tiene una pregunta. Tu tarea es responder a su pregunta de manera clara y concisa, basándote únicamente en el contexto del ejercicio proporcionado.

        **Contexto del Ejercicio:**
        - **Pregunta:** ${exercise.question}
        - **Opciones:** ${exercise.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt.text}`).join('\n')}
        - **Respuesta Correcta (Índice):** ${exercise.correctAnswerIndex}
        - **Explicación de la Solución:** ${exercise.explanation}

        **Pregunta del Estudiante:**
        "${userQuestion}"

        **Instrucciones:**
        1.  Responde directamente a la pregunta del estudiante.
        2.  Utiliza la explicación proporcionada como base para tu respuesta si es relevante.
        3.  Sé alentador y positivo.
        4.  No introduzcas conceptos nuevos que no estén directamente relacionados con la resolución de este problema específico.
        5.  Tu respuesta debe ser solo texto, utilizando Markdown simple para formato si es necesario (negritas, listas). No uses JSON.
    `;
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
    });

    setInCache(cacheKey, response.text);
    return response.text;
}

export async function generarSesionDePractica(topic: string): Promise<ExerciseContent[]> {
    const prompt = `Crea una sesión de práctica de 5 ejercicios de opción múltiple sobre "${topic}" en español para estudiantes de secundaria.

    INSTRUCCIONES IMPORTANTES:
    1.  **VARIEDAD**: Cada uno de los 5 ejercicios debe ser único y diferente de los demás. Cubre diferentes aspectos del tema, usa diferentes números y formula las preguntas de maneras distintas. No repitas problemas.
    2.  **ESTRUCTURA**: Cada ejercicio debe tener una pregunta clara, 4 opciones de respuesta (una correcta y tres incorrectas plausibles), el índice de la respuesta correcta, y una explicación detallada de la solución.
    
    Tu respuesta DEBE ser un array de 5 objetos JSON, con la siguiente estructura. No incluyas ninguna otra palabra o formato como "json" o \`\`\`.
    [
      {
        "question": "Texto de la pregunta 1...",
        "options": [ { "text": "Opción A" }, ... ],
        "correctAnswerIndex": 1,
        "explanation": "Explicación detallada de la pregunta 1."
      },
      ...
    ]`;

    const practiceSessionSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { text: { type: Type.STRING } },
                        required: ["text"]
                    }
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
    };

    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: practiceSessionSchema
        }
    });

    try {
        const sessionData = JSON.parse(response.text);
        if (sessionData && sessionData.length > 5) {
            return sessionData.slice(0, 5) as ExerciseContent[];
        }
        return sessionData as ExerciseContent[];
    } catch (e) {
        console.error("Failed to parse practice session response:", response.text, e);
        throw new Error("No se pudo analizar la respuesta de la sesión de práctica.");
    }
}

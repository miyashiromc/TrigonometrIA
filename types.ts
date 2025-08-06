
export type View = 'chat' | 'content' | 'exercises' | 'resources' | 'analytics' | 'profile';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isLoading?: boolean;
  suggestions?: string[];
}

export interface QuizQuestion {
  question: string;
  options: { text: string }[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface GeneratedContent {
  html: string;
  quiz: QuizQuestion[];
}

export interface ExerciseOption {
  text: string;
}

export interface ExerciseContent {
  question: string;
  options: ExerciseOption[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface AnalyticsData {
  timeSpentInViews: {
    chat: number;
    content: number;
    exercises: number;
    resources: number;
    analytics: number;
    profile: number;
  };
  audioPlays: {
    content: number;
    exercises: number;
  };
  exerciseStats: {
    correct: number;
    incorrect: number;
  };
  quizStats: {
    correct: number;
    incorrect: number;
  };
}

// User Profile & Data
export interface User {
    username: string;
    avatar: string; // e.g., 'avatar1', 'avatar2'
}

export interface UserData {
    profile: User;
    analytics: AnalyticsData;
    progress?: UserProgress;
}

// Roadmap & Progress
export type NodeType = 'concept' | 'practice' | 'game' | 'playground';

export interface RoadmapNode {
    id: string;
    type: NodeType;
    title: string;
    topic: string;
    requires?: string[];
    requiredScore?: number;
}

export interface RoadmapSection {
    title: string;
    nodes: RoadmapNode[];
}

export interface UserProgress {
    [nodeId: string]: {
        completed: boolean;
        score?: number;
    };
}

// Practice & Results
export interface PracticeResults {
    correct: number;
    incorrect: number;
}

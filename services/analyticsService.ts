import type { AnalyticsData, View } from '../types';

export const getDefaultAnalyticsData = (): AnalyticsData => ({
  timeSpentInViews: {
    chat: 0,
    content: 0,
    exercises: 0,
    resources: 0,
    analytics: 0,
    profile: 0,
  },
  audioPlays: {
    content: 0,
    exercises: 0,
  },
  exerciseStats: {
    correct: 0,
    incorrect: 0,
  },
  quizStats: {
    correct: 0,
    incorrect: 0,
  },
});

export const updateTimeSpent = (data: AnalyticsData, view: View, seconds: number): AnalyticsData => {
  const newData = { ...data };
  if (newData.timeSpentInViews.hasOwnProperty(view)) {
    newData.timeSpentInViews[view] = (newData.timeSpentInViews[view] || 0) + seconds;
  }
  return newData;
};

export const incrementAudioPlays = (data: AnalyticsData, type: 'content' | 'exercises'): AnalyticsData => {
  const newData = { ...data };
  newData.audioPlays[type]++;
  return newData;
};

export const recordExerciseResult = (data: AnalyticsData, isCorrect: boolean): AnalyticsData => {
  const newData = { ...data };
  if (isCorrect) {
    newData.exerciseStats.correct++;
  } else {
    newData.exerciseStats.incorrect++;
  }
  return newData;
};

export const recordQuizResults = (data: AnalyticsData, correct: number, incorrect: number): AnalyticsData => {
  const newData = { ...data };
  newData.quizStats.correct += correct;
  newData.quizStats.incorrect += incorrect;
  return newData;
};
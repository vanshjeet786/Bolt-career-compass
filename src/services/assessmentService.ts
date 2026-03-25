import { CAREER_MAPPING } from '../data/careerMapping';
import { AssessmentResponse } from '../types';

export const calculateScores = (allResponses: AssessmentResponse[]): Record<string, number> => {
  const scoresByCategory: Record<string, number[]> = {};

  allResponses.forEach(response => {
    if (typeof response.response === 'number') {
      if (!scoresByCategory[response.categoryId]) {
        scoresByCategory[response.categoryId] = [];
      }
      scoresByCategory[response.categoryId].push(response.response);
    }
  });

  const averageScores: Record<string, number> = {};
  Object.entries(scoresByCategory).forEach(([category, scores]) => {
    if (scores.length > 0) {
      averageScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  });

  return averageScores;
};

export const generateCareerRecommendations = (scores: Record<string, number>): string[] => {
  let recommendations: Set<string> = new Set();

  // Add recommendations based on high scores
  Object.entries(scores)
    .sort(([, a], [, b]) => b - a) // Sort by score descending
    .forEach(([category, score]) => {
      if (score >= 3.5 && CAREER_MAPPING[category]) {
        CAREER_MAPPING[category].forEach(career => recommendations.add(career));
      }
    });

  // If not enough recommendations, add some general ones to ensure we have at least 8
  if (recommendations.size < 8) {
    const generalCareers = [
      'Software Developer',
      'Project Manager',
      'Marketing Manager',
      'Data Analyst',
      'Graphic Designer',
      'Financial Advisor',
      'Human Resources Manager',
      'Registered Nurse',
      'Content Creator',
      'UX/UI Designer',
      'Data Scientist',
      'Product Manager'
    ];

    // Simply add from general careers until we hit 8 or run out of options
    // without risking an infinite loop if the set size doesn't change
    let i = 0;
    while (recommendations.size < 8 && i < generalCareers.length) {
      recommendations.add(generalCareers[i]);
      i++;
    }
  }

  // Convert set to array and limit to a reasonable number (e.g., 8-10)
  return Array.from(recommendations).slice(0, 10);
};

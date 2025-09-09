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
  const recommendations: string[] = [];

  Object.entries(scores).forEach(([category, score]) => {
    if (score >= 4.0 && CAREER_MAPPING[category]) {
      recommendations.push(...CAREER_MAPPING[category]);
    }
  });

  const uniqueRecommendations = [...new Set(recommendations)];

  // If not enough recommendations, add some general ones to ensure a good list
  if (uniqueRecommendations.length < 8) {
    const generalCareers = [
      "Marketing Manager", "Software Developer", "Human Resources Specialist",
      "Financial Analyst", "Project Manager", "Graphic Designer",
      "Data Analyst", "Registered Nurse", "Sales Manager", "Customer Service Representative"
    ];
    for (const career of generalCareers) {
      if (uniqueRecommendations.length < 8 && !uniqueRecommendations.includes(career)) {
        uniqueRecommendations.push(career);
      }
    }
  }

  // Limit to a max of 10
  return uniqueRecommendations.slice(0, 10);
};

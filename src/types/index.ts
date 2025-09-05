export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  userId: string;
  completedAt: Date;
  responses: AssessmentResponse[];
  scores: Record<string, number | string>;
  recommendedCareers: string[];
  mlPrediction?: string;
}

export interface AssessmentResponse {
  layerId: string;
  categoryId: string;
  questionId: string;
  questionText: string;
  response: number | string | string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'likert' | 'open-ended';
  category: string;
}

export interface AssessmentLayer {
  id: string;
  name: string;
  description: string;
  categories: Record<string, Question[]>;
  isOpenEnded: boolean;
}

export interface CareerRecommendation {
  name: string;
  match: number;
  skills: string[];
  outlook: string;
  salaryRange: string;
  description: string;
  dailyTasks?: string[];
  education?: string;
  growthOpportunities?: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
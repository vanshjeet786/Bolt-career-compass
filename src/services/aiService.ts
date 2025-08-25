import { ChatMessage, Question } from '../types';
import { supabase } from './supabaseClient';

interface AIServiceResponse {
  suggestions: string[];
  explanation: string;
}

// This is a simplified UserProfile for the AI service context
interface UserProfile {
  scores: Record<string, number>;
  careers: string[];
  previousAssessments?: any[];
  personalityTraits?: Record<string, any>;
}

// Fallback explanations for each layer and category
const FALLBACK_EXPLANATIONS: Record<string, Record<string, string>> = {
  'layer1': {
    'Linguistic': 'This question assesses your linguistic intelligence - your ability to use words effectively, both in writing and speaking. Strong linguistic skills are essential for careers in journalism, teaching, law, content creation, and public relations. People with high linguistic intelligence often enjoy reading, writing, debating, and storytelling.',
    'Logical-Mathematical': 'This evaluates your logical-mathematical intelligence, which involves your ability to think logically, solve problems systematically, and work with numbers and patterns. High scores in this area suggest aptitude for careers in data science, engineering, finance, research, programming, and scientific fields.',
    'Visual-Spatial': 'This measures your visual-spatial intelligence - your ability to visualize concepts, think in three dimensions, and understand spatial relationships. This intelligence is crucial for careers in graphic design, architecture, engineering, art, photography, and any field requiring visual creativity or spatial reasoning.',
    'Interpersonal': 'This assesses your interpersonal intelligence, which is your ability to understand and work effectively with others. High interpersonal skills indicate potential for success in management, counseling, teaching, sales, human resources, and any role requiring strong team collaboration and communication.',
    'Intrapersonal': 'This evaluates your intrapersonal intelligence - your level of self-awareness and ability to understand your own emotions, motivations, and goals. Strong intrapersonal skills are valuable for entrepreneurship, consulting, research, writing, and any career requiring independent decision-making and self-direction.',
    'Naturalistic': 'This measures your naturalistic intelligence, which involves your ability to recognize patterns in nature, understand living systems, and work with the natural world. This intelligence is ideal for careers in environmental science, biology, agriculture, veterinary medicine, and conservation work.'
  },
  'layer2': {
    'MBTI': 'This question explores your personality preferences based on the Myers-Briggs framework. Understanding whether you lean toward introversion/extraversion, sensing/intuition, thinking/feeling, and judging/perceiving helps identify work environments and roles where you\'ll naturally thrive and feel energized.',
    'Big Five - Openness': 'This assesses your openness to experience, measuring how curious, creative, and open to new ideas you are. High openness suggests you\'ll thrive in innovative, creative, or research-oriented roles that involve exploring new concepts and approaches.',
    'Big Five - Conscientiousness': 'This evaluates your conscientiousness - how organized, disciplined, and goal-oriented you are. High conscientiousness is valuable for roles requiring attention to detail, project management, quality control, and systematic approaches to work.',
    'Big Five - Extraversion': 'This measures your extraversion level, indicating how energized you are by social interaction and external stimulation. High extraversion suggests success in sales, marketing, public relations, event planning, and leadership roles that involve frequent interpersonal interaction.'
  },
  'layer3': {
    'Numerical Aptitude': 'This evaluates your numerical reasoning abilities and comfort with mathematical concepts. Strong numerical aptitude is essential for careers in finance, accounting, data analysis, statistics, economics, and any field requiring quantitative analysis and mathematical problem-solving.',
    'Verbal Aptitude': 'This assesses your verbal reasoning and language comprehension skills. High verbal aptitude indicates potential for success in communications, writing, editing, teaching, law, journalism, and any career requiring strong language skills and clear communication.',
    'Technical Skills': 'This measures your technical competency and ability to work with tools, systems, and technology. Strong technical skills are valuable across many industries, particularly in IT, engineering, software development, cybersecurity, and technical support roles.'
  },
  'layer4': {
    'Educational Background': 'This examines how your educational experiences and access to learning resources influence your career opportunities. Your educational background provides the foundation for many career paths and helps identify areas where you may need additional development or have natural advantages.',
    'Career Exposure': 'This assesses your exposure to different career paths through internships, networking, mentorship, and real-world experiences. Greater career exposure helps you make more informed decisions and often leads to better career opportunities through connections and practical knowledge.'
  },
  'layer5': {
    'Interests and Passions': 'This explores what genuinely excites and motivates you outside of formal requirements. Understanding your true interests is crucial for long-term career satisfaction, as careers aligned with your passions tend to be more fulfilling and sustainable over time.',
    'Personal Goals and Values': 'This examines your core values and long-term goals, which should guide your career decisions. Careers that align with your personal values and support your life goals lead to greater satisfaction, better work-life balance, and more meaningful professional experiences.'
  },
  'layer6': {
    'Self_Synthesis': 'This self-reflection question helps you synthesize insights from previous layers to identify patterns in your strengths, preferences, and interests. Taking time to reflect on these connections helps create a clearer picture of your ideal career direction.',
    'Action_Plan': 'This planning question encourages you to translate your self-knowledge into concrete next steps. Creating specific, actionable plans increases the likelihood that you\'ll successfully pursue careers that align with your assessment results and personal goals.'
  }
};

// Fallback suggestions for open-ended questions
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  'layer6': [
    'Consider reflecting on moments when you felt most engaged and energized in academic or work settings. What activities or environments brought out your best performance?',
    'Think about the feedback you\'ve received from teachers, supervisors, or peers. What strengths do others consistently recognize in you, and how might these translate to career opportunities?',
    'Examine your natural problem-solving approach. Do you prefer working with data and logic, collaborating with people, creating visual solutions, or working independently? This can guide your career direction.'
  ]
};

// Helper function to invoke the Supabase Edge Function
async function invokeHuggingFaceFunction(prompt: string) {
  try {
    const { data, error } = await supabase.functions.invoke('huggingface-ai-service', {
      body: { prompt },
    });

    if (error) {
      console.error('Supabase function invocation failed:', error);
      throw new Error(`Supabase function invocation failed: ${error.message}`);
    }

    // The Edge Function returns the direct JSON from Hugging Face
    if (data && Array.isArray(data) && data[0] && data[0].generated_text) {
      return data[0].generated_text.trim();
    }

    throw new Error('Invalid response from AI service function.');
  } catch (error) {
    console.error('Error calling Hugging Face function:', error);
    throw error;
  }
}

class AIService {
  private responseCache = new Map<string, any>();
  
  // This function remains a mock as per original implementation
  async generateCareerRecommendations(
    scores: Record<string, number>,
    responses: any[],
    previousAssessments?: any[]
  ): Promise<string> {
    const cacheKey = `career-rec-${JSON.stringify(scores)}-${previousAssessments?.length || 0}`;
    if (this.responseCache.has(cacheKey)) return this.responseCache.get(cacheKey);

    const topCategories = Object.entries(scores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3).map(([category]) => category);

    let insights = `Based on your comprehensive assessment, you demonstrate exceptional strengths in ${topCategories.join(', ')}. `;
    if (previousAssessments && previousAssessments.length > 0) {
      insights += `I've also noticed significant growth in several areas since your last assessment. `;
    }
    insights += `This unique combination positions you well for careers that require ${this.getStrengthDescriptions(topCategories)}. Consider focusing on opportunities that leverage these top strengths.`;
    this.responseCache.set(cacheKey, insights);
    return insights;
  }

  private getStrengthDescriptions(categories: string[]): string {
    const descriptions: Record<string, string> = {
      'Linguistic': 'strong communication', 'Logical-Mathematical': 'analytical thinking',
      'Visual-Spatial': 'creative design', 'Interpersonal': 'team collaboration',
      'Intrapersonal': 'self-awareness', 'Naturalistic': 'environmental awareness',
      'Numerical Aptitude': 'data analysis', 'Verbal Aptitude': 'communication excellence',
      'Technical Skills': 'technology proficiency'
    };
    return categories.map(cat => descriptions[cat] || 'specialized expertise').join(', ');
  }

  // --- AI-Powered Functions ---

  async explainQuestion(question: Question, layerId: string, categoryId: string): Promise<string> {
    try {
      const prompt = `[INST] You are an expert career assessment designer. In a friendly and helpful tone, briefly explain the purpose of the following assessment question and what it is trying to measure. Keep the explanation to about 2-3 sentences.

Question: "${question.text}"
Layer: ${layerId}
Category: ${categoryId} [/INST]`;
      
      return await invokeHuggingFaceFunction(prompt);
    } catch (error) {
      console.error('Failed to get AI explanation, using fallback:', error);
      return this.getFallbackExplanation(layerId, categoryId, question.text);
    }
  }

  private getFallbackExplanation(layerId: string, categoryId: string, questionText: string): string {
    // Try to get specific explanation for this layer and category
    if (FALLBACK_EXPLANATIONS[layerId] && FALLBACK_EXPLANATIONS[layerId][categoryId]) {
      return FALLBACK_EXPLANATIONS[layerId][categoryId];
    }

    // Generic fallbacks based on question content
    const lowerText = questionText.toLowerCase();
    if (lowerText.includes('enjoy') || lowerText.includes('like')) {
      return 'This question explores your preferences and interests to identify career paths that will be naturally engaging and motivating for you. Understanding what you enjoy helps ensure long-term career satisfaction.';
    } else if (lowerText.includes('good at') || lowerText.includes('ability')) {
      return 'This question assesses your natural abilities and developed skills. Identifying your strengths helps match you with roles where you can excel and contribute meaningfully.';
    } else if (lowerText.includes('environment') || lowerText.includes('setting')) {
      return 'This question examines your preferred work environment and conditions. Finding the right work setting is crucial for productivity, satisfaction, and professional success.';
    }

    return 'This question assesses a key aspect of your career profile. Your honest response helps ensure you receive personalized and accurate career recommendations.';
  }

  async suggestAnswer(
    question: Question,
    userScores: Record<string, number> = {},
    careers: string[] = [],
    previousAssessments?: any[]
  ): Promise<AIServiceResponse> {
    try {
      const prompt = `[INST] You are an expert career counselor providing suggestions for an open-ended assessment question.
Your response MUST be a valid JSON object.

**User Profile:**
- Top Recommended Careers: ${careers.join(', ') || 'N/A'}
- Strengths (Scores): ${JSON.stringify(userScores, null, 2) || 'N/A'}

**Assessment Question:**
"${question.text}"

**Your Task:**
1. Generate 3 distinct, personalized, and encouraging suggestions (80-100 words each) for how the user could answer this question.
2. Generate a brief explanation (20-30 words) of the reasoning behind these suggestions.
3. Format your entire response as a single JSON object with two keys: "suggestions" (an array of 3 strings) and "explanation" (a single string).

Do not include any text outside of the JSON object.
[/INST]`;

      const jsonResponse = await invokeHuggingFaceFunction(prompt);

      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON object found in the AI response.");
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions) && typeof parsed.explanation === 'string') {
        return parsed;
      }
      throw new Error("Parsed JSON does not match the expected format.");
    } catch (error) {
      console.error("Failed to get AI suggestions, using fallback:", error);
      return this.getFallbackSuggestions(question);
    }
  }

  private getFallbackSuggestions(question: Question): AIServiceResponse {
    const suggestions = FALLBACK_SUGGESTIONS['layer6'] || [
      'Reflect on your past experiences and identify patterns in what energized and motivated you most.',
      'Consider the feedback you\'ve received from others about your natural strengths and abilities.',
      'Think about the activities or subjects that you find yourself naturally drawn to in your free time.'
    ];

    return {
      suggestions,
      explanation: 'These suggestions help you reflect on your experiences to provide meaningful responses.'
    };
  }

  async chatResponse(
    message: string,
    history: ChatMessage[],
    userResults?: { scores: Record<string, number>; careers: string[] }
  ): Promise<string> {
    try {
      const historyText = history
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Counselor'}: ${msg.text}`)
        .join('\n');

      const prompt = `[INST] You are a friendly, expert academic and career counselor. You are talking to a user who has just completed a career assessment. Be encouraging, insightful, and conversational. Keep your responses concise and focused.

Here is the user's assessment summary:
- Top Recommended Careers: ${userResults?.careers?.join(', ') || 'Not available'}
- Key Strengths (Scores): ${JSON.stringify(userResults?.scores, null, 2) || 'Not available'}

Here is the conversation history:
${historyText}
User: ${message}

Provide a helpful and friendly response to the user's last message.
[/INST]`;

      return await invokeHuggingFaceFunction(prompt);
    } catch (error) {
      console.error('Failed to get AI chat response, using fallback:', error);
      return this.getFallbackChatResponse(message, userResults);
    }
  }

  private getFallbackChatResponse(message: string, userResults?: { scores: Record<string, number>; careers: string[] }): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      const careers = userResults?.careers || [];
      if (careers.length > 0) {
        return `Based on your assessment results, you show strong potential in ${careers.slice(0, 3).join(', ')}. These careers align well with your demonstrated strengths. Would you like to discuss any specific aspects of these career paths?`;
      }
      return 'Career planning is an exciting journey! Your assessment results provide valuable insights into your strengths and preferences. What specific aspects of career planning would you like to explore?';
    }
    
    if (lowerMessage.includes('strength') || lowerMessage.includes('skill')) {
      const topStrengths = userResults?.scores ? Object.entries(userResults.scores)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category]) => category) : [];
      
      if (topStrengths.length > 0) {
        return `Your top strengths appear to be in ${topStrengths.join(', ')}. These are valuable assets that can guide your career decisions. How do you see these strengths applying to your career goals?`;
      }
      return 'Understanding your strengths is crucial for career success. Your assessment has identified several key areas where you excel. What would you like to know about leveraging these strengths?';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      return 'I\'m here to help you navigate your career journey! Whether you want to discuss your assessment results, explore career options, or plan next steps, I\'m ready to provide guidance. What specific area would you like to focus on?';
    }
    
    return 'That\'s a great question! Your career assessment provides valuable insights that can guide your professional development. Based on your results, you have several promising directions to explore. What aspect would you like to discuss further?';
  }

  clearCache(): void {
    this.responseCache.clear();
  }
}

export const aiService = new AIService();
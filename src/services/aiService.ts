import { ChatMessage, Question } from '../types';
import { supabase } from './supabaseClient';

interface AIServiceResponse {
  suggestions: string[];
  explanation: string;
}

interface UserProfile {
  scores: Record<string, number>;
  careers: string[];
  previousAssessments?: any[];
  personalityTraits?: Record<string, any>;
}

async function invokeHuggingFaceFunction(prompt: string) {
  const { data, error } = await supabase.functions.invoke('huggingface-ai-service', {
    body: { prompt },
  });

  if (error) {
    throw new Error(`Supabase function invocation failed: ${error.message}`);
  }

  if (data && Array.isArray(data) && data[0] && data[0].generated_text) {
    return data[0].generated_text.trim();
  }

  throw new Error('Invalid response from AI service function.');
}

class AIService {
  private responseCache = new Map<string, any>();
  
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

  async explainQuestion(question: Question, layerId: string, categoryId: string): Promise<string> {
    const cacheKey = `explain-${layerId}-${categoryId}-${question.text.substring(0, 50)}`;
    if (this.responseCache.has(cacheKey)) return this.responseCache.get(cacheKey);

    try {
      const prompt = `[INST] You are an expert career counselor. Explain this assessment question in 2-3 sentences: "${question.text}"

      Explain:
      1. What this question is trying to assess
      2. Why this is important for career guidance
      3. How responses help determine career fit

      Keep it concise and helpful for someone taking a career assessment. [/INST]`;
      const aiExplanation = await invokeHuggingFaceFunction(prompt);
      if (aiExplanation && aiExplanation.length > 20) {
        this.responseCache.set(cacheKey, aiExplanation);
        return aiExplanation;
      }
    } catch (error) {
      console.error('Hugging Face API failed for explanation:', error);
    }

    const explanation = this.generateLocalExplanation(question.text, layerId, categoryId);
    this.responseCache.set(cacheKey, explanation);
    return explanation;
  }

  private generateLocalExplanation(questionText: string, layerId: string, categoryId: string): string {
    const lowerText = questionText.toLowerCase();
    if (layerId === 'layer1') {
      if (categoryId === 'Linguistic') {
        return `This question assesses your linguistic intelligence - your ability to use words effectively. Strong linguistic skills are key for careers in journalism, teaching, or law.`;
      } else if (categoryId === 'Logical-Mathematical') {
        return `This evaluates your logical-mathematical intelligence for problem-solving and numbers. High scores suit careers in data science, engineering, or finance.`;
      } else if (categoryId === 'Visual-Spatial') {
        return `This measures your ability to visualize concepts, crucial for design or architecture. Strong visual-spatial skills enhance success in creative and technical fields.`;
      } else if (categoryId === 'Interpersonal') {
        return `This assesses your ability to work with others, vital for management or counseling. High interpersonal skills indicate strong team collaboration potential.`;
      } else if (categoryId === 'Intrapersonal') {
        return `This evaluates self-awareness, key for entrepreneurship or consulting. Strong intrapersonal skills support independent decision-making and self-direction.`;
      } else if (categoryId === 'Naturalistic') {
        return `This measures your ability to understand natural systems, ideal for environmental science or biology careers. It highlights pattern recognition in nature.`;
      }
    } else if (layerId === 'layer2') {
      if (categoryId === 'MBTI') {
        return `This explores your personality preferences to identify suitable work environments. Understanding your traits helps match you to energizing roles.`;
      } else if (categoryId.includes('Big Five')) {
        return `This assesses personality dimensions to predict workplace behavior. Responses guide career recommendations for optimal satisfaction.`;
      }
    } else if (layerId === 'layer3') {
      if (categoryId === 'Numerical Aptitude') {
        return `This evaluates your numerical reasoning, essential for finance or data analysis. Strong skills indicate potential in quantitative fields.`;
      } else if (categoryId === 'Verbal Aptitude') {
        return `This assesses language comprehension for communications or teaching. High verbal skills support success in language-driven careers.`;
      } else if (categoryId === 'Technical Skills') {
        return `This measures technical competency for IT or engineering roles. Strong skills are valuable across tech-driven industries.`;
      }
    } else if (layerId === 'layer4') {
      return `This examines how your background shapes career opportunities. Responses identify advantages and challenges for personalized career planning.`;
    } else if (layerId === 'layer5') {
      return `This explores your interests and values for career alignment. Matching roles to what matters to you ensures long-term satisfaction.`;
    } else if (layerId === 'layer6') {
      return `This encourages self-reflection to create a personalized career plan. Thoughtful responses integrate your strengths and aspirations.`;
    }

    if (lowerText.includes('enjoy') || lowerText.includes('like')) {
      return `This explores your preferences to identify engaging career paths. Responses ensure recommendations align with your intrinsic motivations.`;
    } else if (lowerText.includes('good at') || lowerText.includes('ability')) {
      return `This assesses your strengths to match you with suitable roles. Honest answers highlight talents and growth areas.`;
    } else if (lowerText.includes('environment') || lowerText.includes('setting')) {
      return `This examines your ideal work environment for career fit. Responses guide recommendations for supportive company cultures.`;
    }

    return `This assesses a key aspect of your career profile. Honest responses ensure personalized career recommendations.`;
  }

  async suggestAnswer(
    question: Question,
    layerId: string,
    categoryId: string,
    userScores: Record<string, number> = {},
    careers: string[] = [],
    previousAssessments?: any[]
  ): Promise<AIServiceResponse> {
    const cacheKey = `suggest-${layerId}-${categoryId}-${question.text.substring(0, 50)}-${JSON.stringify(userScores)}-${careers.join(',')}-${previousAssessments?.length || 0}`;
    if (this.responseCache.has(cacheKey)) return this.responseCache.get(cacheKey);

    try {
      const topStrengths = Object.entries(userScores)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category]) => category);

      const prompt = `[INST] You are an expert career counselor helping someone with their career assessment. 

      User Profile:
      - Top Strengths: ${topStrengths.join(', ') || 'Not yet determined'}
      - Recommended Careers: ${careers.slice(0, 3).join(', ') || 'Being determined'}
      - Assessment Layer: ${layerId}
      - Category: ${categoryId}
      ${previousAssessments && previousAssessments.length > 0 ? `- Previous Assessments: ${previousAssessments.length} completed` : ''}

      Question: "${question.text}"

      Provide exactly 3 distinct suggestions for answering this question. Each suggestion should be 80-100 words and personalized based on the user's profile. Format as:

      SUGGESTION 1: [80-100 word suggestion]

      SUGGESTION 2: [80-100 word suggestion]  

      SUGGESTION 3: [80-100 word suggestion]

      Make each suggestion unique, actionable, and relevant to their strengths and career interests. [/INST]`;

      const aiResponse = await invokeHuggingFaceFunction(prompt);
      if (aiResponse && aiResponse.length > 100) {
        const suggestions = this.parseAISuggestions(aiResponse);
        if (suggestions.length >= 3) {
          const response: AIServiceResponse = {
            suggestions,
            explanation: `These suggestions are personalized based on your strengths in ${topStrengths.slice(0, 2).join(' and ') || 'key areas'} and your interest in ${careers.slice(0, 2).join(' and ') || 'your chosen career paths'}.`
          };
          this.responseCache.set(cacheKey, response);
          return response;
        }
      }
    } catch (error) {
      console.error('Hugging Face API failed for suggestions:', error);
    }

    const suggestions = this.generateLocalSuggestions(question.text, layerId, categoryId, userScores, careers, previousAssessments);
    const response: AIServiceResponse = {
      suggestions,
      explanation: `These suggestions are personalized based on your assessment profile and career interests.`
    };
    this.responseCache.set(cacheKey, response);
    return response;
  }

  private parseAISuggestions(aiResponse: string): string[] {
    const suggestions: string[] = [];
    const lines = aiResponse.split('\n');
    let currentSuggestion = '';
    
    for (const line of lines) {
      if (line.match(/SUGGESTION \d+:/)) {
        if (currentSuggestion.trim()) suggestions.push(currentSuggestion.trim());
        currentSuggestion = line.replace(/SUGGESTION \d+:\s*/, '');
      } else if (currentSuggestion && line.trim()) {
        currentSuggestion += ' ' + line.trim();
      }
    }
    
    if (currentSuggestion.trim()) suggestions.push(currentSuggestion.trim());
    return suggestions.filter(s => s.length > 50);
  }

  private generateLocalSuggestions(
    questionText: string,
    layerId: string,
    categoryId: string,
    userScores: Record<string, number>,
    careers: string[],
    previousAssessments?: any[]
  ): string[] {
    const topStrengths = Object.entries(userScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([category]) => category);

    const suggestions: string[] = [];
    
    if (questionText.toLowerCase().includes('activities') || questionText.toLowerCase().includes('enjoy')) {
      suggestions.push(
        `Based on your ${topStrengths[0] || 'analytical'} strengths, consider activities combining problem-solving with creativity. For example, in ${careers[0] || 'technology'}, build personal projects or join hackathons to showcase skills. These align with your abilities and build a portfolio for employers. Focus on engaging tasks for deeper learning.`
      );
      suggestions.push(
        `Your ${topStrengths[1] || 'communication'} abilities suggest thriving in collaborative settings. Join professional associations or industry meetups related to ${careers[0] || 'your field'}. These provide networking and real-world skill application. Mentoring or leading teams can further enhance your expertise.`
      );
      suggestions.push(
        `Given your interest in ${careers.slice(0, 2).join(' and ') || 'your field'}, explore cross-disciplinary projects or courses. Freelance work or consulting in ${careers[0] || 'your area'} can develop versatility. These activities bridge your skills with new domains for career growth.`
      );
    } else if (questionText.toLowerCase().includes('environment') || questionText.toLowerCase().includes('thrive')) {
      suggestions.push(
        `Your ${topStrengths[0]?.includes('Inter') ? 'collaborative skills' : 'structured approach'} suits environments with regular feedback and skill development. Seek companies valuing ${topStrengths[0]?.includes('Creative') ? 'innovation' : 'analysis'} to excel in ${careers[0] || 'your field'}.`
      );
      suggestions.push(
        `You’d thrive in balanced environments offering autonomy and collaboration. Look for workplaces with flexible arrangements and data-driven decisions, aligning with your ${topStrengths[1] || 'analytical'} skills and ${careers[0] || 'career goals'}.`
      );
      suggestions.push(
        `Dynamic workplaces with mentorship and learning cultures suit your ${careers[0] || 'interests'}. Seek roles offering variety and growth to leverage your ${topStrengths.join(' and ') || 'skills'} for long-term success.`
      );
    } else {
      suggestions.push(
        `Reflect on your ${topStrengths[0] || 'core'} strengths to answer authentically. Use examples from your experiences showing skills relevant to ${careers[0] || 'your goals'} for personalized career recommendations.`
      );
      suggestions.push(
        `Frame your response around experiences showcasing skills for ${careers[0] || 'your field'}. Highlight moments of engagement to reveal ideal work environments and role preferences.`
      );
      suggestions.push(
        `Your ${topStrengths.join(' and ') || 'skills'} suggest potential in ${careers[0] || 'your field'}. Provide specific examples of success to ensure accurate, tailored career recommendations.`
      );
    }

    if (previousAssessments && previousAssessments.length > 0) {
      suggestions[0] += ` Building on past assessments, reflect on how your perspective has evolved.`;
    }

    return suggestions;
  }

  async chatResponse(
    message: string,
    history: ChatMessage[],
    userResults?: { scores: Record<string, number>; careers: string[] }
  ): Promise<string> {
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

    return invokeHuggingFaceFunction(prompt);
  }

  clearCache(): void {
    this.responseCache.clear();
  }
}

export const aiService = new AIService();

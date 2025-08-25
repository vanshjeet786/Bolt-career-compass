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

// Helper function to invoke the Supabase Edge Function
async function invokeHuggingFaceFunction(prompt: string) {
  const { data, error } = await supabase.functions.invoke('huggingFaceApiKey', {
    body: { prompt },
  });

  if (error) {
    throw new Error(`Supabase function invocation failed: ${error.message}`);
  }

  // The Edge Function returns the direct JSON from Hugging Face
  if (data && Array.isArray(data) && data[0] && data[0].generated_text) {
    return data[0].generated_text.trim();
  }

  throw new Error('Invalid response from AI service function.');
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

  async explainQuestion(question: Question): Promise<string> {
    const prompt = `[INST] You are an expert career assessment designer. In a friendly and helpful tone, briefly explain the purpose of the following assessment question and what it is trying to measure. Keep the explanation to about 2-3 sentences.

Question: "${question.text}" [/INST]`;
    return invokeHuggingFaceFunction(prompt);
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
    userScores: Record<string, number> = {},
    careers: string[] = []
  ): Promise<AIServiceResponse> {
    const prompt = `[INST] You are an expert career counselor providing suggestions for an open-ended assessment question.
Your response MUST be a valid JSON object.

**User Profile:**
- Top Recommended Careers: ${careers.join(', ') || 'N/A'}
- Strengths (Scores): ${JSON.stringify(userScores, null, 2) || 'N/A'}

**Assessment Question:**
"${question.text}"

**Your Task:**
1.  Generate 3 distinct, personalized, and encouraging suggestions (80-100 words each) for how the user could answer this question.
2.  Generate a brief explanation (20-30 words) of the reasoning behind these suggestions.
3.  Format your entire response as a single JSON object with two keys: "suggestions" (an array of 3 strings) and "explanation" (a single string).

Do not include any text outside of the JSON object.
[/INST]`;

    const jsonResponse = await invokeHuggingFaceFunction(prompt);

    try {
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON object found in the AI response.");
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions) && typeof parsed.explanation === 'string') {
        return parsed;
      }
      throw new Error("Parsed JSON does not match the expected format.");
    } catch (error) {
      console.error("Failed to parse AI suggestion response:", error);
      return {
        suggestions: ["I'm having a little trouble thinking of suggestions right now. Please try again in a moment."],
        explanation: "There was an issue generating a dynamic response."
      };
    }
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

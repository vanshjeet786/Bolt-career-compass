import { ChatMessage, Question } from '../types';

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

class AIService {
  private responseCache = new Map<string, any>();
  
  async generateCareerRecommendations(
    scores: Record<string, number>,
    responses: any[],
    previousAssessments?: any[]
  ): Promise<string> {
    const cacheKey = `career-rec-${JSON.stringify(scores)}-${previousAssessments?.length || 0}`;
    
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    // Simulate AI analysis with learning from previous assessments
    const topCategories = Object.entries(scores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);

    let insights = `Based on your comprehensive assessment, you demonstrate exceptional strengths in ${topCategories.join(', ')}. `;

    // Learning from previous assessments
    if (previousAssessments && previousAssessments.length > 0) {
      const previousScores = previousAssessments[previousAssessments.length - 1]?.scores || {};
      const improvements = this.analyzeProgress(previousScores, scores);
      
      if (improvements.length > 0) {
        insights += `\n\nSince your last assessment, I've noticed significant growth in: ${improvements.join(', ')}. This progression suggests you're actively developing your skills and expanding your capabilities. `;
      }
    }

    insights += `\n\nYour unique combination of strengths positions you well for careers that require ${this.getStrengthDescriptions(topCategories)}. `;
    
    insights += `The recommended career paths align with your natural abilities and show strong potential for both personal satisfaction and professional growth. `;
    
    insights += `Consider focusing on opportunities that leverage your top strengths while also challenging you to grow in complementary areas.`;

    // Add personalized action items
    insights += `\n\nImmediate next steps: 1) Research the daily responsibilities in your top recommended careers, 2) Connect with professionals in these fields through LinkedIn or industry events, 3) Identify 2-3 key skills to develop that appear across multiple recommended paths.`;

    this.responseCache.set(cacheKey, insights);
    return insights;
  }

  private analyzeProgress(previousScores: Record<string, number>, currentScores: Record<string, number>): string[] {
    const improvements: string[] = [];
    
    Object.entries(currentScores).forEach(([category, currentScore]) => {
      const previousScore = previousScores[category];
      if (previousScore && currentScore > previousScore + 0.3) {
        improvements.push(category);
      }
    });
    
    return improvements;
  }

  private getStrengthDescriptions(categories: string[]): string {
    const descriptions: Record<string, string> = {
      'Linguistic': 'strong communication, writing, and verbal expression',
      'Logical-Mathematical': 'analytical thinking, problem-solving, and quantitative analysis',
      'Visual-Spatial': 'creative design, spatial reasoning, and visual communication',
      'Interpersonal': 'team collaboration, leadership, and relationship building',
      'Intrapersonal': 'self-awareness, independent work, and strategic thinking',
      'Naturalistic': 'environmental awareness, systematic observation, and pattern recognition',
      'Numerical Aptitude': 'data analysis, financial modeling, and quantitative reasoning',
      'Verbal Aptitude': 'communication excellence, content creation, and linguistic precision',
      'Technical Skills': 'technology proficiency, system thinking, and digital innovation'
    };
    
    return categories.map(cat => descriptions[cat] || 'specialized expertise').join(', ');
  }

  async explainQuestion(question: Question): Promise<string> {
    const prompt = `[INST] You are an expert career assessment designer. In a friendly and helpful tone, briefly explain the purpose of the following assessment question and what it is trying to measure. Keep the explanation to about 2-3 sentences.

Question: "${question.text}" [/INST]`;

    // We don't cache this response as it's a direct, dynamic AI call.
    return this.callHuggingFaceApi(prompt);
  }

  async suggestAnswer(
    question: Question,
    userScores: Record<string, number> = {},
    careers: string[] = [],
    previousAssessments?: any[]
  ): Promise<AIServiceResponse> {
    const prompt = `[INST] You are an expert career counselor providing suggestions for an open-ended assessment question.
Your response MUST be a valid JSON object.

**User Profile:**
- Top Recommended Careers: ${careers.join(', ') || 'N/A'}
- Strengths (Scores): ${JSON.stringify(userScores, null, 2) || 'N/A'}

**Assessment Question:**
"${question.text}"

**Your Task:**
1.  Generate 3 distinct, personalized, and encouraging suggestions (80-100 words each) for how the user could answer this question. The suggestions should be based on the user's profile.
2.  Generate a brief explanation (20-30 words) of the reasoning behind these suggestions.
3.  Format your entire response as a single JSON object with two keys: "suggestions" (an array of 3 strings) and "explanation" (a single string).

Do not include any text outside of the JSON object.
[/INST]`;

    const jsonResponse = await this.callHuggingFaceApi(prompt);

    try {
      // The API might return the JSON string wrapped in backticks or other text, so we need to find the JSON object.
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON object found in the AI response.");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions) && typeof parsed.explanation === 'string') {
        return parsed;
      }
      throw new Error("Parsed JSON does not match the expected format.");
    } catch (error) {
      console.error("Failed to parse AI suggestion response:", error);
      // Fallback response
      return {
        suggestions: ["I'm having a little trouble thinking of suggestions right now. Could you try rephrasing your question or asking again in a moment?"],
        explanation: "There was an issue generating a dynamic response."
      };
    }
  }

  private async callHuggingFaceApi(prompt: string): Promise<string> {
    const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
    const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;

    if (!apiToken || apiToken === "YOUR_HUGGINGFACE_API_TOKEN_HERE") {
      console.error("Hugging Face API token is not set. Please add it to your .env.local file.");
      return "It looks like the AI service isn't configured correctly. Please ensure your Hugging Face API token is set up to continue.";
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Hugging Face API Error:", response.status, errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const results = await response.json();
      if (results && Array.isArray(results) && results[0] && results[0].generated_text) {
        return results[0].generated_text.trim();
      } else {
        console.error("Unexpected response format from Hugging Face API:", results);
        throw new Error("Failed to parse response from AI service.");
      }
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      throw error;
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

    return this.callHuggingFaceApi(prompt);
  }

  clearCache(): void {
    this.responseCache.clear();
  }
}

export const aiService = new AIService();
import { ChatMessage } from '../types';

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

  async explainQuestion(questionText: string, layerId: string, categoryId: string): Promise<string> {
    // Create unique cache key for each question
    const cacheKey = `explain-${layerId}-${categoryId}-${questionText.substring(0, 50)}`;
    
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    // Try Hugging Face API first, fallback to local explanations
    try {
      const prompt = `[INST] You are an expert career counselor. Explain this assessment question in 2-3 sentences: "${questionText}"

      Explain:
      1. What this question is trying to assess
      2. Why this is important for career guidance
      3. How responses help determine career fit

      Keep it concise and helpful for someone taking a career assessment. [/INST]`;

      const aiExplanation = await this.callHuggingFaceApi(prompt);
      if (aiExplanation && aiExplanation.length > 20) {
        this.responseCache.set(cacheKey, aiExplanation);
        return aiExplanation;
      }
    } catch (error) {
      console.error('Hugging Face API failed for explanation:', error);
    }

    // Fallback to detailed local explanations based on question content and layer
    let explanation = this.generateLocalExplanation(questionText, layerId, categoryId);
    
    this.responseCache.set(cacheKey, explanation);
    return explanation;
  }

  private generateLocalExplanation(questionText: string, layerId: string, categoryId: string): string {
    const lowerText = questionText.toLowerCase();
    
    // Layer-specific explanations
    if (layerId === 'layer1') { // Multiple Intelligences
      if (categoryId === 'Linguistic') {
        return `This question assesses your linguistic intelligence - your natural ability to use words effectively in speaking and writing. Strong linguistic intelligence often leads to success in careers like journalism, teaching, law, or content creation where clear communication is essential.`;
      } else if (categoryId === 'Logical-Mathematical') {
        return `This evaluates your logical-mathematical intelligence - your capacity for logical reasoning, problem-solving, and working with numbers. High scores typically indicate potential for careers in data science, engineering, finance, or research where analytical thinking is crucial.`;
      } else if (categoryId === 'Visual-Spatial') {
        return `This measures your visual-spatial intelligence - your ability to think in three dimensions and visualize concepts. Strong visual-spatial skills often translate to success in design, architecture, engineering, or any field requiring spatial reasoning and creative visualization.`;
      } else if (categoryId === 'Interpersonal') {
        return `This assesses your interpersonal intelligence - your ability to understand and work effectively with others. High interpersonal intelligence often leads to success in management, counseling, sales, or any role requiring strong people skills and emotional awareness.`;
      } else if (categoryId === 'Intrapersonal') {
        return `This evaluates your intrapersonal intelligence - your capacity for self-awareness and self-reflection. Strong intrapersonal skills often indicate potential for entrepreneurship, research, consulting, or roles requiring independent decision-making and self-direction.`;
      } else if (categoryId === 'Naturalistic') {
        return `This measures your naturalistic intelligence - your ability to recognize patterns in nature and understand living systems. High naturalistic intelligence often translates to careers in environmental science, biology, agriculture, or conservation work.`;
      }
    } else if (layerId === 'layer2') { // Personality Traits
      if (categoryId === 'MBTI') {
        return `This question explores your personality preferences using the Myers-Briggs framework. Understanding whether you're more introverted or extraverted, detail-focused or big-picture oriented helps identify work environments and roles where you'll naturally thrive and feel energized.`;
      } else if (categoryId.includes('Big Five')) {
        return `This assesses one of the Big Five personality dimensions, which are scientifically validated predictors of workplace behavior and career satisfaction. Your response helps identify roles and environments that align with your natural personality tendencies.`;
      }
    } else if (layerId === 'layer3') { // Aptitudes & Skills
      if (categoryId === 'Numerical Aptitude') {
        return `This evaluates your comfort and ability with numerical concepts and quantitative reasoning. Strong numerical aptitude is essential for careers in finance, accounting, data analysis, and any field requiring mathematical problem-solving skills.`;
      } else if (categoryId === 'Verbal Aptitude') {
        return `This assesses your verbal reasoning and language comprehension abilities. High verbal aptitude often indicates potential for success in communications, writing, teaching, law, or any career requiring strong language and reasoning skills.`;
      } else if (categoryId === 'Technical Skills') {
        return `This measures your technical competency and ability to work with tools, systems, or technology. Strong technical skills are increasingly valuable across industries and often lead to specialized roles in IT, engineering, or technical support.`;
      }
    } else if (layerId === 'layer4') { // Background & Environment
      return `This question examines how your educational and social environment has shaped your opportunities and perspectives. Understanding your background helps identify potential advantages, challenges, and resources that may influence your career path and development strategies.`;
    } else if (layerId === 'layer5') { // Interests & Values
      return `This explores your intrinsic motivations, interests, and core values. Aligning your career with your genuine interests and values is crucial for long-term satisfaction and success. This helps ensure recommended paths resonate with what truly matters to you.`;
    } else if (layerId === 'layer6') { // Self-Reflection & Synthesis
      return `This open-ended question encourages deep self-reflection and synthesis of your assessment insights. Your thoughtful response helps create a more personalized and actionable career plan that integrates all aspects of your profile and aspirations.`;
    }

    // Generic fallback based on question content
    if (lowerText.includes('enjoy') || lowerText.includes('like')) {
      return `This question explores your natural preferences and interests. Understanding what activities genuinely engage you helps identify career paths where you'll find intrinsic motivation and satisfaction, leading to better performance and fulfillment.`;
    } else if (lowerText.includes('good at') || lowerText.includes('ability')) {
      return `This assesses your self-perceived strengths and capabilities. Honest self-evaluation of your abilities helps match you with roles that leverage your natural talents while identifying areas for potential skill development.`;
    } else if (lowerText.includes('environment') || lowerText.includes('setting')) {
      return `This examines your preferred work environment and conditions. Understanding the settings where you thrive helps identify company cultures, team structures, and work arrangements that will support your success and well-being.`;
    }

    return `This question helps assess an important aspect of your career profile. Your honest response contributes to creating personalized recommendations that align with your unique strengths, interests, and goals for long-term career satisfaction.`;
  }

  async suggestAnswer(
    questionText: string, 
    layerId: string,
    categoryId: string,
    userScores: Record<string, number> = {}, 
    careers: string[] = [],
    previousAssessments?: any[]
  ): Promise<AIServiceResponse> {
    // Create unique cache key for each question
    const cacheKey = `suggest-${layerId}-${categoryId}-${questionText.substring(0, 50)}-${JSON.stringify(userScores)}-${careers.join(',')}-${previousAssessments?.length || 0}`;
    
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    // Try Hugging Face API first
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

      Question: "${questionText}"

      Provide exactly 3 distinct suggestions for answering this question. Each suggestion should be 80-100 words and personalized based on the user's profile. Format as:

      SUGGESTION 1: [80-100 word suggestion]

      SUGGESTION 2: [80-100 word suggestion]  

      SUGGESTION 3: [80-100 word suggestion]

      Make each suggestion unique, actionable, and relevant to their strengths and career interests. [/INST]`;

      const aiResponse = await this.callHuggingFaceApi(prompt);
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

    // Fallback to local suggestions
    const suggestions = this.generateLocalSuggestions(questionText, layerId, categoryId, userScores, careers, previousAssessments);
    
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
        if (currentSuggestion.trim()) {
          suggestions.push(currentSuggestion.trim());
        }
        currentSuggestion = line.replace(/SUGGESTION \d+:\s*/, '');
      } else if (currentSuggestion && line.trim()) {
        currentSuggestion += ' ' + line.trim();
      }
    }
    
    if (currentSuggestion.trim()) {
      suggestions.push(currentSuggestion.trim());
    }
    
    return suggestions.filter(s => s.length > 50); // Ensure substantial suggestions
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
    
    // Generate 3 distinct suggestions based on question type and user profile
    if (questionText.toLowerCase().includes('activities') || questionText.toLowerCase().includes('enjoy')) {
      suggestions.push(
        `Based on your ${topStrengths[0] || 'analytical'} strengths, consider activities that combine problem-solving with creativity. For example, if you're drawn to ${careers[0] || 'technology'}, you might enjoy building personal projects, participating in hackathons, or contributing to open-source initiatives. These activities not only align with your natural abilities but also build a portfolio that demonstrates your skills to potential employers. The key is finding activities that feel engaging rather than forced, as genuine interest leads to deeper learning and better outcomes.`
      );
      
      suggestions.push(
        `Your profile suggests you'd thrive in collaborative environments that leverage your ${topStrengths[1] || 'communication'} abilities. Consider joining professional associations, attending industry meetups, or participating in volunteer projects related to your career interests. These activities provide networking opportunities while allowing you to apply your skills in real-world contexts. Look for activities that combine learning with contribution – mentoring others, leading project teams, or organizing community events. This approach builds both your expertise and your professional network simultaneously.`
      );
      
      suggestions.push(
        `Given your career interests in ${careers.slice(0, 2).join(' and ') || 'your chosen field'}, focus on activities that bridge multiple disciplines. Cross-functional projects, interdisciplinary courses, or roles that combine technical skills with business acumen can be particularly valuable. Consider activities like consulting for small businesses, freelance projects that stretch your abilities, or research that applies your skills to new domains. This approach helps you develop versatility and adaptability – qualities highly valued in today's dynamic job market.`
      );
    } else if (questionText.toLowerCase().includes('environment') || questionText.toLowerCase().includes('thrive')) {
      suggestions.push(
        `Your assessment indicates you perform best in environments that offer ${topStrengths[0]?.includes('Inter') ? 'collaborative interaction and team-based problem solving' : 'structured challenges and clear objectives'}. Look for workplaces that provide regular feedback, opportunities for skill development, and projects that align with your natural strengths. Consider company cultures that value ${topStrengths[0]?.includes('Creative') ? 'innovation and creative expression' : 'analytical thinking and systematic approaches'}. The ideal environment should challenge you while providing the support and resources needed to excel.`
      );
      
      suggestions.push(
        `Based on your profile, you'd likely thrive in environments that balance autonomy with collaboration. Seek workplaces that offer flexible work arrangements, diverse project opportunities, and clear career progression paths. Your ${topStrengths[1] || 'analytical'} abilities suggest you'd appreciate environments with data-driven decision making and merit-based advancement. Look for organizations that invest in employee development, encourage continuous learning, and provide opportunities to work on meaningful projects that align with your values and career goals.`
      );
      
      suggestions.push(
        `Consider environments that offer variety and growth potential, particularly in ${careers[0] || 'your field of interest'}. Dynamic workplaces that encourage cross-functional collaboration, provide mentorship opportunities, and support professional development align well with your profile. Look for organizations with strong learning cultures, where you can both contribute your expertise and continue developing new skills. The best environments will challenge you appropriately while providing the resources and support needed to achieve your career objectives.`
      );
    } else {
      // Generic suggestions for other question types
      suggestions.push(
        `Reflecting on your ${topStrengths[0] || 'core'} strengths, consider how this question relates to your natural abilities and career aspirations. Your response should authentically represent your experiences and preferences while considering how they align with your professional goals. Think about specific examples from your academic, work, or personal experiences that demonstrate your capabilities in this area. Honest self-reflection here will help ensure your career recommendations are truly aligned with your authentic self and long-term satisfaction.`
      );
      
      suggestions.push(
        `Given your interest in ${careers[0] || 'your chosen field'}, frame your response around experiences that showcase relevant skills and mindsets. Consider how your natural tendencies and developed abilities contribute to success in your target career areas. Your answer should reflect both your current capabilities and your potential for growth. Think about moments when you felt most engaged and effective – these often reveal important insights about your ideal work environment and role preferences.`
      );
      
      suggestions.push(
        `Your assessment profile suggests you have strong potential in areas requiring ${topStrengths.join(' and ') || 'analytical and creative thinking'}. When responding, consider how your unique combination of strengths might apply to this question. Think about experiences where you've successfully navigated similar situations or demonstrated related capabilities. Your response should be specific and genuine, as this helps create a more accurate and useful career profile tailored to your individual strengths and aspirations.`
      );
    }

    // Add learning from previous assessments
    if (previousAssessments && previousAssessments.length > 0) {
      suggestions[0] += ` Building on your previous assessment insights, you might also consider how your perspective on this has evolved since your last evaluation.`;
    }

    return suggestions;
  }

  private async callHuggingFaceApi(prompt: string): Promise<string> {
    const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
    const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;

    if (!apiToken || apiToken === "YOUR_HUGGINGFACE_API_TOKEN_HERE") {
      console.error("Hugging Face API token is not set. Please add it to your .env file.");
      throw new Error("Hugging Face API token not configured");
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
            max_new_tokens: 400,
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
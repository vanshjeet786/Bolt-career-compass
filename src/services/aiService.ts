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

  async explainQuestion(questionText: string): Promise<string> {
    const cacheKey = `explain-${questionText}`;
    
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    // Generate contextual explanations
    const explanations: Record<string, string> = {
      'writing': 'This question assesses your linguistic intelligence and communication preferences. Strong writers often excel in careers requiring clear expression of complex ideas, such as journalism, content marketing, technical writing, or academic research.',
      'logical': 'This evaluates your logical-mathematical intelligence. High scorers typically thrive in analytical roles like data science, engineering, finance, or research where systematic problem-solving is essential.',
      'team': 'This measures your interpersonal intelligence and collaboration style. Strong team players often succeed in management, human resources, consulting, or any role requiring stakeholder coordination.',
      'independent': 'This assesses your intrapersonal intelligence and self-direction capabilities. High scorers often excel as entrepreneurs, researchers, consultants, or in roles requiring autonomous decision-making.',
      'visual': 'This evaluates your visual-spatial intelligence. Strong visual thinkers typically succeed in design, architecture, engineering, or fields requiring spatial reasoning and creative visualization.',
      'nature': 'This measures your naturalistic intelligence and environmental awareness. High scorers often thrive in environmental science, agriculture, conservation, or sustainability-focused careers.'
    };

    // Find relevant explanation based on question content
    let explanation = 'This question helps assess your natural preferences and strengths in this particular area. ';
    
    for (const [key, desc] of Object.entries(explanations)) {
      if (questionText.toLowerCase().includes(key)) {
        explanation = desc;
        break;
      }
    }
    
    explanation += ' Your honest response helps create a more accurate career profile tailored to your unique strengths and interests.';

    this.responseCache.set(cacheKey, explanation);
    return explanation;
  }

  async suggestAnswer(
    questionText: string, 
    userScores: Record<string, number> = {}, 
    careers: string[] = [],
    previousAssessments?: any[]
  ): Promise<AIServiceResponse> {
    const cacheKey = `suggest-${questionText}-${JSON.stringify(userScores)}-${careers.join(',')}-${previousAssessments?.length || 0}`;
    
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey);
    }

    // Analyze user profile for personalization
    const topStrengths = Object.entries(userScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([category]) => category);

    const suggestions: string[] = [];
    
    // Generate 3 distinct, personalized suggestions
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
      const lastAssessment = previousAssessments[previousAssessments.length - 1];
      const relevantResponse = lastAssessment.responses?.find((r: any) => 
        r.questionText.toLowerCase().includes(questionText.toLowerCase().split(' ')[0])
      );
      
      if (relevantResponse) {
        suggestions[0] += ` Building on your previous assessment insights, you might also consider how your perspective on this has evolved since your last evaluation.`;
      }
    }

    const response: AIServiceResponse = {
      suggestions,
      explanation: `These suggestions are personalized based on your assessment profile, particularly your strengths in ${topStrengths.join(' and ') || 'key areas'} and your interest in ${careers.slice(0, 2).join(' and ') || 'your chosen career paths'}.`
    };

    this.responseCache.set(cacheKey, response);
    return response;
  }

  async chatResponse(
    message: string, 
    userResults?: { scores: Record<string, number>; careers: string[]; previousAssessments?: any[] }
  ): Promise<string> {
    const cacheKey = `chat-${message}-${JSON.stringify(userResults?.scores)}-${Date.now()}`;
    
    // Simulate AI chat with learning capabilities
    const responses = [
      `Based on your assessment results showing strengths in ${Object.keys(userResults?.scores || {}).slice(0, 2).join(' and ')}, I'd recommend focusing on opportunities that leverage these abilities. ${userResults?.previousAssessments?.length ? 'I notice you\'ve taken assessments before - your growth in key areas is impressive!' : ''} What specific aspect of your career path would you like to explore further?`,
      
      `Your career recommendations in ${userResults?.careers?.slice(0, 2).join(' and ') || 'your field'} align well with current market trends. ${userResults?.previousAssessments?.length ? 'Comparing to your previous results, you\'ve shown consistent growth in your core competencies.' : ''} I can help you understand the day-to-day responsibilities, required skills, or growth opportunities in these areas. What interests you most?`,
      
      `That's a great question! Given your profile, I'd suggest considering how your unique combination of strengths can create value in your chosen field. ${userResults?.previousAssessments?.length ? 'Your assessment history shows you\'re actively developing your capabilities, which is excellent for career growth.' : ''} Would you like me to elaborate on specific career paths or discuss strategies for skill development?`,
      
      `I understand your concern. Career decisions can feel overwhelming, but your assessment results provide a solid foundation for decision-making. Your strengths in ${Object.entries(userResults?.scores || {}).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 1).map(([cat]) => cat)[0] || 'key areas'} suggest you have strong potential for success. ${userResults?.previousAssessments?.length ? 'Your progress since previous assessments shows you\'re on a positive trajectory.' : ''} What specific aspects of your career journey feel most uncertain right now?`
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    this.responseCache.set(cacheKey, response);
    return response;
  }

  clearCache(): void {
    this.responseCache.clear();
  }
}

export const aiService = new AIService();
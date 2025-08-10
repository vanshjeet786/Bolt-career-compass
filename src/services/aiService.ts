// Simulated AI service - In production, this would connect to OpenAI or similar
export class AIService {
  private readonly basePrompts = {
    counselor: "You are a friendly, supportive AI career counselor. Provide encouraging, practical advice in a conversational tone.",
    explainer: "You are helping explain career assessment questions. Be clear and helpful.",
    suggester: "You are providing personalized suggestions based on assessment results. Be specific and actionable."
  };

  async explainQuestion(question: string): Promise<string> {
    // Simulate AI response with realistic delays
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const explanations: Record<string, string> = {
      "I enjoy writing essays, stories, or journal entries for fun.": 
        "This question assesses your linguistic intelligence - your natural ability and enjoyment with words and language. People high in linguistic intelligence often thrive in careers involving communication, writing, and verbal expression.",
      
      "I analyze data, statistics, or numerical trends to make decisions.":
        "This evaluates your logical-mathematical intelligence and comfort with analytical thinking. Strong scores here suggest potential in STEM fields, finance, research, or data-driven roles.",
      
      "Based on my intelligence strengths, the types of activities I naturally enjoy are:":
        "This reflection question helps you synthesize your assessment results into actionable insights. Think about what activities make you feel energized and come naturally to you - these are clues to your ideal career path.",
      
      "What are 3 things you can do in the next 30 days to explore your top choice(s)?":
        "This question focuses on turning insights into action. Career exploration is most effective when you take small, concrete steps. Consider informational interviews, online research, skill-building activities, or shadowing opportunities."
    };

    return explanations[question] || 
      "This question helps us understand your preferences and natural tendencies, which are important factors in finding a career that fits you well. Consider how this relates to your daily activities and what energizes you.";
  }

  async suggestAnswer(question: string, userScores: Record<string, number>, careers: string[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    const topCategory = Object.entries(userScores).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];
    
    const suggestions: Record<string, string> = {
      "Based on my intelligence strengths, the types of activities I naturally enjoy are:": 
        `Given your high score in ${topCategory}, you might enjoy activities like problem-solving, creative projects, collaborative work, or analytical tasks. Consider what specific aspects of ${topCategory.toLowerCase()} feel most natural to you.`,
      
      "My top 3 career interest areas are:":
        `Based on your results, you might explore: ${careers.slice(0, 3).join(', ')}. These align well with your ${topCategory} strengths and could offer fulfilling career paths.`,
      
      "What are 3 things you can do in the next 30 days to explore your top choice(s)?":
        `Consider these actionable steps: 1) Research ${careers[0] || 'your field of interest'} on LinkedIn and industry websites, 2) Reach out to professionals for informational interviews, 3) Take a relevant online course or attend a webinar in this field.`
    };

    return suggestions[question] || 
      `Based on your ${topCategory} strengths, consider how this question relates to your natural abilities. Think about specific examples from your experience that demonstrate these strengths.`;
  }

  async generateCareerRecommendations(scores: Record<string, number>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const topCategories = Object.entries(scores)
      .filter(([_, score]) => typeof score === 'number')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, score]) => `${category} (${score.toFixed(1)})`);

    return `Based on your assessment results, you show strong aptitudes in ${topCategories.join(', ')}. 

These strengths suggest you'd thrive in careers that involve analytical thinking, creative problem-solving, and meaningful collaboration. Your responses indicate you value both personal growth and making a positive impact through your work.

I'd particularly recommend exploring roles in technology, design, and education, where you can leverage your natural talents while pursuing your values-driven goals.

What aspects of these recommendations resonate most with you? I'm here to help you explore any of these paths further!`;
  }

  async chatResponse(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const responses = [
      "That's a great question! Career exploration is a journey, and it's normal to have concerns about finding the right fit.",
      "I understand your perspective. Many people find it helpful to start with small steps and gradually build confidence in their career direction.",
      "That's an insightful observation. Your self-awareness is actually a strength that will serve you well in your career journey.",
      "I appreciate you sharing that. Let's think about how we can turn this insight into actionable steps.",
      "That's a common concern, and you're not alone in feeling this way. What specific aspect would you like to explore further?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiService = new AIService();
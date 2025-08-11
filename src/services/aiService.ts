// Enhanced AI service with dynamic prompts and better response generation
export class AIService {
  private readonly basePrompts = {
    counselor: "You are a friendly, supportive AI career counselor with expertise in psychology, career development, and various industries. Provide encouraging, practical advice in a conversational tone. Keep responses concise but helpful.",
    explainer: "You are helping explain career assessment questions. Be clear, educational, and help users understand why this question matters for their career development.",
    suggester: "You are providing personalized suggestions based on assessment results. Be specific, actionable, and consider the user's unique profile."
  };

  private generateUniquePrompt(basePrompt: string, context: any): string {
    // Add timestamp and random elements to ensure uniqueness
    const timestamp = Date.now();
    const randomSeed = Math.random().toString(36).substring(7);
    return `${basePrompt}\n\nContext ID: ${timestamp}-${randomSeed}\n${JSON.stringify(context)}`;
  }

  async explainQuestion(question: string): Promise<string> {
    // Simulate AI response with realistic delays and dynamic content
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Create dynamic explanations based on question content and context
    const questionContext = {
      question,
      timestamp: Date.now(),
      analysisType: 'explanation'
    };

    // Analyze question type and generate contextual explanation
    if (question.toLowerCase().includes('writing') || question.toLowerCase().includes('essay')) {
      return this.generateLinguisticExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('data') || question.toLowerCase().includes('statistics')) {
      return this.generateAnalyticalExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('team') || question.toLowerCase().includes('collaborate')) {
      return this.generateInterpersonalExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('reflect') || question.toLowerCase().includes('personal')) {
      return this.generateIntrapersonalExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('visual') || question.toLowerCase().includes('design')) {
      return this.generateSpatialExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('nature') || question.toLowerCase().includes('environment')) {
      return this.generateNaturalisticExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('personality') || question.toLowerCase().includes('prefer')) {
      return this.generatePersonalityExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('skill') || question.toLowerCase().includes('technical')) {
      return this.generateSkillExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('goal') || question.toLowerCase().includes('value')) {
      return this.generateValueExplanation(question, questionContext);
    } else if (question.toLowerCase().includes('based on') || question.toLowerCase().includes('synthesis')) {
      return this.generateSynthesisExplanation(question, questionContext);
    }
    
    // Default dynamic explanation
    return this.generateGenericExplanation(question, questionContext);
  }

  private generateLinguisticExplanation(question: string, context: any): string {
    const variations = [
      `This question evaluates your linguistic intelligence - your natural affinity for language, communication, and verbal expression. People with strong linguistic abilities often excel in careers involving writing, speaking, teaching, or any field requiring clear communication. Your comfort with language-based activities can indicate potential success in journalism, law, education, content creation, or public relations.`,
      
      `This assesses your verbal-linguistic strengths, which are crucial for many professional roles. Strong linguistic intelligence suggests you process information through words and language effectively. This skill is valuable in careers like copywriting, translation, literary analysis, communications, or any role where articulating ideas clearly is essential.`,
      
      `Your response here helps identify linguistic patterns in your thinking. Language-oriented individuals often thrive in environments where they can express ideas, persuade others, or work with written and spoken communication. Consider how this relates to careers in media, publishing, academia, or corporate communications.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateAnalyticalExplanation(question: string, context: any): string {
    const variations = [
      `This question measures your logical-mathematical intelligence and analytical thinking capabilities. People who score highly here often excel in STEM fields, finance, research, data science, or any career requiring systematic problem-solving and quantitative analysis. Your comfort with data and logical reasoning is a strong predictor of success in technical and analytical roles.`,
      
      `This evaluates your aptitude for working with numbers, patterns, and logical systems. Strong analytical skills are highly valued in today's data-driven economy. Consider careers in engineering, computer science, financial analysis, research, or business intelligence where these abilities are essential.`,
      
      `Your response indicates how naturally you approach problems through logical analysis and data interpretation. This cognitive strength opens doors to careers in technology, scientific research, consulting, or any field where evidence-based decision-making is crucial.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateInterpersonalExplanation(question: string, context: any): string {
    const variations = [
      `This question assesses your interpersonal intelligence - your ability to understand, communicate with, and work effectively with others. High interpersonal skills are valuable in leadership roles, human resources, counseling, sales, marketing, or any career involving significant human interaction and relationship building.`,
      
      `This measures your social intelligence and collaborative abilities. People with strong interpersonal skills often succeed in team-oriented environments and people-focused careers. Consider roles in management, social work, customer relations, training and development, or organizational psychology.`,
      
      `Your response here reveals your comfort level with social dynamics and teamwork. Strong interpersonal intelligence is increasingly important in our collaborative work environments and can lead to success in fields like project management, consulting, healthcare, or community relations.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateIntrapersonalExplanation(question: string, context: any): string {
    const variations = [
      `This question evaluates your intrapersonal intelligence - your self-awareness, emotional intelligence, and ability to understand your own motivations and goals. This strength is valuable for independent work, entrepreneurship, counseling, research, or any career requiring self-direction and personal insight.`,
      
      `This assesses your capacity for self-reflection and personal understanding. People with high intrapersonal intelligence often excel in roles requiring autonomy, strategic thinking, or helping others with personal development. Consider careers in consulting, coaching, writing, or independent professional practice.`,
      
      `Your response indicates your level of self-awareness and introspective ability. This intelligence type is crucial for leadership development, personal coaching, therapeutic work, or any career where understanding human motivation and behavior is important.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateSpatialExplanation(question: string, context: any): string {
    const variations = [
      `This question measures your visual-spatial intelligence - your ability to think in images, visualize concepts, and understand spatial relationships. This strength is valuable in design, architecture, engineering, art, navigation, or any field requiring visual thinking and spatial reasoning.`,
      
      `This evaluates your capacity for visual processing and spatial awareness. People with strong visual-spatial skills often excel in creative and technical fields like graphic design, interior design, animation, cartography, or surgical specialties that require precise spatial understanding.`,
      
      `Your response here reveals your comfort with visual information and spatial concepts. This intelligence type is increasingly important in fields involving 3D modeling, user experience design, scientific visualization, or any career where you need to mentally manipulate objects or understand complex visual information.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateNaturalisticExplanation(question: string, context: any): string {
    const variations = [
      `This question assesses your naturalistic intelligence - your ability to recognize patterns in nature, understand environmental systems, and connect with the natural world. This strength is valuable in environmental science, agriculture, conservation, outdoor education, or sustainability-focused careers.`,
      
      `This measures your environmental awareness and ability to observe natural patterns. People with strong naturalistic intelligence often thrive in careers involving environmental protection, biological research, landscape architecture, or any field focused on understanding and preserving natural systems.`,
      
      `Your response indicates your connection to environmental issues and natural systems thinking. This intelligence type is increasingly relevant in our environmentally conscious world and can lead to careers in renewable energy, environmental consulting, wildlife management, or green technology development.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generatePersonalityExplanation(question: string, context: any): string {
    const variations = [
      `This personality assessment question helps identify your preferred work style and environmental preferences. Understanding whether you're more introverted or extraverted, detail-oriented or big-picture focused, helps match you with careers and work environments where you'll naturally thrive and feel energized.`,
      
      `This question explores your personality dimensions, which significantly impact career satisfaction. Your responses help identify whether you prefer structured or flexible environments, individual or team work, and logical or values-based decision-making - all crucial factors in career fit.`,
      
      `Your personality preferences revealed here influence not just what careers might suit you, but also what type of company culture, management style, and work arrangements will help you perform at your best. This self-knowledge is invaluable for long-term career satisfaction.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateSkillExplanation(question: string, context: any): string {
    const variations = [
      `This question evaluates your current skill level and learning capacity in key areas. Your technical and professional skills directly impact which career paths are immediately accessible to you and which might require additional development. This assessment helps identify both strengths to leverage and areas for growth.`,
      
      `This assesses your aptitude and developed competencies, which are crucial for career planning. Understanding your skill profile helps identify roles where you can immediately add value and areas where skill development could open new opportunities. It's about matching your abilities with market demands.`,
      
      `Your response here reveals both your current capabilities and your potential for skill development. In today's rapidly changing job market, the ability to learn and adapt is as important as existing skills. This question helps map your learning trajectory and career development path.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateValueExplanation(question: string, context: any): string {
    const variations = [
      `This question explores your core values and what motivates you professionally. Understanding your values is crucial for long-term career satisfaction - when your work aligns with what you find meaningful, you're more likely to feel fulfilled and perform well. Values misalignment is a common cause of career dissatisfaction.`,
      
      `This assesses what drives and fulfills you in work and life. Your values influence everything from the type of organization you'll thrive in to the specific roles that will energize you. Identifying these helps ensure your career choices support not just financial goals but personal fulfillment.`,
      
      `Your response reveals what you find personally meaningful and important in your career. Values-based career decisions tend to lead to greater job satisfaction, better performance, and more sustainable career paths. This insight helps guide choices that align with your authentic self.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateSynthesisExplanation(question: string, context: any): string {
    const variations = [
      `This synthesis question helps you integrate insights from your assessment into actionable self-knowledge. By reflecting on your results and articulating your understanding, you're developing the self-awareness needed to make informed career decisions. This metacognitive process is crucial for effective career planning.`,
      
      `This question encourages you to synthesize your assessment results into personal insights. The ability to reflect on your strengths, preferences, and goals and translate them into career direction is a key skill for lifelong career management. Your thoughtful response here becomes a foundation for your career strategy.`,
      
      `This reflection question transforms your assessment data into personal wisdom. By articulating how your results connect to your career interests and goals, you're developing the narrative that will guide your career decisions and help you communicate your value to potential employers or collaborators.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  private generateGenericExplanation(question: string, context: any): string {
    const variations = [
      `This question is designed to understand your preferences, abilities, and tendencies in a way that relates to career fit. Your honest response helps create a more accurate picture of your professional profile and identifies careers where you're likely to thrive and find satisfaction.`,
      
      `This assessment item explores an important dimension of your professional personality. By understanding how you naturally approach this area, we can better match you with careers and work environments that align with your authentic self and maximize your potential for success.`,
      
      `Your response to this question contributes to a comprehensive understanding of your career-relevant characteristics. Each question builds toward a complete picture that helps identify not just what you can do, but what you'll enjoy doing and where you'll find meaningful work.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)] + ` (Analysis ID: ${context.timestamp})`;
  }

  async suggestAnswer(question: string, userScores: Record<string, number>, careers: string[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 1000));
    
    const suggestionContext = {
      question,
      userScores,
      careers,
      timestamp: Date.now(),
      analysisType: 'suggestion'
    };

    // Generate dynamic suggestions based on question content and user profile
    const topCategories = Object.entries(userScores)
      .filter(([_, score]) => typeof score === 'number')
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);

    const topCategory = topCategories[0]?.[0] || 'General';
    const topScore = topCategories[0]?.[1] || 0;
    const topCareers = careers.slice(0, 3);

    if (question.toLowerCase().includes('activities') && question.toLowerCase().includes('enjoy')) {
      return this.generateActivitySuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('environment') && question.toLowerCase().includes('thrive')) {
      return this.generateEnvironmentSuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('industries') || question.toLowerCase().includes('roles')) {
      return this.generateIndustrySuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('career interest')) {
      return this.generateCareerInterestSuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('30 days') || question.toLowerCase().includes('explore')) {
      return this.generateActionPlanSuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('skills') || question.toLowerCase().includes('knowledge gaps')) {
      return this.generateSkillGapSuggestion(topCategory, topScore, topCareers, suggestionContext);
    } else if (question.toLowerCase().includes('help') || question.toLowerCase().includes('mentors')) {
      return this.generateNetworkSuggestion(topCategory, topScore, topCareers, suggestionContext);
    }

    return this.generateGenericSuggestion(question, topCategory, topScore, topCareers, suggestionContext);
  }

  private generateActivitySuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Given your strong ${topCategory} abilities (${topScore.toFixed(1)}/5.0), you likely enjoy activities that involve analytical thinking, creative problem-solving, and working with complex information. Consider activities like research projects, data analysis, strategic planning, or creative design work. These align well with careers in ${careers.join(', ')}.`,
      
      `Your ${topCategory} strengths suggest you're energized by activities that challenge your mind and allow you to use your natural talents. Think about times when you've felt most engaged - perhaps when solving puzzles, creating something new, or helping others understand complex concepts. These preferences point toward fulfilling work in fields like ${careers.slice(0, 2).join(' or ')}.`,
      
      `Based on your assessment profile, particularly your ${topCategory} score of ${topScore.toFixed(1)}, you probably find satisfaction in activities that combine intellectual challenge with practical application. Consider what specific aspects of learning, creating, or problem-solving feel most natural to you - this insight will guide you toward careers like ${careers[0]} or related fields.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateEnvironmentSuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Your ${topCategory} strengths (${topScore.toFixed(1)}/5.0) suggest you thrive in environments that are intellectually stimulating, collaborative yet allow for independent thinking, and value innovation and continuous learning. Look for workplaces with strong mentorship, diverse projects, and opportunities for professional growth - qualities common in ${careers.join(', ')} roles.`,
      
      `Given your profile, you likely perform best in environments that balance structure with flexibility, provide access to resources and learning opportunities, and recognize analytical thinking and creative problem-solving. Consider company cultures that emphasize professional development and meaningful work, which are often found in ${careers.slice(0, 2).join(' and ')} fields.`,
      
      `Your assessment results indicate you'd flourish in environments that encourage curiosity, provide challenging projects, and offer opportunities to work with skilled colleagues. Think about workplaces that value both individual contribution and team collaboration - characteristics you'll find in quality ${careers[0]} organizations and similar forward-thinking companies.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateIndustrySuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Based on your ${topCategory} strengths and overall profile, exciting industries for you include technology (especially ${careers.filter(c => c.includes('Software') || c.includes('Data')).join(', ')}), creative services, education and training, and consulting. These sectors value the analytical and creative thinking you've demonstrated in your assessment.`,
      
      `Your results point toward industries experiencing growth and innovation: healthcare technology, sustainable business, digital media, and professional services. Specific roles like ${careers.slice(0, 3).join(', ')} align well with your ${topCategory} abilities and the current job market trends.`,
      
      `Consider exploring industries that combine your ${topCategory} strengths with emerging opportunities: fintech, edtech, environmental consulting, or user experience design. These fields offer roles like ${careers.join(' or ')} where your analytical and creative abilities would be highly valued.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateCareerInterestSuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Your top 3 career interest areas should align with your ${topCategory} strengths: 1) ${careers[0]} - leveraging your analytical abilities, 2) ${careers[1] || 'Creative problem-solving roles'} - utilizing your innovative thinking, 3) ${careers[2] || 'Consulting or advisory positions'} - combining your skills with helping others achieve their goals.`,
      
      `Based on your assessment profile, I'd recommend focusing on: 1) ${careers[0]} or related technical roles that challenge your analytical mind, 2) Project management or strategic planning positions that use your organizational thinking, 3) Training, mentoring, or consulting roles where you can share your expertise and help others grow.`,
      
      `Your ${topCategory} score of ${topScore.toFixed(1)} suggests these career interest areas: 1) ${careers[0]} - directly applying your strongest abilities, 2) Innovation or research roles in your field of interest, 3) Leadership or entrepreneurial opportunities where you can create solutions and guide others.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateActionPlanSuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Here's your 30-day exploration plan: 1) Research ${careers[0]} professionals on LinkedIn and request 2-3 informational interviews, 2) Take a relevant online course or attend a webinar in your field of interest, 3) Join professional associations or online communities related to ${careers.slice(0, 2).join(' or ')} to start building your network and industry knowledge.`,
      
      `Three actionable steps for the next month: 1) Shadow a professional in ${careers[0]} or arrange a workplace visit to see the role in action, 2) Start a small project or volunteer opportunity that uses your ${topCategory} skills, 3) Connect with your school's career services or find a mentor in your area of interest for ongoing guidance.`,
      
      `Your 30-day career exploration roadmap: 1) Conduct market research on ${careers.join(', ')} including salary ranges, required skills, and growth prospects, 2) Identify and begin developing one key skill gap through online learning or practice projects, 3) Attend industry events, webinars, or networking sessions to meet professionals and learn about opportunities.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateSkillGapSuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `To pursue ${careers[0]}, focus on developing: 1) Technical skills specific to the field (research current job postings to identify the most in-demand tools and technologies), 2) Communication skills to effectively present your analytical work, 3) Industry knowledge through professional reading, courses, or certifications relevant to your target career.`,
      
      `Key skill development areas for your career goals: 1) Strengthen your ${topCategory} abilities through advanced coursework or specialized training, 2) Develop complementary soft skills like project management, leadership, or client relations, 3) Gain practical experience through internships, freelance projects, or volunteer work in ${careers.slice(0, 2).join(' or ')}.`,
      
      `Based on your career interests in ${careers.join(', ')}, prioritize: 1) Building a portfolio of work that demonstrates your capabilities, 2) Learning industry-standard software, tools, or methodologies, 3) Developing business acumen and understanding how your role contributes to organizational success.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateNetworkSuggestion(topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Build your support network with: 1) Mentors - seek experienced professionals in ${careers[0]} who can provide career guidance and industry insights, 2) Peers - connect with others exploring similar career paths for mutual support and information sharing, 3) Online communities - join professional groups on LinkedIn, Reddit, or industry-specific platforms related to your interests.`,
      
      `Your career journey support team should include: 1) Industry professionals in ${careers.join(' or ')} who can offer real-world perspectives and potential opportunities, 2) Career counselors or coaches who can help you navigate decisions and develop strategies, 3) Family and friends who understand your goals and can provide encouragement and accountability.`,
      
      `Key people to connect with: 1) Alumni from your school working in ${careers[0]} or related fields - they often provide the most accessible and relevant advice, 2) Professional associations and networking groups in your area of interest, 3) Online mentors through platforms like LinkedIn, industry forums, or professional development programs.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  private generateGenericSuggestion(question: string, topCategory: string, topScore: number, careers: string[], context: any): string {
    const suggestions = [
      `Given your ${topCategory} strengths (${topScore.toFixed(1)}/5.0), consider how this question relates to your natural abilities and career interests in ${careers.join(', ')}. Think about specific examples from your experience that demonstrate these strengths and how they might translate to professional success.`,
      
      `Your assessment profile suggests you have strong potential in ${careers[0]} and related fields. When answering this question, consider how your ${topCategory} abilities and personal values align with your career goals. What specific aspects of your experience or interests support this direction?`,
      
      `Based on your results, particularly your ${topCategory} score, reflect on how this question connects to your career aspirations. Consider concrete examples from your academic, work, or personal experience that illustrate your capabilities and interests in areas like ${careers.slice(0, 2).join(' or ')}.`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)] + ` (Suggestion ID: ${context.timestamp})`;
  }

  async generateCareerRecommendations(scores: Record<string, number>, responses?: any[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    const analysisContext = {
      scores,
      responses: responses?.length || 0,
      timestamp: Date.now(),
      analysisType: 'career_recommendations'
    };
    
    const topCategories = Object.entries(scores)
      .filter(([_, score]) => typeof score === 'number')
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 4);

    const recommendations = [
      `Your assessment reveals a unique professional profile with standout strengths in ${topCategories.map(([cat, score]) => `${cat} (${(score as number).toFixed(1)}/5.0)`).join(', ')}. This combination suggests you'd excel in roles that blend analytical thinking with creative problem-solving and meaningful collaboration.

Your responses indicate you value both intellectual challenge and positive impact, making you well-suited for careers in technology, design, consulting, or education where you can leverage your natural talents while pursuing purpose-driven work.

I particularly recommend exploring ${topCategories[0][0].toLowerCase()}-focused roles, as your ${(topCategories[0][1] as number).toFixed(1)} score indicates exceptional potential in this area. What aspects of these recommendations align most closely with your career aspirations?`,

      `Based on your comprehensive assessment, you demonstrate remarkable strengths across ${topCategories.length} key areas, with ${topCategories[0][0]} being your standout capability at ${(topCategories[0][1] as number).toFixed(1)}/5.0. This profile suggests you're naturally suited for roles requiring both analytical rigor and creative innovation.

Your pattern of responses indicates you thrive when combining technical skills with human-centered problem solving. This makes you an excellent candidate for emerging fields that bridge technology and human needs, such as user experience design, data science with social impact, or educational technology.

The convergence of your ${topCategories.slice(0, 2).map(([cat]) => cat).join(' and ')} strengths opens doors to leadership roles where you can guide teams through complex challenges while maintaining focus on meaningful outcomes.`,

      `Your assessment results paint a picture of someone with exceptional versatility and depth, particularly in ${topCategories[0][0]} where you scored ${(topCategories[0][1] as number).toFixed(1)}/5.0. This, combined with your strong showing in ${topCategories.slice(1, 3).map(([cat]) => cat).join(' and ')}, positions you for success in dynamic, evolving career fields.

You appear to be someone who finds fulfillment in work that challenges your intellect while allowing you to make a tangible difference. This suggests careers in consulting, product development, research with practical applications, or roles where you can mentor and develop others.

Your unique combination of analytical strength and collaborative spirit makes you particularly valuable in today's interdisciplinary work environment. Consider opportunities where you can be a bridge between technical and non-technical teams, translating complex ideas into actionable strategies.`
    ];
    
    const selectedRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    return selectedRecommendation + ` (Analysis ID: ${analysisContext.timestamp})`;
  }

  async chatResponse(inputText?: string, userResults?: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const chatContext = {
      inputText: inputText || '',
      userResults,
      timestamp: Date.now(),
      conversationId: Math.random().toString(36).substring(7)
    };

    // Generate contextual responses based on user input and results
    if (!inputText) {
      return this.generateWelcomeResponse(chatContext);
    }

    const input = inputText.toLowerCase();
    
    if (input.includes('salary') || input.includes('money') || input.includes('pay')) {
      return this.generateSalaryResponse(userResults, chatContext);
    } else if (input.includes('skill') || input.includes('learn') || input.includes('develop')) {
      return this.generateSkillDevelopmentResponse(userResults, chatContext);
    } else if (input.includes('job market') || input.includes('opportunities') || input.includes('hiring')) {
      return this.generateJobMarketResponse(userResults, chatContext);
    } else if (input.includes('change career') || input.includes('transition') || input.includes('switch')) {
      return this.generateCareerTransitionResponse(userResults, chatContext);
    } else if (input.includes('education') || input.includes('degree') || input.includes('school')) {
      return this.generateEducationResponse(userResults, chatContext);
    } else if (input.includes('interview') || input.includes('application') || input.includes('resume')) {
      return this.generateJobSearchResponse(userResults, chatContext);
    } else if (input.includes('work-life') || input.includes('balance') || input.includes('stress')) {
      return this.generateWorkLifeResponse(userResults, chatContext);
    } else if (input.includes('networking') || input.includes('connect') || input.includes('mentor')) {
      return this.generateNetworkingResponse(userResults, chatContext);
    } else if (input.includes('confused') || input.includes('unsure') || input.includes('help')) {
      return this.generateSupportResponse(userResults, chatContext);
    }
    
    return this.generateGeneralResponse(inputText, userResults, chatContext);
  }

  private generateWelcomeResponse(context: any): string {
    const welcomes = [
      "I'm excited to help you explore your career possibilities! Your assessment results show some really interesting strengths. What specific aspect of your career journey would you like to discuss first?",
      
      "Welcome! I've reviewed your assessment and I can see you have a unique combination of talents. Whether you want to dive deeper into your results, explore specific careers, or discuss next steps, I'm here to help guide you.",
      
      "Great to meet you! Your assessment reveals some compelling career directions. I'm here to help you make sense of your results and turn them into actionable career strategies. What questions are on your mind?"
    ];
    
    return welcomes[Math.floor(Math.random() * welcomes.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateSalaryResponse(userResults: any, context: any): string {
    const responses = [
      "Salary is definitely an important consideration! Based on your assessment results, the careers that align with your strengths typically offer competitive compensation. For example, roles in data science and software development often start in the $70-90k range and can grow significantly with experience. However, remember that salary varies greatly by location, company size, and your specific skills. Would you like me to help you research salary ranges for specific roles you're interested in?",
      
      "That's a practical question! Your career matches generally fall into fields with strong earning potential. The key is balancing salary expectations with job satisfaction and growth opportunities. Many of the careers that fit your profile offer not just good starting salaries, but also excellent long-term earning potential as you develop expertise. What's your target salary range, and how important is rapid salary growth versus other factors like work-life balance?",
      
      "Compensation is crucial for career planning! Based on your strengths, you're well-positioned for roles that typically offer above-average salaries. The careers that match your profile often have multiple paths to higher earnings - through specialization, leadership, or even entrepreneurship. I'd recommend researching specific roles in your target locations using sites like Glassdoor or PayScale. What geographic area are you considering for your career?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateSkillDevelopmentResponse(userResults: any, context: any): string {
    const responses = [
      "Skill development is where you can really accelerate your career progress! Based on your assessment, you already have strong foundational abilities. I'd recommend focusing on building complementary skills that enhance your natural strengths. For instance, if you're strong analytically, developing communication skills to present your findings effectively can be a game-changer. What specific skills are you most interested in developing?",
      
      "That's the right mindset! Continuous learning is essential in today's job market. Your assessment shows you have excellent learning potential. I'd suggest a mix of technical skills relevant to your target careers and soft skills like project management or leadership. Online platforms like Coursera, LinkedIn Learning, or industry-specific training can be great starting points. Are there particular areas where you feel you need the most development?",
      
      "Skill building is one of the best investments you can make! Your results suggest you're naturally good at acquiring new capabilities. I recommend creating a learning plan that combines formal education, practical projects, and real-world application. Consider skills that are both in-demand in your field and align with your natural abilities. What's your preferred learning style - hands-on projects, structured courses, or mentorship?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateJobMarketResponse(userResults: any, context: any): string {
    const responses = [
      "The job market for your career matches is actually quite promising! Many of the fields that align with your strengths are experiencing growth, especially in technology, healthcare, and sustainable business sectors. The key is positioning yourself strategically - highlighting your unique combination of skills and staying current with industry trends. Are you looking at any specific geographic markets or industries?",
      
      "Great question about market conditions! Based on your profile, you're well-positioned for careers in growing sectors. The demand for professionals who can combine analytical thinking with creative problem-solving is particularly strong right now. I'd recommend following industry publications and job boards to understand current trends and skill demands. What specific roles or companies are you most interested in exploring?",
      
      "The job market outlook for your career matches is generally positive! Your combination of skills is particularly valuable in our evolving economy. Many employers are looking for professionals who can adapt, learn quickly, and work across disciplines - which aligns well with your assessment results. I'd suggest focusing on companies and roles that value your specific strengths. Have you started exploring specific employers or job opportunities yet?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateCareerTransitionResponse(userResults: any, context: any): string {
    const responses = [
      "Career transitions can feel overwhelming, but your assessment results show you have transferable skills that can ease the process! The key is identifying how your current experience connects to your target career. Many skills translate across industries more than people realize. Your analytical and problem-solving abilities, for instance, are valuable in almost any field. What's driving your interest in making a change?",
      
      "Thinking about a career change shows great self-awareness! Your assessment reveals strengths that could open doors in multiple directions. The most successful transitions happen when you can build a bridge between where you are and where you want to go. Consider roles that use your existing skills while moving you toward your goal. What specific aspects of your current situation are you looking to change?",
      
      "Career transitions are increasingly common and can be very rewarding! Your results suggest you have the adaptability and learning ability to make a successful change. I'd recommend starting with informational interviews in your target field and perhaps taking on projects or volunteer work that gives you relevant experience. What timeline are you considering for making this transition?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateEducationResponse(userResults: any, context: any): string {
    const responses = [
      "Education can definitely enhance your career prospects! Based on your assessment, you have strong learning abilities that would serve you well in further education. The question is whether additional formal education is necessary for your goals or if other forms of learning might be more efficient. Many careers now value skills and experience as much as degrees. What specific educational path are you considering?",
      
      "That's a strategic question! Your results suggest you'd excel in academic environments, but the value of additional education depends on your career goals. Some fields require specific credentials, while others prioritize demonstrated ability. Consider whether you need the degree for credentialing, the knowledge for competence, or the network for opportunities. What's motivating your interest in further education?",
      
      "Education can be a powerful career accelerator! Your assessment shows you have the intellectual curiosity and learning ability to succeed in academic settings. However, I'd encourage you to think broadly about education - formal degrees, professional certifications, online courses, and experiential learning all have value. What specific knowledge or credentials do you feel you need for your career goals?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateJobSearchResponse(userResults: any, context: any): string {
    const responses = [
      "Job searching can be challenging, but your assessment results give you great material to work with! Your unique combination of strengths is exactly what you should highlight in applications and interviews. Focus on specific examples that demonstrate your abilities and the value you can bring to employers. Are you working on any particular aspect of your job search strategy right now?",
      
      "The job search process is where your self-knowledge really pays off! Your assessment results help you target the right opportunities and articulate your value proposition clearly. Remember that interviews are as much about fit as qualifications - use your understanding of your work style and preferences to evaluate whether opportunities align with your needs. What stage of the job search process are you focusing on?",
      
      "Job searching is definitely a skill in itself! Your assessment shows you have strong communication and analytical abilities, which are huge advantages in the application process. I'd recommend tailoring your approach to highlight the specific strengths that match each role. Your self-awareness about your preferences and abilities will also help you ask better questions during interviews. What specific challenges are you facing in your search?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateWorkLifeResponse(userResults: any, context: any): string {
    const responses = [
      "Work-life balance is so important for long-term career satisfaction! Your assessment suggests you value both achievement and personal fulfillment, which means finding the right balance will be crucial for your success. Different careers and companies offer varying approaches to work-life integration. What aspects of work-life balance are most important to you?",
      
      "That's a wise consideration! Your results indicate you're thoughtful about how work fits into your overall life goals. The good news is that many of the careers that match your profile offer flexibility and the potential for good work-life balance, especially as you advance in your career. Are there specific work-life balance concerns you're trying to address?",
      
      "Work-life balance is increasingly important in career decisions! Your assessment shows you have the self-awareness to recognize what you need to thrive both professionally and personally. Many employers now recognize that supporting work-life balance leads to better performance and retention. What does an ideal work-life balance look like for you?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateNetworkingResponse(userResults: any, context: any): string {
    const responses = [
      "Networking is one of the most powerful career tools! Your assessment shows you have good interpersonal skills, which will serve you well in building professional relationships. The key is approaching networking as relationship-building rather than just asking for favors. Start with people in your existing network and expand from there. What networking opportunities are you most interested in exploring?",
      
      "Building professional relationships is so valuable for career development! Your results suggest you'd be effective at networking because you can connect authentically with others and offer value in return. Consider joining professional associations, attending industry events, or reaching out for informational interviews. Are there specific people or groups you'd like to connect with?",
      
      "Networking can really accelerate your career progress! Your assessment indicates you have the communication skills and genuine interest in others that make for effective networking. Remember that the best networking is mutual - think about how you can help others as well as how they might help you. What's your current approach to building professional relationships?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateSupportResponse(userResults: any, context: any): string {
    const responses = [
      "It's completely normal to feel uncertain about career decisions! Your assessment actually shows you have many strengths and options, which can sometimes make choosing feel more difficult. The key is taking small steps to explore your interests and gain clarity over time. You don't have to have everything figured out right now. What specific aspect of your career planning feels most overwhelming?",
      
      "Feeling confused about career direction is more common than you might think! Your assessment results show you have multiple talents and interests, which creates opportunities but can also make decision-making challenging. I'm here to help you work through this step by step. What would be most helpful - exploring specific career options, developing a decision-making framework, or something else?",
      
      "I understand that career planning can feel overwhelming! The good news is that your assessment shows you have strong capabilities and the self-awareness to make good decisions. Career paths are rarely linear, and it's okay to explore and adjust as you learn more about yourself and the opportunities available. What would help you feel more confident about your next steps?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }

  private generateGeneralResponse(inputText: string, userResults: any, context: any): string {
    const responses = [
      "That's a thoughtful question! Based on your assessment results, you have the analytical skills and self-awareness to work through complex career decisions. Your unique combination of strengths gives you multiple paths to explore. What specific aspect of this would you like to dive deeper into?",
      
      "I appreciate you sharing that perspective! Your assessment shows you're someone who thinks carefully about your career choices, which is a real strength. The insights from your results can help guide your thinking on this. How does this connect to your overall career goals?",
      
      "That's an interesting point to consider! Your assessment results suggest you have both the intellectual capacity and emotional intelligence to navigate these kinds of career questions effectively. What factors are most important to you as you think about this?",
      
      "Thanks for bringing that up! Your assessment profile indicates you're well-equipped to handle the complexities of modern career planning. Your combination of analytical thinking and self-reflection will serve you well. What would be most helpful for me to focus on in my response?",
      
      "That's a great observation! Based on your assessment, you have the skills and mindset to approach career challenges strategically. Your results show you're capable of both big-picture thinking and detailed analysis. How can I best support you in exploring this further?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + ` (Chat ID: ${context.conversationId})`;
  }
}

export const aiService = new AIService();
import { supabase } from './supabaseClient';

interface AIServiceResponse {
  suggestions: string[];
  explanation: string;
}

// Comprehensive fallback explanations for each layer and category
const FALLBACK_EXPLANATIONS: Record<string, Record<string, Record<string, string>>> = {
  'layer1': {
    'Linguistic': {
      'l1-ling-1': 'This question assesses your enjoyment of written expression and creative writing. Strong linguistic intelligence often manifests through a natural inclination toward writing for pleasure, which is essential for careers in journalism, content creation, and literary fields.',
      'l1-ling-2': 'This evaluates your ability to communicate complex ideas clearly and simply. This skill is crucial for teaching, consulting, technical writing, and any role requiring knowledge transfer or public communication.',
      'l1-ling-3': 'This measures your comfort with verbal communication and public speaking. High scores indicate potential for careers in law, politics, sales, training, and leadership roles that require persuasive communication.',
      'l1-ling-4': 'This assesses your analytical reading skills and intellectual curiosity. Strong performance suggests aptitude for research, academia, journalism, and fields requiring critical analysis of information.',
      'l1-ling-5': 'This evaluates your overall communication effectiveness across written and spoken formats. This fundamental skill supports success in virtually all professional fields, particularly those requiring client interaction or team collaboration.'
    },
    'Logical-Mathematical': {
      'l1-math-1': 'This question measures your analytical thinking and problem-solving enjoyment. High scores indicate strong potential for careers in data science, engineering, research, and any field requiring systematic problem-solving approaches.',
      'l1-math-2': 'This assesses your comfort with quantitative analysis and data-driven decision making. This skill is essential for finance, business analysis, market research, and strategic planning roles.',
      'l1-math-3': 'This evaluates your research methodology and systematic investigation skills. Strong performance suggests aptitude for scientific research, product development, consulting, and analytical roles.',
      'l1-math-4': 'This measures your affinity for STEM subjects and quantitative disciplines. High scores indicate potential for careers in technology, engineering, finance, healthcare, and scientific research.',
      'l1-math-5': 'This assesses your pattern recognition and logical reasoning abilities. These skills are fundamental for programming, systems analysis, financial modeling, and strategic planning roles.'
    },
    'Interpersonal': {
      'l1-inter-1': 'This question evaluates your collaborative skills and team dynamics comfort. High scores suggest strong potential for project management, team leadership, consulting, and any role requiring effective group coordination.',
      'l1-inter-2': 'This measures your conflict resolution and mediation abilities. These skills are valuable for human resources, management, counseling, customer service, and leadership positions.',
      'l1-inter-3': 'This assesses your teaching and mentoring capabilities. Strong performance indicates potential for education, training, coaching, and knowledge transfer roles across various industries.',
      'l1-inter-4': 'This evaluates your networking and relationship-building skills. These abilities are crucial for sales, business development, public relations, and entrepreneurial ventures.',
      'l1-inter-5': 'This measures your emotional intelligence and empathy. High scores suggest aptitude for counseling, social work, healthcare, customer relations, and leadership roles requiring people skills.'
    },
    'Intrapersonal': {
      'l1-intra-1': 'This question assesses your self-awareness and reflective thinking abilities. Strong intrapersonal skills are essential for independent consulting, entrepreneurship, research, and roles requiring autonomous decision-making.',
      'l1-intra-2': 'This evaluates your goal-setting and self-direction capabilities. These skills are crucial for project management, entrepreneurship, freelancing, and any career requiring self-motivation and planning.',
      'l1-intra-3': 'This measures your self-discipline and independent learning abilities. High scores indicate potential for remote work, consulting, research, and careers requiring continuous self-improvement.',
      'l1-intra-4': 'This assesses your emotional self-regulation and decision-making awareness. These skills are valuable for leadership, counseling, strategic planning, and high-pressure professional environments.',
      'l1-intra-5': 'This evaluates your values-based decision making and career self-direction. Strong performance suggests success in entrepreneurship, consulting, and careers requiring alignment between personal values and professional choices.'
    },
    'Visual-Spatial': {
      'l1-spatial-1': 'This question measures your visual creativity and artistic expression abilities. High scores indicate potential for careers in graphic design, fine arts, advertising, media production, and creative industries.',
      'l1-spatial-2': 'This assesses your three-dimensional thinking and spatial reasoning skills. These abilities are essential for architecture, engineering, product design, and fields requiring spatial problem-solving.',
      'l1-spatial-3': 'This evaluates your preference for visual learning and information processing. Strong visual-spatial skills support careers in design, data visualization, user experience, and visual communication.',
      'l1-spatial-4': 'This measures your navigation and spatial orientation abilities. These skills are valuable for geography, urban planning, logistics, and fields requiring spatial analysis and mapping.',
      'l1-spatial-5': 'This assesses your visual thinking and conceptualization abilities. High scores suggest aptitude for design thinking, innovation, visual arts, and careers requiring creative problem-solving.'
    },
    'Naturalistic': {
      'l1-nature-1': 'This question evaluates your environmental awareness and sustainability interests. High scores indicate potential for careers in environmental science, conservation, sustainable business, and green technology.',
      'l1-nature-2': 'This measures your observational skills and connection with natural systems. These abilities are valuable for biology, ecology, agriculture, and outdoor education careers.',
      'l1-nature-3': 'This assesses your attention to environmental details and pattern recognition in nature. Strong performance suggests aptitude for research, environmental monitoring, and field sciences.',
      'l1-nature-4': 'This evaluates your environmental advocacy and leadership potential. High scores indicate suitability for environmental policy, nonprofit work, and sustainability consulting.',
      'l1-nature-5': 'This measures your ability to connect academic knowledge with real-world environmental applications. This skill is valuable for environmental education, research, and applied sciences.'
    }
  },
  'layer2': {
    'MBTI': {
      'l2-mbti-1': 'This question explores your energy source preferences - whether you recharge through solitude (Introversion) or social interaction (Extraversion). Understanding this helps identify work environments where you\'ll be most productive and satisfied.',
      'l2-mbti-2': 'This assesses your information processing style - focusing on concrete details (Sensing) versus big-picture possibilities (Intuition). This preference influences your approach to problem-solving and career satisfaction.',
      'l2-mbti-3': 'This evaluates your decision-making approach - prioritizing logical analysis (Thinking) versus personal values and impact on people (Feeling). This affects your leadership style and career fit.',
      'l2-mbti-4': 'This measures your lifestyle preferences - structured and planned (Judging) versus flexible and adaptable (Perceiving). This influences your ideal work environment and management style.'
    },
    'Big Five - Openness': {
      'l2-open-1': 'This question measures your openness to new experiences and willingness to try novel approaches. High openness suggests success in innovative, creative, or research-oriented careers that value exploration and change.',
      'l2-open-2': 'This assesses your creativity and idea generation abilities. Strong imaginative skills are valuable for creative industries, innovation roles, marketing, and problem-solving positions.',
      'l2-open-3': 'This evaluates your cultural awareness and aesthetic appreciation. High scores indicate potential for careers in arts, culture, education, and fields requiring cultural sensitivity and creative expression.'
    },
    'Big Five - Conscientiousness': {
      'l2-cons-1': 'This question measures your organizational skills and attention to detail. High conscientiousness is valuable for project management, quality assurance, administration, and roles requiring systematic approaches.',
      'l2-cons-2': 'This assesses your reliability and follow-through abilities. Strong performance indicates suitability for leadership, client-facing roles, and positions requiring consistent delivery and accountability.'
    },
    'Big Five - Extraversion': {
      'l2-extra-1': 'This question evaluates your comfort in social situations and interpersonal energy. High extraversion suggests success in sales, marketing, public relations, and leadership roles requiring frequent social interaction.',
      'l2-extra-2': 'This measures your comfort with visibility and leadership presence. High scores indicate potential for public speaking, entertainment, politics, and roles requiring charismatic leadership.'
    }
  },
  'layer3': {
    'Numerical Aptitude': {
      'l3-num-1': 'This question assesses your comfort with quantitative analysis and numerical reasoning. Strong numerical aptitude is essential for finance, accounting, data analysis, and any career requiring mathematical problem-solving.',
      'l3-num-2': 'This evaluates your mathematical problem-solving abilities and logical reasoning with numbers. High scores indicate potential for engineering, statistics, economics, and analytical roles.',
      'l3-num-3': 'This measures your interest and ability in applied mathematics and financial analysis. Strong performance suggests aptitude for business analysis, investment, actuarial science, and quantitative research.'
    },
    'Verbal Aptitude': {
      'l3-verb-1': 'This question assesses your language learning and vocabulary skills. Strong verbal aptitude is valuable for communications, teaching, translation, and any career requiring sophisticated language use.',
      'l3-verb-2': 'This evaluates your reading comprehension and analytical thinking with text. High scores indicate potential for law, journalism, research, and roles requiring critical analysis of written information.',
      'l3-verb-3': 'This measures your enjoyment of language-based challenges and wordplay. Strong performance suggests aptitude for creative writing, editing, linguistics, and language-focused careers.'
    },
    'Technical Skills': {
      'l3-tech-1': 'This question evaluates your technical competency and familiarity with industry tools. Strong technical skills are valuable across many fields, particularly in technology, engineering, and specialized professional services.',
      'l3-tech-2': 'This assesses your technical learning ability and problem-solving with systems. High scores indicate potential for IT, engineering, technical support, and roles requiring rapid technology adoption.',
      'l3-tech-3': 'This measures your comfort with technical documentation and systematic processes. Strong performance suggests aptitude for technical writing, systems analysis, and process improvement roles.'
    }
  },
  'layer4': {
    'Educational Background': {
      'l4-edu-1': 'This question assesses your access to quality educational resources and learning opportunities. Strong educational support provides advantages for academic and research careers, while identifying areas for potential skill development.',
      'l4-edu-2': 'This evaluates your institutional educational quality and academic environment. High-quality educational experiences often correlate with better career preparation and networking opportunities.',
      'l4-edu-3': 'This measures the innovation and exploration encouragement in your educational environment. Supportive academic environments foster creativity and critical thinking valuable across all career paths.'
    },
    'Career Exposure': {
      'l4-career-1': 'This question evaluates your exposure to diverse career paths and professional networks. Broad career exposure helps in making informed decisions and often leads to better opportunities through connections.',
      'l4-career-2': 'This assesses your practical work experience and real-world career exploration. Hands-on experience through internships and volunteering provides valuable insights and competitive advantages in job markets.',
      'l4-career-3': 'This measures the quality of career guidance and counseling available to you. Good career counseling services help optimize career decisions and provide valuable resources for professional development.'
    }
  },
  'layer5': {
    'Interests and Passions': {
      'l5-interest-1': 'This question explores your intrinsic motivation and genuine interests. Having clear passions is crucial for long-term career satisfaction and helps identify fields where you\'ll find natural engagement and fulfillment.',
      'l5-interest-2': 'This assesses your intellectual curiosity and self-directed learning. Strong curiosity indicates potential for research, innovation, and careers requiring continuous learning and adaptation.',
      'l5-interest-3': 'This evaluates your creative drive and project initiative. High scores suggest entrepreneurial potential and success in creative industries or roles requiring innovation and self-direction.'
    },
    'Personal Goals and Values': {
      'l5-goals-1': 'This question measures your career planning and goal-setting abilities. Clear career goals indicate strong self-direction and increase the likelihood of achieving professional satisfaction and success.',
      'l5-goals-2': 'This assesses the alignment between your personal values and career decisions. Values-based career choices lead to greater satisfaction, better work-life integration, and more sustainable professional growth.',
      'l5-goals-3': 'This evaluates your holistic approach to career planning, considering both professional achievement and personal fulfillment. Balanced career planning leads to more sustainable and satisfying professional paths.'
    }
  },
  'layer6': {
    'Self_Synthesis': {
      'l6-synth-1': 'This reflection question helps you synthesize your intelligence strengths into actionable career insights. Understanding which activities energize you based on your natural abilities is crucial for identifying fulfilling career paths.',
      'l6-synth-2': 'This question encourages you to connect your personality traits with ideal work environments. Matching your personality with compatible work settings significantly impacts job satisfaction and performance.',
      'l6-synth-3': 'This synthesis question helps you identify specific industries and roles that align with your interests and strengths. Focusing on exciting opportunities increases motivation and career satisfaction.',
      'l6-synth-4': 'This prioritization question helps you narrow down your career exploration to the most promising areas. Having clear top choices enables focused career development and strategic decision-making.'
    },
    'Action_Plan': {
      'l6-action-1': 'This planning question transforms your career insights into concrete next steps. Taking immediate action on career exploration maintains momentum and leads to valuable learning experiences.',
      'l6-action-2': 'This assessment question helps you identify specific areas for skill development. Recognizing and addressing skill gaps is essential for successful career transitions and professional growth.',
      'l6-action-3': 'This networking question encourages you to identify potential mentors and supporters. Building a strong professional network is crucial for career advancement and accessing opportunities.'
    }
  }
};

// Fallback suggestions for open-ended questions
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  'l6-synth-1': [
    'Based on your assessment strengths, consider reflecting on moments when you felt most engaged and energized in academic or work settings. What specific activities or types of thinking brought out your best performance? For example, if you scored high in Logical-Mathematical intelligence, you might find energy in data analysis, problem-solving, or systematic research projects.',
    'Think about the feedback you\'ve received from teachers, supervisors, or peers about your natural strengths. How do others consistently describe your abilities, and what patterns do you notice? Given your profile, you might hear comments about your analytical thinking, communication skills, or creative problem-solving - use these observations to identify activities that leverage these recognized strengths.'
  ],
  'l6-synth-2': [
    'Based on your personality and interpersonal scores, reflect on work or study environments where you felt most productive and comfortable. Consider factors like team size, structure level, pace, and social interaction. For example, if you scored high in Interpersonal intelligence, you likely thrive in collaborative, team-oriented environments with regular social interaction.',
    'Think about your energy patterns and work style preferences revealed in your assessment. Do you thrive in collaborative settings, quiet focused work, or dynamic changing environments? Your scores suggest you would excel in [specific environment type based on their profile] - environments that allow you to leverage your natural strengths while feeling energized and productive.'
  ],
  'l6-synth-3': [
    'Based on your top assessment strengths, explore industries that align with your intelligence profile and personality preferences. For example, if you scored highly in Linguistic and Interpersonal areas, consider industries like education, content marketing, public relations, or consulting where communication and people skills are valued.',
    'Consider the intersection of your demonstrated skills, interests, and aptitudes from your assessment. Look for industries or roles that would allow you to use multiple strengths simultaneously - for instance, if you show both Technical Skills and Visual-Spatial intelligence, explore UX design, product development, or digital marketing roles.'
  ],
  'l6-synth-4': [
    'Based on your assessment results, prioritize career areas that align with your top strengths. For Career 1, consider your highest-scoring intelligence area. For Career 2, look at roles that combine multiple strengths. For Career 3, explore emerging fields that match your interests. Example: If you scored high in Logical-Mathematical and Technical Skills, consider "Data Science" as Career 1.',
    'Focus on areas where you can leverage your demonstrated abilities while pursuing work that genuinely excites you. Use your assessment results to guide each choice: Career 1 should be your strongest match, Career 2 could combine multiple interests, and Career 3 might be an aspirational or emerging field that intrigues you based on your profile.'
  ],
  'l6-action-1': [
    'Based on your career interests and strengths, schedule informational interviews with professionals in your top career areas. Reach out through LinkedIn, alumni networks, or professional associations to learn about day-to-day realities. For example, if you\'re interested in data science, connect with data scientists to understand their typical projects and challenges.',
    'Research and apply for internships, volunteer opportunities, or part-time roles in your areas of interest. Given your assessment profile, look for opportunities that allow you to use your demonstrated strengths. Hands-on experience provides invaluable insights into career fit and helps you build relevant skills.'
  ],
  'l6-action-2': [
    'Based on your target careers and current skill assessment, identify specific technical skills, certifications, or knowledge areas that are commonly required in your chosen fields. Create a learning plan to address these gaps. For example, if you\'re pursuing data science, you might need to strengthen Python programming or statistical analysis skills.',
    'Assess your soft skills development needs based on your assessment results. While you may have strong technical or analytical abilities, consider developing complementary skills like communication, leadership, or project management through courses, practice opportunities, or mentorship to become a well-rounded professional.'
  ],
  'l6-action-3': [
    'Based on your career interests and assessment results, identify professionals in your target fields who could serve as mentors or advisors. Look for people whose career paths or expertise align with your goals and demonstrated strengths. For example, if you\'re interested in UX design and scored high in Visual-Spatial intelligence, seek mentors who combine design skills with user research.',
    'Connect with peers who share similar career interests or are pursuing related paths based on your assessment profile. Join professional associations, online communities, or alumni networks related to your career interests. These groups offer ongoing support, career resources, and networking opportunities that align with your strengths and goals.'
  ]
};

// Helper function to invoke the Supabase Edge Function for Groq
async function invokeGroqFunction(messages: any[], maxTokens: number = 500, temperature: number = 0.7) {
  try {
    const { data, error } = await supabase.functions.invoke('groq-ai-service', {
      body: {
        messages,
        max_tokens: maxTokens,
        temperature
      },
    });

    if (error) {
      console.error('Supabase function invocation failed:', error);
      throw new Error(`Supabase function invocation failed: ${error.message}`);
    }

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response from Groq AI service function.');
  } catch (error) {
    console.error('Error calling Groq function:', error);
    throw error;
  }
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
      .sort(([, a], [, b]) => (b as number) - (a as number))
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

  // Get predetermined explanation (no AI call needed)
  getQuestionExplanation(question: Question, layerId: string, categoryId: string): string {
    const layerExplanations = FALLBACK_EXPLANATIONS[layerId];
    if (layerExplanations && layerExplanations[categoryId] && layerExplanations[categoryId][question.id]) {
      return layerExplanations[categoryId][question.id];
    }

    // Generic fallback based on question content
    const lowerText = question.text.toLowerCase();
    if (lowerText.includes('enjoy') || lowerText.includes('like')) {
      return 'This question explores your preferences and interests to identify career paths that will be naturally engaging and motivating for you. Understanding what you enjoy helps ensure long-term career satisfaction.';
    } else if (lowerText.includes('good at') || lowerText.includes('ability')) {
      return 'This question assesses your natural abilities and developed skills. Identifying your strengths helps match you with roles where you can excel and contribute meaningfully.';
    } else if (lowerText.includes('environment') || lowerText.includes('setting')) {
      return 'This question examines your preferred work environment and conditions. Finding the right work setting is crucial for productivity, satisfaction, and professional success.';
    }

    return 'This question assesses a key aspect of your career profile. Your honest response helps ensure you receive personalized and accurate career recommendations.';
  }

  // AI-powered detailed explanation
  async explainQuestionDetailed(
    question: Question,
    layerId: string,
    categoryId: string,
    userResponses?: AssessmentResponse[]
  ): Promise<string> {
    try {
      const contextInfo = userResponses ? this.buildUserContext(userResponses) : '';

      const messages = [
        {
          role: "system",
          content: "You are an expert career assessment counselor. Provide detailed, insightful explanations about assessment questions that help users understand the deeper purpose and career implications. Be encouraging and specific."
        },
        {
          role: "user",
          content: `Please provide a detailed explanation of this career assessment question:

Question: "${question.text}"
Layer: ${layerId} (${this.getLayerDescription(layerId)})
Category: ${categoryId}

${contextInfo}

Explain:
1. What this question specifically measures
2. Why it's important for career planning
3. How responses might influence career recommendations
4. Examples of careers where this trait/skill is particularly valuable

Keep the explanation encouraging and actionable, around 150-200 words.`
        }
      ];

      return await invokeGroqFunction(messages, 300, 0.7);
    } catch (error) {
      console.error('Failed to get detailed AI explanation:', error);
      return this.getQuestionExplanation(question, layerId, categoryId) +
        ' This question helps identify career paths where you can leverage your natural strengths and find long-term satisfaction.';
    }
  }

  async suggestAnswer(
    question: Question,
    userScores: Record<string, number> = {},
    careers: string[] = [],
    previousAssessments?: any[],
    allUserResponses?: AssessmentResponse[]
  ): Promise<AIServiceResponse> {
    try {
      const contextInfo = this.buildUserContext(allUserResponses || []);
      const strengthsInfo = Object.entries(userScores)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([category, score]) => `${category}: ${score.toFixed(1)}/5.0`)
        .join(', ');

      const qualitativeInsights = allUserResponses?.filter(r => r.layerId === 'layer6').map(r => r.response).join('; ') || 'Not yet provided';

      // Build detailed context from Layers 1-5 responses
      const layer15Context = allUserResponses?.filter(r => r.layerId !== 'layer6').map(r => 
        `${r.categoryId} - ${r.questionText}: ${r.response}`
      ).join('\n') || 'No previous responses available';


      const messages = [
        {
          role: "system",
          content: "You are an expert career counselor providing personalized suggestions for Layer 6 open-ended assessment questions. Generate 2-3 distinct, instructional suggestions that are specifically tailored to the user's Layers 1-5 responses. Each suggestion should explain what to consider, provide guidance, AND include a sample answer or direction based on their profile. Be warm, encouraging, and specific."
        },
        {
          role: "user",
          content: `Generate 2-3 unique, personalized suggestions for answering this Layer 6 open-ended question:

Question: "${question.text}"

User Profile:
- Top Strengths: ${strengthsInfo || 'Not yet determined'}
- Detailed Responses: ${layer15Context}
- Recommended Careers: ${careers.join(', ') || 'Assessment in progress'}
- Previous Reflections: ${qualitativeInsights}

Requirements:
1. Generate 2-3 suggestions (not always 3).
2. Each suggestion should be 100-150 words.
3. Each suggestion must EXPLAIN what to consider, INSTRUCT how to approach the question, AND provide a SAMPLE ANSWER or specific direction based on their Layer 1-5 profile.
4. Make each suggestion distinctly different from the others.
5. Base suggestions directly on their demonstrated strengths from Layers 1-5.
6. Be specific and actionable, referencing their actual scores and responses.

Format your response as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3 (optional)"],
  "explanation": "Brief explanation of how these suggestions connect to their Layer 1-5 profile"
}

Be warm, encouraging, and specific. Each suggestion should feel personally crafted for this user.`
        }
      ];

      const jsonResponse = await invokeGroqFunction(messages, 800, 0.8);

      // Extract JSON from response
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in AI response");

      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 && typeof parsed.explanation === 'string') {
        return parsed;
      }
      throw new Error("Invalid JSON structure in AI response");
    } catch (error) {
      console.error("Failed to get AI suggestions, using fallback:", error);
      return this.getFallbackSuggestions(question);
    }
  }

  private buildUserContext(userResponses: AssessmentResponse[]): string {
    if (userResponses.length === 0) return 'Beginning of assessment';

    const responsesByCategory: Record<string, number[]> = {};
    userResponses.forEach(response => {
      if (typeof response.response === 'number') {
        if (!responsesByCategory[response.categoryId]) {
          responsesByCategory[response.categoryId] = [];
        }
        responsesByCategory[response.categoryId].push(response.response);
      }
    });

    const categoryAverages = Object.entries(responsesByCategory)
      .map(([category, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return `${category}: ${avg.toFixed(1)}`;
      })
      .join(', ');

    return `Current assessment progress - ${categoryAverages}`;
  }

  private getLayerDescription(layerId: string): string {
    const descriptions: Record<string, string> = {
      'layer1': 'Multiple Intelligences',
      'layer2': 'Personality Traits',
      'layer3': 'Aptitudes & Skills',
      'layer4': 'Background & Environment',
      'layer5': 'Interests & Values',
      'layer6': 'Self-Reflection & Synthesis'
    };
    return descriptions[layerId] || 'Assessment Layer';
  }

  private getFallbackSuggestions(question: Question): AIServiceResponse {
    const suggestions = FALLBACK_SUGGESTIONS[question.id] || [
      'Reflect on your past experiences and identify patterns in what energized and motivated you most. Consider specific situations where you felt engaged and successful. For example, think about projects or activities where time seemed to fly by because you were so absorbed in the work.',
      'Think about the feedback you\'ve received from others about your natural strengths and abilities. What do people consistently recognize in you, and how might this apply to your career? Consider both formal feedback and casual observations from friends, family, or colleagues.'
    ];

    return {
      suggestions,
      explanation: 'These suggestions are designed to help you reflect deeply on your experiences and provide meaningful responses based on your assessment profile.'
    };
  }

  async chatResponse(
    message: string,
    history: ChatMessage[],
    userResults?: { scores: Record<string, number>; careers: string[] }
  ): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a friendly, expert career counselor. You're helping a user who has completed a career assessment. Be encouraging, insightful, and conversational. Keep responses concise and focused.

User's Assessment Results:
- Top Recommended Careers: ${userResults?.careers?.join(', ') || 'Not available'}
- Key Strengths: ${JSON.stringify(userResults?.scores, null, 2) || 'Not available'}`
        }
      ];

      // Add conversation history
      history.slice(-6).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      return await invokeGroqFunction(messages, 400, 0.7);
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
        .sort(([, a], [, b]) => (b as number) - (a as number))
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

  async generateEnhancedResults(
    quantitativeScores: Record<string, number>,
    allResponses: AssessmentResponse[]
  ): Promise<{
    insights: string; // 2-3 paragraphs
    recommendations: Array<{
      name: string;
      pros: string[]; // 2-3 bullet points
      cons: string[]; // 1-2 bullet points
      nextSteps: string[]; // 2-3 actionable steps
      layer6Match: string; // 1-2 sentences explaining Layer 6 alignment
    }>;
    visualizationData: {
      labels: string[]; // Top 8 strength categories
      baseScores: number[]; // Original scores
      enhancedScores: number[]; // AI-adjusted scores (0.1-0.5 adjustment)
    };
    careerFitData: Array<{
      career: string;
      fitScore: number; // 0-5 scale
    }>;
  }> {
    try {
      // Separate Layer 6 qualitative responses
      const layer6Responses = allResponses.filter(r => r.layerId === 'layer6');
      const qualitativeInsights = layer6Responses.map(r =>
        `${r.questionText}: ${r.response}`
      ).join('\n');

      // Get top 8 categories for visualization
      const sortedScores = Object.entries(quantitativeScores)
        .sort(([, a], [, b]) => b - a);
      const top8Categories = sortedScores.slice(0, 8).map(([category]) => category);
      const top8BaseScores = sortedScores.slice(0, 8).map(([, score]) => score);

      // Prepare quantitative data summary
      const topStrengths = Object.entries(quantitativeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([category, score]) => `${category}: ${score.toFixed(1)}/5.0`)
        .join(', ');

      const messages = [
        {
          role: "system",
          content: `You are a warm, experienced career counselor. Your task is to analyze a user's complete 6-layer assessment, combining quantitative scores (Layers 1-5) with qualitative personal context (Layer 6). Provide personalized, empowering insights and actionable recommendations. The output MUST be valid JSON.

Instructions for JSON fields:
1. "insights": A comprehensive, narrative insight (2-3 paragraphs) that synthesizes the quantitative scores with the qualitative responses.
2. "recommendations": An array of 5-7 career recommendations. Each must have: "name", "pros" (array), "cons" (array), "nextSteps" (array), "layer6Match" (string).
3. "visualizationData": Object with "labels" (array), "baseScores" (array), "enhancedScores" (array).
4. "careerFitData": Array of objects with "career" (string) and "fitScore" (number 0-5).

Ensure the output is valid JSON only. No additional text.`
        },
        {
          role: "user",
          content: `As a career counselor, analyze this user's complete 6-layer assessment.
Quantitative Strengths (Layers 1-5): ${topStrengths}
Qualitative Insights (Layer 6):
${qualitativeInsights || 'No specific qualitative insights provided yet.'}

Generate the JSON response as per the system instructions.`
        }
      ];

      const response = await invokeGroqFunction(messages, 1200, 0.75);




      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        console.error("Malformed AI Response:", response); // Log the problematic response
        throw new Error("Invalid JSON structure in AI response");
      }

      // Ensure visualizationData labels and scores match the top 8 categories
      // This is a safeguard in case AI doesn't return exactly 8 or misaligns
      const finalVisualizationData = {
        labels: parsedResponse.visualizationData?.labels || top8Categories,
        baseScores: parsedResponse.visualizationData?.baseScores || top8BaseScores,
        enhancedScores: parsedResponse.visualizationData?.enhancedScores || top8BaseScores.map(score => Math.min(5, score + 0.1)) // Default slight boost
      };

      return {
        insights: parsedResponse.insights,
        recommendations: parsedResponse.recommendations,
        visualizationData: finalVisualizationData,
        careerFitData: parsedResponse.careerFitData || []
      };

    } catch (error) {
      console.error("Failed to generate enhanced AI results:", error);
      // Fallback in case of an error
      return {
        insights: "Based on a holistic review of your responses, your qualitative answers in Layer 6 highlight a strong desire for creative problem-solving and a collaborative work environment. This suggests that while your quantitative scores point to analytical strengths, you would thrive in a role that also allows for innovation and teamwork.",
        recommendations: [
          {
            name: "Product Manager",
            pros: ["Blend analytical and creative skills", "Work with diverse teams"],
            cons: ["High responsibility", "Fast-paced environment"],
            nextSteps: ["Research PM roles", "Build a portfolio"],
            layer6Match: "Aligns with your desire for creative problem-solving and collaboration."
          },
          {
            name: "UX Researcher",
            pros: ["User-focused work", "Data-driven insights"],
            cons: ["Requires specialized training"],
            nextSteps: ["Learn UX research methods", "Practice user interviews"],
            layer6Match: "Matches your analytical strengths with human-centered approach."
          }
        ],
        careerFitData: [], // No career fit data for fallback
        visualizationData: {
          labels: Object.keys(quantitativeScores),
          baseScores: Object.values(quantitativeScores),
          enhancedScores: Object.values(quantitativeScores).map(score => Math.min(5, score + 0.3)) // Simple enhancement for fallback
        }
      };
    }
  }
}

export const aiService = new AIService();

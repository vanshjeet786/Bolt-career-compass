import { AssessmentLayer, Question } from '../types';

const createQuestion = (id: string, text: string, type: 'likert' | 'open-ended' = 'likert', category: string): Question => ({
  id,
  text,
  type,
  category
});

export const ASSESSMENT_LAYERS: AssessmentLayer[] = [
  {
    id: 'layer1',
    name: 'Multiple Intelligences',
    description: 'Discover your natural intelligence strengths and learning preferences',
    isOpenEnded: false,
    categories: {
      'Linguistic': [
        createQuestion('l1-ling-1', 'I enjoy writing essays, stories, or journal entries for fun.', 'likert', 'Linguistic'),
        createQuestion('l1-ling-2', 'I find it easy to explain complex topics in simple terms.', 'likert', 'Linguistic'),
        createQuestion('l1-ling-3', 'I actively participate in debates, discussions, or public speaking.', 'likert', 'Linguistic'),
        createQuestion('l1-ling-4', 'I enjoy reading and analyzing books, research papers, or blogs.', 'likert', 'Linguistic'),
        createQuestion('l1-ling-5', 'I like to express my ideas clearly through written or spoken communication.', 'likert', 'Linguistic'),
      ],
      'Logical-Mathematical': [
        createQuestion('l1-math-1', 'I enjoy solving logical puzzles, riddles, or brain teasers.', 'likert', 'Logical-Mathematical'),
        createQuestion('l1-math-2', 'I analyze data, statistics, or numerical trends to make decisions.', 'likert', 'Logical-Mathematical'),
        createQuestion('l1-math-3', 'I like working on research projects that involve problem-solving.', 'likert', 'Logical-Mathematical'),
        createQuestion('l1-math-4', 'I enjoy subjects like math, coding, finance, or science.', 'likert', 'Logical-Mathematical'),
        createQuestion('l1-math-5', 'I easily identify patterns and relationships in data or concepts.', 'likert', 'Logical-Mathematical'),
      ],
      'Interpersonal': [
        createQuestion('l1-inter-1', 'I enjoy working in teams and collaborating with peers on projects.', 'likert', 'Interpersonal'),
        createQuestion('l1-inter-2', 'I am good at resolving conflicts between friends or classmates.', 'likert', 'Interpersonal'),
        createQuestion('l1-inter-3', 'I often help others understand concepts by explaining them in different ways.', 'likert', 'Interpersonal'),
        createQuestion('l1-inter-4', 'I enjoy networking, meeting new people, and forming connections.', 'likert', 'Interpersonal'),
        createQuestion('l1-inter-5', 'I understand and respond well to people\'s emotions and perspectives.', 'likert', 'Interpersonal'),
      ],
      'Intrapersonal': [
        createQuestion('l1-intra-1', 'I regularly reflect on my personal strengths and weaknesses.', 'likert', 'Intrapersonal'),
        createQuestion('l1-intra-2', 'I set clear personal and academic goals for myself.', 'likert', 'Intrapersonal'),
        createQuestion('l1-intra-3', 'I stay motivated and disciplined even when studying independently.', 'likert', 'Intrapersonal'),
        createQuestion('l1-intra-4', 'I understand my emotions and how they affect my decision-making.', 'likert', 'Intrapersonal'),
        createQuestion('l1-intra-5', 'I choose career paths based on my interests, values, and long-term aspirations.', 'likert', 'Intrapersonal'),
      ],
      'Visual-Spatial': [
        createQuestion('l1-spatial-1', 'I enjoy drawing, painting, or visual designing.', 'likert', 'Visual-Spatial'),
        createQuestion('l1-spatial-2', 'I can visualize objects from different angles in my mind.', 'likert', 'Visual-Spatial'),
        createQuestion('l1-spatial-3', 'I prefer visual aids like diagrams, charts, or videos.', 'likert', 'Visual-Spatial'),
        createQuestion('l1-spatial-4', 'I am good at navigating or reading maps.', 'likert', 'Visual-Spatial'),
        createQuestion('l1-spatial-5', 'I often think in pictures rather than words.', 'likert', 'Visual-Spatial'),
      ],
      'Naturalistic': [
        createQuestion('l1-nature-1', 'I enjoy studying environmental topics like sustainability, ecology, or agriculture.', 'likert', 'Naturalistic'),
        createQuestion('l1-nature-2', 'I like spending time in nature and observing patterns in the environment.', 'likert', 'Naturalistic'),
        createQuestion('l1-nature-3', 'I notice and appreciate details in my surroundings that others often overlook.', 'likert', 'Naturalistic'),
        createQuestion('l1-nature-4', 'I advocate for environmental and sustainability initiatives in my college.', 'likert', 'Naturalistic'),
        createQuestion('l1-nature-5', 'I connect academic subjects with real-world applications in nature and science.', 'likert', 'Naturalistic'),
      ],
    }
  },
  {
    id: 'layer2',
    name: 'Personality Traits',
    description: 'Understand your personality dimensions and work style preferences',
    isOpenEnded: false,
    categories: {
      'MBTI': [
        createQuestion('l2-mbti-1', 'I get energized by spending time alone (I) vs with others (E).', 'likert', 'MBTI'),
        createQuestion('l2-mbti-2', 'I prefer focusing on facts (S) vs big picture ideas (N).', 'likert', 'MBTI'),
        createQuestion('l2-mbti-3', 'I prioritize logic and consistency (T) vs empathy and values (F).', 'likert', 'MBTI'),
        createQuestion('l2-mbti-4', 'I prefer planned and organized (J) vs flexible and spontaneous (P).', 'likert', 'MBTI'),
      ],
      'Big Five - Openness': [
        createQuestion('l2-open-1', 'I enjoy trying new and different activities.', 'likert', 'Big Five - Openness'),
        createQuestion('l2-open-2', 'I am imaginative and full of ideas.', 'likert', 'Big Five - Openness'),
        createQuestion('l2-open-3', 'I appreciate art, music, and literature.', 'likert', 'Big Five - Openness'),
      ],
      'Big Five - Conscientiousness': [
        createQuestion('l2-cons-1', 'I like to keep things organized and tidy.', 'likert', 'Big Five - Conscientiousness'),
        createQuestion('l2-cons-2', 'I follow through with tasks and responsibilities.', 'likert', 'Big Five - Conscientiousness'),
      ],
      'Big Five - Extraversion': [
        createQuestion('l2-extra-1', 'I feel comfortable in social situations.', 'likert', 'Big Five - Extraversion'),
        createQuestion('l2-extra-2', 'I enjoy being the center of attention.', 'likert', 'Big Five - Extraversion'),
      ],
    }
  },
  {
    id: 'layer3',
    name: 'Aptitudes & Skills',
    description: 'Assess your natural abilities and developed competencies',
    isOpenEnded: false,
    categories: {
      'Numerical Aptitude': [
        createQuestion('l3-num-1', 'I am comfortable working with numbers and data.', 'likert', 'Numerical Aptitude'),
        createQuestion('l3-num-2', 'I can solve arithmetic and algebraic problems easily.', 'likert', 'Numerical Aptitude'),
        createQuestion('l3-num-3', 'I enjoy tasks involving statistics, accounting, or finance.', 'likert', 'Numerical Aptitude'),
      ],
      'Verbal Aptitude': [
        createQuestion('l3-verb-1', 'I understand and use new vocabulary quickly.', 'likert', 'Verbal Aptitude'),
        createQuestion('l3-verb-2', 'I can comprehend and analyze written passages.', 'likert', 'Verbal Aptitude'),
        createQuestion('l3-verb-3', 'I enjoy word-based games and language puzzles.', 'likert', 'Verbal Aptitude'),
      ],
      'Technical Skills': [
        createQuestion('l3-tech-1', 'I have experience with software/tools relevant to my field.', 'likert', 'Technical Skills'),
        createQuestion('l3-tech-2', 'I can troubleshoot or learn new technical skills quickly.', 'likert', 'Technical Skills'),
        createQuestion('l3-tech-3', 'I understand technical manuals, processes, or systems.', 'likert', 'Technical Skills'),
      ],
    }
  },
  {
    id: 'layer4',
    name: 'Background & Environment',
    description: 'Evaluate how your background and environment influence career opportunities',
    isOpenEnded: false,
    categories: {
      'Educational Background': [
        createQuestion('l4-edu-1', 'I have access to quality academic resources (books, teachers, labs).', 'likert', 'Educational Background'),
        createQuestion('l4-edu-2', 'I attend or have attended a school/college with strong academic performance.', 'likert', 'Educational Background'),
        createQuestion('l4-edu-3', 'My academic environment encourages exploration and innovation.', 'likert', 'Educational Background'),
      ],
      'Career Exposure': [
        createQuestion('l4-career-1', 'I\'ve interacted with professionals from various career paths.', 'likert', 'Career Exposure'),
        createQuestion('l4-career-2', 'I have participated in internships, shadowing, or volunteering roles.', 'likert', 'Career Exposure'),
        createQuestion('l4-career-3', 'My school/college offers good career counseling services.', 'likert', 'Career Exposure'),
      ],
    }
  },
  {
    id: 'layer5',
    name: 'Interests & Values',
    description: 'Explore your passions, interests, and core values',
    isOpenEnded: false,
    categories: {
      'Interests and Passions': [
        createQuestion('l5-interest-1', 'I have clear hobbies or subjects that I love spending time on.', 'likert', 'Interests and Passions'),
        createQuestion('l5-interest-2', 'I often find myself researching or learning about certain topics outside class.', 'likert', 'Interests and Passions'),
        createQuestion('l5-interest-3', 'I get excited about working on personal or creative projects.', 'likert', 'Interests and Passions'),
      ],
      'Personal Goals and Values': [
        createQuestion('l5-goals-1', 'I have written down or thought deeply about my career goals.', 'likert', 'Personal Goals and Values'),
        createQuestion('l5-goals-2', 'My career decisions are guided by my personal values.', 'likert', 'Personal Goals and Values'),
        createQuestion('l5-goals-3', 'I consider work-life balance and personal fulfillment when imagining my future job.', 'likert', 'Personal Goals and Values'),
      ],
    }
  },
  {
    id: 'layer6',
    name: 'Self-Reflection & Synthesis',
    description: 'Synthesize your insights and create an actionable career plan',
    isOpenEnded: true,
    categories: {
      'Self_Synthesis': [
        createQuestion('l6-synth-1', 'Based on my intelligence strengths, the types of activities I naturally enjoy are:', 'open-ended', 'Self_Synthesis'),
        createQuestion('l6-synth-2', 'Based on my personality, I thrive in environments that are:', 'open-ended', 'Self_Synthesis'),
        createQuestion('l6-synth-3', 'The industries and roles that excite me most are:', 'open-ended', 'Self_Synthesis'),
        createQuestion('l6-synth-4', 'My top 3 career interest areas are:', 'open-ended', 'Self_Synthesis'),
      ],
      'Action_Plan': [
        createQuestion('l6-action-1', 'What are 3 things you can do in the next 30 days to explore your top choice(s)?', 'open-ended', 'Action_Plan'),
        createQuestion('l6-action-2', 'What specific skills or knowledge gaps do you need to address for your target careers?', 'open-ended', 'Action_Plan'),
        createQuestion('l6-action-3', 'Who can help you on this journey? (Mentors, peers, family, online groups)', 'open-ended', 'Action_Plan'),
      ],
    }
  },
];
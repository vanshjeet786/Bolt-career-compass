export const CAREER_MAPPING: Record<string, string[]> = {
  'Linguistic': ['Journalism', 'Content Writing', 'Law', 'Public Relations', 'Teaching', 'Translation', 'Literary Critic'],
  'Logical-Mathematical': ['Data Science', 'Engineering', 'Finance', 'Research', 'Software Development', 'Actuarial Science', 'Systems Analysis'],
  'Visual-Spatial': ['Graphic Design', 'Architecture', 'UX Design', 'Animation', 'Cartography', 'Interior Design', 'Photography'],
  'Interpersonal': ['Human Resources', 'Psychology', 'Social Work', 'Marketing', 'Counseling', 'Team Leadership', 'Customer Relations'],
  'Intrapersonal': ['Entrepreneur', 'Researcher', 'Philosopher', 'Author', 'Career Consultant', 'Life Coach', 'Independent Contractor'],
  'Naturalistic': ['Environmental Science', 'Forestry', 'Agriculture', 'Wildlife Conservation', 'Geology', 'Marine Biology', 'Park Ranger'],
  'MBTI': ['Management', 'Consulting', 'Strategic Planning'],
  'Big Five - Openness': ['Creative Arts', 'Innovation', 'Research & Development'],
  'Big Five - Conscientiousness': ['Project Management', 'Quality Assurance', 'Operations'],
  'Big Five - Extraversion': ['Sales', 'Marketing', 'Public Relations', 'Event Planning'],
  'Numerical Aptitude': ['Accounting', 'Financial Analysis', 'Statistics', 'Economics'],
  'Verbal Aptitude': ['Writing', 'Editing', 'Communications', 'Public Speaking'],
  'Technical Skills': ['Software Engineering', 'IT Support', 'Cybersecurity', 'Technical Writing'],
  'Educational Background': ['Teaching', 'Training & Development', 'Educational Administration'],
  'Career Exposure': ['Career Counseling', 'Recruitment', 'Talent Development'],
  'Interests and Passions': ['Creative Industries', 'Entertainment', 'Media'],
  'Personal Goals and Values': ['Nonprofit Work', 'Social Impact', 'Sustainable Business']
};

export const CAREER_DETAILS: Record<string, {
  skills: string[];
  outlook: string;
  salaryRange: string;
  description: string;
  dailyTasks: string[];
  education: string;
  growthOpportunities: string[];
}> = {
  'Data Science': {
    skills: ['Python', 'Statistics', 'Machine Learning', 'SQL'],
    outlook: 'Excellent - 35% growth expected',
    salaryRange: '$95k - $165k',
    description: 'Analyze complex data to help organizations make informed decisions',
    dailyTasks: ['Clean and analyze datasets', 'Build predictive models', 'Create data visualizations', 'Present insights to stakeholders'],
    education: 'Bachelor\'s in Statistics, Computer Science, or related field',
    growthOpportunities: ['Senior Data Scientist', 'Data Science Manager', 'Chief Data Officer']
  },
  'Software Development': {
    skills: ['Programming', 'Problem-solving', 'Version Control', 'Testing'],
    outlook: 'Very Good - 25% growth expected',
    salaryRange: '$85k - $150k',
    description: 'Design, develop, and maintain software applications and systems',
    dailyTasks: ['Write and review code', 'Debug applications', 'Collaborate with team members', 'Design system architecture'],
    education: 'Bachelor\'s in Computer Science or equivalent experience',
    growthOpportunities: ['Senior Developer', 'Tech Lead', 'Engineering Manager', 'CTO']
  },
  'UX Design': {
    skills: ['Design Thinking', 'Prototyping', 'User Research', 'Visual Design'],
    outlook: 'Good - 13% growth expected',
    salaryRange: '$75k - $125k',
    description: 'Create intuitive and engaging user experiences for digital products',
    dailyTasks: ['Conduct user research', 'Create wireframes and prototypes', 'Design user interfaces', 'Test usability'],
    education: 'Bachelor\'s in Design, Psychology, or related field',
    growthOpportunities: ['Senior UX Designer', 'UX Manager', 'Design Director']
  },
  'Teaching': {
    skills: ['Communication', 'Patience', 'Subject Expertise', 'Classroom Management'],
    outlook: 'Stable - 8% growth expected',
    salaryRange: '$45k - $75k',
    description: 'Educate and inspire the next generation of learners',
    dailyTasks: ['Plan and deliver lessons', 'Grade assignments', 'Meet with parents', 'Professional development'],
    education: 'Bachelor\'s degree plus teaching certification',
    growthOpportunities: ['Department Head', 'Principal', 'Curriculum Specialist']
  },
  'Journalism': {
    skills: ['Writing', 'Research', 'Interviewing', 'Digital Media'],
    outlook: 'Declining - 3% decrease expected',
    salaryRange: '$40k - $85k',
    description: 'Investigate, research, and report on news and current events',
    dailyTasks: ['Research stories', 'Conduct interviews', 'Write articles', 'Meet deadlines'],
    education: 'Bachelor\'s in Journalism, Communications, or related field',
    growthOpportunities: ['Senior Reporter', 'Editor', 'News Director']
  },
  'Marketing': {
    skills: ['Communication', 'Analytics', 'Creativity', 'Digital Marketing'],
    outlook: 'Good - 10% growth expected',
    salaryRange: '$50k - $95k',
    description: 'Develop and execute marketing strategies to promote products and services',
    dailyTasks: ['Create marketing campaigns', 'Analyze market trends', 'Manage social media', 'Coordinate with teams'],
    education: 'Bachelor\'s in Marketing, Business, or related field',
    growthOpportunities: ['Marketing Manager', 'Brand Director', 'CMO']
  },
  'Psychology': {
    skills: ['Active Listening', 'Empathy', 'Research', 'Critical Thinking'],
    outlook: 'Good - 8% growth expected',
    salaryRange: '$60k - $120k',
    description: 'Help individuals understand and overcome mental health challenges',
    dailyTasks: ['Conduct therapy sessions', 'Assess mental health', 'Develop treatment plans', 'Maintain records'],
    education: 'Master\'s or Doctoral degree in Psychology',
    growthOpportunities: ['Clinical Supervisor', 'Private Practice Owner', 'Research Director']
  }
};
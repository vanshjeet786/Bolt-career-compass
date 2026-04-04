/**
 * Maps technical assessment category names to user-friendly labels.
 * Technical names are used in Detailed Analysis; friendly names in Overview & Profile.
 */

export const FRIENDLY_CATEGORY_NAMES: Record<string, string> = {
  // Layer 1 - Multiple Intelligences
  'Linguistic': 'Communication & Writing',
  'Logical-Mathematical': 'Problem Solving & Logic',
  'Visual-Spatial': 'Visual & Creative Thinking',
  'Interpersonal': 'Teamwork & Social Skills',
  'Intrapersonal': 'Self-Awareness & Motivation',
  'Naturalistic': 'Nature & Environmental Awareness',

  // Layer 2 - Personality Traits
  'MBTI': 'Personality Style',
  'Big Five - Openness': 'Creativity & Curiosity',
  'Big Five - Conscientiousness': 'Organization & Discipline',
  'Big Five - Extraversion': 'Social Energy & Confidence',

  // Layer 3 - Aptitudes & Skills
  'Numerical Aptitude': 'Number Skills',
  'Verbal Aptitude': 'Language & Vocabulary',
  'Technical Skills': 'Technical Know-How',

  // Layer 4 - Background & Environment
  'Educational Background': 'Academic Foundation',
  'Career Exposure': 'Industry Experience',

  // Layer 5 - Interests & Values
  'Interests and Passions': 'Passion & Curiosity',
  'Personal Goals and Values': 'Goals & Values',
};

/** Returns the user-friendly name for a category, or the original if no mapping exists. */
export const getFriendlyName = (technicalName: string): string => {
  return FRIENDLY_CATEGORY_NAMES[technicalName] || technicalName;
};

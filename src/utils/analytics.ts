import { Assessment } from '../types';

export type ViewMode = 'latest' | 'trend' | 'overall';

export interface Improvement {
  category: string;
  change: number;
  baselineScore: number;
  currentScore: number;
}

export interface Strength {
  category: string;
  score: number;
}

export interface CareerMatch {
  career: string;
  frequency: number;
  lastSeen?: Date;
}

const getNumberScore = (val: number | string | undefined): number | null => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

/**
 * Calculates areas where the user has improved.
 * Logic: Latest Score - Baseline Score > 0.3
 * Baseline depends on mode:
 * - latest: Score from immediate previous assessment
 * - trend: Average of previous 5 assessments
 * - overall: Average of all previous assessments
 */
export const calculateImprovements = (
  assessments: Assessment[],
  mode: ViewMode
): Improvement[] => {
  if (assessments.length < 2) return [];

  // Sort assessments chronologically (Oldest First)
  const sortedAssessments = [...assessments].sort((a, b) =>
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const latest = sortedAssessments[sortedAssessments.length - 1];
  const previousAssessments = sortedAssessments.slice(0, -1);
  
  // Define the baseline set of assessments based on mode
  let baselineSet: Assessment[] = [];

  if (mode === 'latest') {
    baselineSet = [previousAssessments[previousAssessments.length - 1]];
  } else if (mode === 'trend') {
    // Last 5 assessments BEFORE the current one
    baselineSet = previousAssessments.slice(-5);
  } else {
    // All previous assessments
    baselineSet = previousAssessments;
  }

  if (baselineSet.length === 0) return [];

  const improvements: Improvement[] = [];
  const latestScores = latest.scores as Record<string, number | string>;

  Object.entries(latestScores).forEach(([category, rawScore]) => {
    const currentScore = getNumberScore(rawScore);
    if (currentScore === null) return;

    // Calculate baseline average for this category
    let total = 0;
    let count = 0;

    baselineSet.forEach(a => {
      const s = getNumberScore((a.scores as Record<string, number | string>)[category]);
      if (s !== null) {
        total += s;
        count++;
      }
    });

    if (count === 0) return;

    const baselineScore = total / count;
    const change = currentScore - baselineScore;

    if (change > 0.3) {
      improvements.push({
        category,
        change,
        baselineScore,
        currentScore
      });
    }
  });

  return improvements.sort((a, b) => b.change - a.change);
};

/**
 * Calculates top strengths.
 * Logic: Top 3 categories by score.
 * - latest: Score from latest assessment
 * - trend: Average score over last 5 assessments (including current)
 * - overall: Average score over all assessments (including current)
 */
export const calculateTopStrengths = (
  assessments: Assessment[],
  mode: ViewMode
): Strength[] => {
  if (assessments.length === 0) return [];

  // Sort assessments chronologically (Oldest First)
  const sortedAssessments = [...assessments].sort((a, b) =>
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let targetAssessments: Assessment[] = [];

  if (mode === 'latest') {
    targetAssessments = [sortedAssessments[sortedAssessments.length - 1]];
  } else if (mode === 'trend') {
    targetAssessments = sortedAssessments.slice(-5);
  } else {
    targetAssessments = sortedAssessments;
  }
  
  const categoryTotals: Record<string, { total: number; count: number }> = {};

  targetAssessments.forEach(a => {
    Object.entries(a.scores as Record<string, number | string>).forEach(([cat, val]) => {
      const score = getNumberScore(val);
      if (score !== null) {
        if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, count: 0 };
        categoryTotals[cat].total += score;
        categoryTotals[cat].count++;
      }
    });
  });

  const strengths: Strength[] = Object.entries(categoryTotals)
    .map(([category, { total, count }]) => ({
      category,
      score: total / count
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return strengths;
};

/**
 * Calculates career matches.
 * Logic:
 * - latest: List from latest assessment (frequency = 1)
 * - trend: Most frequent in last 5 assessments (including current)
 * - overall: Most frequent in all assessments (including current)
 */
export const calculateCareerMatches = (
  assessments: Assessment[],
  mode: ViewMode
): CareerMatch[] => {
  if (assessments.length === 0) return [];

  // Sort assessments chronologically (Oldest First)
  const sortedAssessments = [...assessments].sort((a, b) =>
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let targetAssessments: Assessment[] = [];

  if (mode === 'latest') {
    // For latest, we just want the careers from the last assessment
    // But to keep data structure consistent, we can still run frequency on just one
    targetAssessments = [sortedAssessments[sortedAssessments.length - 1]];
  } else if (mode === 'trend') {
    targetAssessments = sortedAssessments.slice(-5);
  } else {
    targetAssessments = sortedAssessments;
  }

  const careerCounts: Record<string, { count: number; lastSeen: Date }> = {};

  targetAssessments.forEach(a => {
    a.recommendedCareers.forEach(career => {
      if (!careerCounts[career]) {
        careerCounts[career] = { count: 0, lastSeen: a.completedAt };
      }
      careerCounts[career].count++;
      // Update last seen if this assessment is newer
      if (new Date(a.completedAt) > new Date(careerCounts[career].lastSeen)) {
        careerCounts[career].lastSeen = a.completedAt;
      }
    });
  });

  const matches: CareerMatch[] = Object.entries(careerCounts)
    .map(([career, { count, lastSeen }]) => ({
      career,
      frequency: count,
      lastSeen
    }))
    .sort((a, b) => b.frequency - a.frequency); // Sort by frequency

  // If mode is 'latest', frequency will always be 1, so effectively just listing them.
  // We might want to cap the list for UI, but the function returns all sorted.
  return matches;
};

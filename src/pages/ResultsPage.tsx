import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Download, MessageCircle, Filter, ArrowUpDown, ExternalLink, TrendingUp, Award, Target, BookOpen, Users, Lightbulb, BarChart3, PieChart, Activity, Loader2, SaveAll, Sparkles, Brain, Star, Zap } from 'lucide-react';
import { Assessment, CareerRecommendation, User, ChatMessage } from '../types';
import { CAREER_DETAILS } from '../data/careerMapping';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { ResultsChart } from '../components/Results/ResultsChart';
import { CareerCard } from '../components/Results/CareerCard';
import { AIChat } from '../components/Results/AIChat';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';
import { supabase } from '../services/supabaseClient';
import { getFriendlyName } from '../utils/categoryNames';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ResultsPageProps {
  assessment: Assessment;
  user: User;
  previousAssessments?: Assessment[];
  onFinish?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ assessment, user, previousAssessments = [], onFinish }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'name'>('match');
  const [filterBy, setFilterBy] = useState<'all' | 'high-growth' | 'high-salary'>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'progress' | 'analytics'>('overview');
  const [aiEnhancedResults, setAiEnhancedResults] = useState<{
    insights: string;
    recommendations: Array<{ // 5-7 recommendations
      name: string;
      pros: string[];
      cons: string[];
      nextSteps: string[];
      layer6Match: string;
    }>;
    visualizationData: {
      labels: string[];
      baseScores: number[];
      enhancedScores: number[];
    };
    careerFitData: Array<{ // Bar chart data
      career: string;
      fitScore: number;
    }>;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [modalTab, setModalTab] = useState('insights');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const aiAnalysisRef = useRef<HTMLDivElement>(null);

  const handleModalClose = () => {
    aiAnalysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  useEffect(() => {
    const generateInsights = async () => {
      try {
        const insights = await aiService.generateCareerRecommendations(
          assessment.scores as Record<string, number>,
          assessment.responses,
          previousAssessments,
          assessment.backgroundInfo
        );
        setAiInsights(insights);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        setAiInsights('Your assessment results show strong potential across multiple career areas. Consider exploring the recommended careers that align with your top scoring categories.');
      } finally {
        setLoading(false);
      }
    };
    generateInsights();
  }, [assessment, previousAssessments]);
  const generateCareerRecommendations = (): CareerRecommendation[] => {
    // Show 5-6+ career options instead of limiting to 3
    const allCareers = assessment.recommendedCareers.slice(0, 8).map(career => {
      const details = CAREER_DETAILS[career];
      if (details) {
        return {
          name: career,
          match: Math.random() * 0.3 + 0.7,
          ...details
        };
      }
      return {
        name: career,
        match: Math.random() * 0.3 + 0.7,
        skills: ['Various skills required'],
        outlook: 'Positive growth expected',
        salaryRange: '$50k - $80k',
        description: 'A promising career path that aligns with your assessment results.',
        dailyTasks: ['Perform job-related tasks', 'Collaborate with team members'],
        education: 'Relevant degree or experience',
        growthOpportunities: ['Senior positions', 'Management roles']
      };
    }).sort((a, b) => b.match - a.match);
    return allCareers;
  };
  const filteredAndSortedCareers = () => {
    let careers = generateCareerRecommendations();

    if (filterBy === 'high-growth') {
      careers = careers.filter(career => 
        career.outlook.toLowerCase().includes('excellent') || 
        career.outlook.toLowerCase().includes('very good')
      );
    } else if (filterBy === 'high-salary') {
      careers = careers.filter(career => {
        const salaryMatch = career.salaryRange.match(/\$(\d+)k/);
        return salaryMatch && parseInt(salaryMatch[1]) >= 80;
      });
    }
    
    careers.sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return b.match - a.match;
        case 'salary': {
          const aSalary = parseInt(a.salaryRange.match(/\$(\d+)k/)?.[1] || '0');
          const bSalary = parseInt(b.salaryRange.match(/\$(\d+)k/)?.[1] || '0');
          return bSalary - aSalary;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    return careers;
  };
  const handleDownloadReport = async () => {
    try {
      await pdfService.generateReport({
        scores: assessment.scores as Record<string, number>,
        careers: assessment.recommendedCareers,
        recommendations: aiInsights,
        userName: user.name
      });
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
    }
  };

  const generateAIResults = async () => {
    if (aiEnhancedResults || aiLoading) return;
    
    setAiLoading(true);

    try {
      const enhancedResults = await aiService.generateEnhancedResults(
        numericalScores,
        assessment.responses,
        assessment.backgroundInfo
      );
      setAiEnhancedResults(enhancedResults);
    } catch (error) {
      console.error('Failed to generate enhanced results:', error);
      // Show error state but don't break the UI
    } finally {
      setAiLoading(false);
    }
  };
  const careerRecommendations = filteredAndSortedCareers();
  const numericalScores = Object.entries(assessment.scores)
    .reduce((acc, [key, value]) => {
      if (typeof value === 'number') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, number>);
  const friendlyStrengthNames: Record<string, string> = {
    'Linguistic': 'Communication & Language',
    'Logical-Mathematical': 'Logic & Numbers',
    'Visual-Spatial': 'Visual & Spatial Design',
    'Interpersonal': 'People & Teamwork',
    'Intrapersonal': 'Self-Reflection & Focus',
    'Naturalistic': 'Nature & Environment',
    'Musical': 'Music & Rhythm',
    'Bodily-Kinesthetic': 'Physical & Hands-on'
  };

  const getTopStrengths = () => {
    return Object.entries(numericalScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };
  const getProgressAnalysis = () => {
    if (previousAssessments.length === 0) return null;
    
    // Calculate the correct assessment number
    // previousAssessments are sorted newest first (descending order)
    // We need to find where the current assessment sits in the chronological history

    // Sort chronologically (oldest first) to determine the index
    const sortedAssessments = [...previousAssessments].sort((a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    // Find index of current assessment by comparing timestamps or IDs
    // If the current assessment is already in the history (viewing past result), we find its index
    // If it's a new assessment (just finished), it won't be in history yet, so it's last
    const currentAssessmentIndex = sortedAssessments.findIndex(a => a.id === assessment.id);
    const assessmentNumber = currentAssessmentIndex !== -1
      ? currentAssessmentIndex + 1
      : sortedAssessments.length + 1;

    // Use the immediately preceding assessment for comparison
    // If viewing #17, compare with #16. If viewing #1, no comparison.
    const comparisonAssessment = currentAssessmentIndex > 0
      ? sortedAssessments[currentAssessmentIndex - 1]
      : (currentAssessmentIndex === -1 ? sortedAssessments[sortedAssessments.length - 1] : null);

    const improvements: { category: string; change: number }[] = [];
    const declines: { category: string; change: number }[] = [];

    if (comparisonAssessment) {
      const lastScores = comparisonAssessment.scores as Record<string, number>;
      Object.entries(numericalScores).forEach(([category, currentScore]) => {
        const previousScore = lastScores[category];
        if (previousScore) {
          const change = currentScore - previousScore;
          if (change > 0.3) improvements.push({ category, change });
          else if (change < -0.3) declines.push({ category, change });
        }
      });
    }

    return { improvements, declines, totalAssessments: assessmentNumber };
  };
  const progressAnalysis = getProgressAnalysis();

  const analyticsSummary = useMemo(() => {
    const entries = Object.entries(numericalScores);
    if (!entries.length) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        consistencyScore: 0,
        strongestCategory: 'N/A'
      };
    }

    const scores = entries.map(([, score]) => score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const consistencyScore = Math.max(0, 100 - ((highestScore - lowestScore) / 5) * 100);
    const strongestCategory = entries.sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      averageScore,
      highestScore,
      lowestScore,
      consistencyScore,
      strongestCategory
    };
  }, [numericalScores]);

  const topAptitudesForAnalytics = useMemo(() => {
    return Object.entries(numericalScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([label, score]) => ({
        label: label.length > 16 ? `${label.substring(0, 16)}...` : label,
        fullLabel: label,
        score
      }));
  }, [numericalScores]);

  const topCareersForComparison = useMemo(() => {
    return careerRecommendations.slice(0, 3);
  }, [careerRecommendations]);

  const roadmapPhases = useMemo(() => {
    const enhancedRecommendations = aiEnhancedResults?.recommendations || [];
    const shortTerm = enhancedRecommendations.flatMap((rec) => rec.nextSteps.slice(0, 1));
    const mediumTerm = enhancedRecommendations.flatMap((rec) => rec.nextSteps.slice(1, 2));
    const longTerm = enhancedRecommendations.flatMap((rec) => rec.nextSteps.slice(2, 3));

    return [
      {
        phase: 'Short Term',
        timeframe: '0-3 months',
        color: 'border-blue-500',
        items: shortTerm.slice(0, 4)
      },
      {
        phase: 'Medium Term',
        timeframe: '3-12 months',
        color: 'border-amber-500',
        items: mediumTerm.slice(0, 4)
      },
      {
        phase: 'Long Term',
        timeframe: '1-3 years',
        color: 'border-emerald-500',
        items: longTerm.slice(0, 4)
      }
    ];
  }, [aiEnhancedResults]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left flex-1">
              <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                {progressAnalysis
                  ? `Assessment #${progressAnalysis.totalAssessments}${progressAnalysis.improvements.length > 0 ? ` - ${progressAnalysis.improvements.length} areas improved` : ''}`
                  : 'Your First Assessment'}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 font-heading">
                Your Career Blueprint
              </h1>
              <p className="text-lg text-white/80 mb-6 font-sans max-w-lg">
                Great work, {user.name}! We've analyzed your strengths and mapped them to career paths that fit you best.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Button
                  icon={Download}
                  onClick={handleDownloadReport}
                  size="md"
                  className="bg-white text-primary-700 hover:bg-gray-100 shadow-lg border-none rounded-full"
                >
                  Download Report
                </Button>
                <Button
                  icon={MessageCircle}
                  onClick={() => setShowChat(!showChat)}
                  size="md"
                  className="bg-white/15 text-white hover:bg-white/25 border border-white/30 rounded-full backdrop-blur-sm"
                >
                  {showChat ? 'Hide Chat' : 'AI Counselor'}
                </Button>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(analyticsSummary.averageScore / 5) * 327} 327`} />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{analyticsSummary.averageScore.toFixed(1)}</span>
                  <span className="text-sm text-white/70">out of 5.0</span>
                  <span className="text-xs text-white/50 mt-1">Average Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-white/70 mr-1">Top Strength:</span>
              <span className="font-semibold">{getFriendlyName(analyticsSummary.strongestCategory)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-white/70 mr-1">Peak Score:</span>
              <span className="font-semibold">{analyticsSummary.highestScore.toFixed(1)}/5.0</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm flex items-center">
              <Target className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-white/70 mr-1">Career Matches:</span>
              <span className="font-semibold">{careerRecommendations.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-2 inline-flex flex-wrap justify-center gap-2 border border-gray-100">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed Analysis', icon: PieChart },
              { id: 'progress', label: 'Progress', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Top Strengths - Visual Cards */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 font-heading flex items-center">
                    <Award className="w-6 h-6 mr-2 text-primary-600" />
                    Your Top Strengths
                  </h2>
                  <p className="text-gray-500 text-sm mb-5 font-sans ml-8">What you're naturally great at</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {getTopStrengths().slice(0, 3).map(([category, score], index) => {
                      const colors = [
                        { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50 border-blue-100', text: 'text-blue-700', bar: 'from-blue-400 to-indigo-500' },
                        { bg: 'from-purple-500 to-pink-600', light: 'bg-purple-50 border-purple-100', text: 'text-purple-700', bar: 'from-purple-400 to-pink-500' },
                        { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 border-amber-100', text: 'text-amber-700', bar: 'from-amber-400 to-orange-500' },
                      ];
                      const color = colors[index];
                      return (
                        <div key={category} className={`relative rounded-2xl border ${color.light} p-5 overflow-hidden`}>
                          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color.bg} opacity-10 rounded-bl-full`}></div>
                          <div className="flex items-center mb-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.bg} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                              {index + 1}
                            </div>
                            <span className="ml-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Strength</span>
                          </div>
                          <h3 className={`text-lg font-bold ${color.text} mb-1 font-heading`}>{getFriendlyName(category)}</h3>
                          <p className="text-xs text-gray-400 mb-3 font-sans">{category}</p>
                          <div className="flex items-end justify-between">
                            <div className="flex-1 mr-3">
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className={`bg-gradient-to-r ${color.bar} h-2 rounded-full transition-all duration-700`}
                                  style={{ width: `${((score as number) / 5) * 100}%` }} />
                              </div>
                            </div>
                            <span className={`text-xl font-bold ${color.text} font-heading`}>{(score as number).toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Strengths at a Glance */}
                <Card className="bg-white border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 font-heading flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary-600" />
                    Complete Strengths Profile
                  </h3>
                  <div className="space-y-3">
                    {getTopStrengths().map(([category, score]) => (
                      <div key={category} className="flex items-center group">
                        <div className="w-44 flex-shrink-0">
                          <p className="text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors">{getFriendlyName(category)}</p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-primary-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${((score as number) / 5) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-12 text-right">{(score as number).toFixed(1)}/5</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* AI Insights */}
                <Card className="bg-gradient-to-br from-white to-gray-50 border-primary-100 shadow-md">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-2xl mr-5 shadow-lg transform -rotate-3">
                      <Lightbulb className="w-6 h-6 text-white transform rotate-3" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 font-heading">AI Counselor Insights</h2>
                      {loading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-primary-100 rounded w-3/4"></div>
                          <div className="h-4 bg-primary-100 rounded w-1/2"></div>
                          <div className="h-4 bg-primary-100 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <div className="prose max-w-none text-gray-600 font-sans text-sm leading-relaxed">
                          {aiInsights.split('\n').map((paragraph, index) => (
                            paragraph.trim() && <p key={index} className="mb-3">{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Top Strengths Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getTopStrengths().slice(0, 3).map(([category, score], index) => (
                    <Card key={category} className="relative overflow-hidden text-center bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full opacity-50 pointer-events-none"></div>
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl mb-5 shadow-lg transform rotate-3">
                        <Target className="w-7 h-7 text-white transform -rotate-3" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 font-heading">#{index + 1} Strength</h3>
                      <p className="text-xl text-gray-900 font-bold font-heading mb-1">{friendlyStrengthNames[category] || category}</p>
                      <div className="flex items-center justify-center mt-3">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                          {(score as number).toFixed(1)}
                        </span>
                        <span className="text-gray-400 font-medium ml-1">/5.0</span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Strengths Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResultsChart
                    scores={numericalScores}
                    type="bar"
                    title="Your Strengths Breakdown"
                  />
                  <ResultsChart
                    scores={numericalScores}
                    type="radar"
                    title="Aptitude Profile"
                  />
                </div>
              </>
            )}

            {activeTab === 'detailed' && (
              <>
                {/* Detailed Analysis by Category */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">Detailed Analysis by Category</h2>
                  
                  {/* Intelligence Analysis */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-md">
                    <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center font-heading">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      Multiple Intelligences Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {Object.entries(numericalScores)
                        .filter(([category]) => ['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-gray-800 font-heading">{category}</h4>
                              <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold font-sans">{(score as number).toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-blue-50 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${((score as number) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>

                  {/* Personality Analysis */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-md">
                    <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center font-heading">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      Personality & Aptitude Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {Object.entries(numericalScores)
                        .filter(([category]) => !['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-bold text-gray-800 font-heading">{category}</h4>
                              <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-sm font-bold font-sans">{(score as number).toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-purple-50 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${((score as number) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'progress' && (
              <>
                {/* Progress Tracking */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">Progress Tracking</h2>
                  
                  {progressAnalysis ? (
                    <>
                      <Card className="bg-green-50 border-green-100">
                        <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center font-heading">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Your Growth Journey
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-green-700 mb-3 font-heading">Areas of Improvement</h4>
                            {progressAnalysis.improvements.length > 0 ? (
                              <div className="space-y-2">
                                {progressAnalysis.improvements.map(({ category, change }) => (
                                  <div key={category} className="flex items-center justify-between bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                                    <span className="text-gray-700 font-sans">{getFriendlyName(category)}</span>
                                    <span className="text-green-600 font-bold font-sans">+{change.toFixed(1)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 font-sans">No significant improvements detected since last assessment.</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 font-heading">Assessment History</h4>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <p className="text-2xl font-bold text-primary-600">{progressAnalysis.totalAssessments}</p>
                              <p className="text-gray-500 font-sans">Total Assessments Completed</p>
                              <p className="text-sm text-gray-400 mt-2 font-sans">
                                Last assessment: {new Date(previousAssessments[previousAssessments.length - 1]?.completedAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : (
                    <Card className="text-center py-12 bg-white">
                      <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-500 mb-2 font-heading">First Assessment Complete!</h3>
                      <p className="text-gray-400 font-sans">Take another assessment in the future to track your progress and growth.</p>
                    </Card>
                  )}
                </div>
              </>
            )}


            {activeTab === 'analytics' && (
              <>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">Analytics Dashboard</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="bg-white border-gray-100">
                      <p className="text-sm text-gray-500 font-sans">Average Score</p>
                      <p className="text-3xl font-bold text-primary-700 font-heading">{analyticsSummary.averageScore.toFixed(2)}</p>
                    </Card>
                    <Card className="bg-white border-gray-100">
                      <p className="text-sm text-gray-500 font-sans">Strongest Area</p>
                      <p className="text-xl font-bold text-secondary-700 font-heading">{getFriendlyName(analyticsSummary.strongestCategory)}</p>
                    </Card>
                    <Card className="bg-white border-gray-100">
                      <p className="text-sm text-gray-500 font-sans">Peak Score</p>
                      <p className="text-3xl font-bold text-green-700 font-heading">{analyticsSummary.highestScore.toFixed(2)}</p>
                    </Card>
                    <Card className="bg-white border-gray-100">
                      <p className="text-sm text-gray-500 font-sans">Profile Consistency</p>
                      <p className="text-3xl font-bold text-amber-700 font-heading">{analyticsSummary.consistencyScore.toFixed(0)}%</p>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Top Aptitudes & Skills</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topAptitudesForAnalytics} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" angle={-35} textAnchor="end" interval={0} height={70} fontSize={12} />
                            <YAxis domain={[0, 5]} />
                            <Tooltip formatter={(value: number, _name: string, props: { payload?: { fullLabel?: string } }) => [`${Number(value).toFixed(1)}/5.0`, props.payload?.fullLabel || 'Category']} />
                            <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="bg-white border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Base vs AI-Enhanced Comparison</h3>
                      {aiEnhancedResults ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={aiEnhancedResults.visualizationData.labels.map((label, i) => ({
                                label: label.length > 12 ? `${label.substring(0, 12)}...` : label,
                                fullLabel: label,
                                base: aiEnhancedResults.visualizationData.baseScores[i] || 0,
                                enhanced: aiEnhancedResults.visualizationData.enhancedScores[i] || 0
                              }))}
                            >
                              <PolarGrid />
                              <PolarAngleAxis dataKey="label" fontSize={11} />
                              <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
                              <Radar name="Base" dataKey="base" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                              <Radar name="AI Enhanced" dataKey="enhanced" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                              <Legend />
                              <Tooltip formatter={(value: number, _name: string, props: { payload?: { fullLabel?: string } }) => [`${Number(value).toFixed(1)}/5.0`, props.payload?.fullLabel || 'Category']} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800 font-sans">
                          Generate AI-Enhanced Analysis to unlock comparison analytics.
                        </div>
                      )}
                    </Card>
                  </div>

                  <Card className="bg-white border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Top Match Comparison Matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-200">
                            <th className="py-3 pr-4">Factor</th>
                            {topCareersForComparison.map((career) => (
                              <th key={career.name} className="py-3 pr-4">{career.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium">Match</td>
                            {topCareersForComparison.map((career) => (
                              <td key={`${career.name}-match`} className="py-3 pr-4">{Math.round(career.match * 100)}%</td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium">Salary Range</td>
                            {topCareersForComparison.map((career) => (
                              <td key={`${career.name}-salary`} className="py-3 pr-4">{career.salaryRange}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">Education</td>
                            {topCareersForComparison.map((career) => (
                              <td key={`${career.name}-edu`} className="py-3 pr-4">{career.education}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {roadmapPhases.some((phase) => phase.items.length > 0) && (
                    <Card className="bg-white border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Career Transition Roadmap</h3>
                      <div className="space-y-4">
                        {roadmapPhases.map((phase) => (
                          <div key={phase.phase} className={`border-l-4 ${phase.color} bg-gray-50 rounded-r-xl p-4`}>
                            <p className="font-semibold text-gray-900 font-heading">{phase.phase} • <span className="text-gray-500 text-sm">{phase.timeframe}</span></p>
                            {phase.items.length ? (
                              <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1 font-sans">
                                {phase.items.map((item, index) => <li key={`${phase.phase}-${index}`}>{item}</li>)}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 mt-2 font-sans">Generate AI-enhanced results to personalize this phase.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </>
            )}

            {/* Career Recommendations - Always visible */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">
                Recommended Career Paths
              </h2>
              
              {/* Enhanced Filters and Sorting */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as any)}
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                    >
                      <option value="all">All Careers</option>
                      <option value="high-growth">High Growth</option>
                      <option value="high-salary">High Salary ($80k+)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans"
                    >
                      <option value="match">Best Match</option>
                      <option value="salary">Salary Range</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 font-sans">
                  Showing {careerRecommendations.length} career{careerRecommendations.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerRecommendations.map((career, index) => (
                  <CareerCard key={index} career={career} />
                ))}
              </div>
              
              {/* Enhanced Next Steps Section */}
              <div className="bg-gradient-to-r from-primary-50 via-purple-50 to-secondary-50 p-8 rounded-3xl border border-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-heading">Ready to Take Action?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a
                    href="https://www.linkedin.com/jobs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100"
                  >
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <ExternalLink className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors font-heading">Find Jobs</h4>
                      <p className="text-sm text-gray-500 font-sans">Search for opportunities</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.coursera.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100"
                  >
                    <div className="bg-primary-50 p-3 rounded-full mr-4">
                      <BookOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors font-heading">Learn Skills</h4>
                      <p className="text-sm text-gray-500 font-sans">Take online courses</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.mentorship.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-gray-100"
                  >
                    <div className="bg-secondary-50 p-3 rounded-full mr-4">
                      <Users className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-secondary-600 transition-colors font-heading">Find Mentors</h4>
                      <p className="text-sm text-gray-500 font-sans">Connect with experts</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Instructional Paragraph */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
            <p className="text-gray-700 leading-relaxed font-sans">
              <strong className="text-blue-700">How Your Results Work:</strong> Your scores are calculated from your responses across five areas: intelligences, personality, skills, background, and interests.
              Your written reflections from the self-assessment section are used by the AI to provide more personalized
              guidance in the chat and enhanced analysis below.
            </p>
          </div>

          {/* AI-Enhanced Results Trigger */}
          <div ref={aiAnalysisRef}>
            <button
              onClick={() => {
                generateAIResults();
                setIsAiModalOpen(true);
              }}
              className="w-full text-left"
            >
              <div className="w-full bg-gradient-to-r from-secondary-500 to-amber-500 text-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center relative z-10">
                  <div className="bg-white/20 p-4 rounded-full mr-6 shadow-lg backdrop-blur-sm">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-heading">AI-Enhanced Career Analysis</h2>
                    <p className="text-lg opacity-90 mt-1 font-sans">Unlock personalized insights with our most powerful analysis</p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* AI-Enhanced Results Modal */}
          <Modal
            isOpen={isAiModalOpen}
            onClose={() => {
              handleModalClose();
              setTimeout(() => {
                setIsAiModalOpen(false);
              }, 300); // Allow time for scroll animation
            }}
          >
            <div className="text-gray-900 p-2">
              {aiLoading ? (
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="mt-6 text-center text-gray-900">
                    <h3 className="text-lg font-semibold mb-2 font-heading">Analyzing Your Complete Profile</h3>
                    <p className="text-gray-500 font-sans">Our AI is processing your responses...</p>
                  </div>
                </div>
              ) : aiEnhancedResults ? (
                <div>
                  {/* Tab Navigation */}
                  <div className="flex justify-center border-b border-gray-200 mb-8">
                    {['insights', 'analysis', 'roadmap'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setModalTab(tab)}
                        className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 focus:outline-none font-heading ${
                          modalTab === tab
                            ? 'text-secondary-600 border-b-2 border-secondary-600'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="animate-fade-in p-6">
                    {modalTab === 'insights' && (
                      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <h3 className="text-3xl font-bold mb-6 text-secondary-600 flex items-center font-heading">
                          <Lightbulb className="w-7 h-7 mr-3" />
                          Comprehensive AI Analysis
                        </h3>
                        <div className="prose max-w-none text-lg leading-relaxed text-gray-700 font-sans">
                          {aiEnhancedResults.insights.split('\n\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalTab === 'analysis' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Enhanced Visualization */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                          <h3 className="text-2xl font-bold mb-4 text-green-700 font-heading">Enhanced Score Analysis</h3>
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={aiEnhancedResults.visualizationData.labels.map((label, i) => ({
                                  label: label.length > 12 ? label.substring(0, 12) + '...' : label,
                                  fullLabel: label,
                                  base: aiEnhancedResults.visualizationData.baseScores[i] || 0,
                                  enhanced: aiEnhancedResults.visualizationData.enhancedScores[i] || 0
                                }))}
                              >
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="label" tick={{ fill: '#374151' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#9ca3af' }} />
                                <Radar name="Base Score" dataKey="base" stroke="#fb923c" fill="#fb923c" fillOpacity={0.4} />
                                <Radar name="AI-Enhanced" dataKey="enhanced" stroke="#34d399" fill="#34d399" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#1f2937' }} itemStyle={{ color: '#1f2937' }} />
                                <Legend wrapperStyle={{ color: '#374151' }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Career Fit Scores */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                          <h3 className="text-2xl font-bold mb-4 text-green-700 font-heading">Career Compatibility Matrix</h3>
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={aiEnhancedResults.careerFitData} layout="vertical" margin={{ left: 100 }}>
                                <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#374151' }} />
                                <YAxis type="category" dataKey="career" width={100} tick={{ fill: '#374151' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#1f2937' }} itemStyle={{ color: '#1f2937' }} />
                                <Bar dataKey="fitScore" fill="url(#fitGradient)" radius={[0, 4, 4, 0]} />
                                <defs>
                                  <linearGradient id="fitGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#2dd4bf" />
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {modalTab === 'roadmap' && (
                      <div>
                        <h3 className="text-3xl font-bold mb-8 text-center text-secondary-600 font-heading">Personalized Career Roadmap</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {aiEnhancedResults.recommendations.map((rec, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                              <h4 className="font-bold text-xl mb-4 text-secondary-600 flex items-center font-heading">
                                <span className="text-gray-400 mr-3">#{index + 1}</span> {rec.name}
                              </h4>
                              <div className="mb-4">
                                <p className="font-semibold text-green-600 mb-2 font-sans">Advantages</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 font-sans">
                                  {rec.pros.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                              </div>
                              <div className="mb-4">
                                <p className="font-semibold text-yellow-600 mb-2 font-sans">Considerations</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 font-sans">
                                  {rec.cons.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                              </div>
                              <div>
                                <p className="font-semibold text-blue-600 mb-2 font-sans">Action Plan</p>
                                <ul className="space-y-2 text-gray-700 font-sans">
                                  {rec.nextSteps.map((step, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">{i + 1}</span>
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-6 text-gray-900">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 font-heading">Ready for Deep Insights?</h3>
                  <p className="max-w-md mx-auto text-gray-500 font-sans">
                    Click the button to generate comprehensive AI-enhanced insights for a complete career analysis.
                  </p>
                </div>
              )}
            </div>
          </Modal>

          {/* Enhanced Chat Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              {showChat ? (
                <AIChat 
                  userResults={{
                    scores: numericalScores,
                    careers: assessment.recommendedCareers,
                    previousAssessments,
                    backgroundInfo: assessment.backgroundInfo
                  }} 
                />
              ) : (
                <Card className="text-center bg-white border-primary-100">
                  <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">Need Guidance?</h3>
                  <p className="text-gray-500 mb-4 font-sans">Chat with our AI counselor for personalized advice about your results.</p>
                  <Button
                    icon={MessageCircle}
                    onClick={() => setShowChat(true)}
                    className="w-full bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Start Conversation
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Finish Assessment Button */}
        {onFinish && (
          <div className="mt-12 mb-8 flex justify-center">
            <Button
              onClick={onFinish}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-12 py-4 text-lg rounded-full"
              icon={SaveAll}
            >
              Finish Assessment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

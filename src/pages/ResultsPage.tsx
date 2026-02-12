import React, { useState, useEffect, useRef } from 'react';
import { Download, MessageCircle, Filter, ArrowUpDown, ExternalLink, TrendingUp, Award, Target, BookOpen, Users, Lightbulb, BarChart3, PieChart, Activity, Loader2, SaveAll } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'progress'>('overview');
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
        case 'salary':
          const aSalary = parseInt(a.salaryRange.match(/\$(\d+)k/)?.[1] || '0');
          const bSalary = parseInt(b.salaryRange.match(/\$(\d+)k/)?.[1] || '0');
          return bSalary - aSalary;
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
  return (
    <div className="min-h-screen bg-gray-50 py-8 text-gray-900">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-6 mx-auto shadow-xl">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 font-heading">
            <span className="bg-gradient-to-r from-primary-600 to-purple-500 bg-clip-text text-transparent">
              Your Career Assessment Results
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 font-sans">
            Congratulations, {user.name}! Here's your personalized career guidance.
          </p>
  
          {progressAnalysis && (
            <div className="bg-white border border-gray-200 rounded-full px-6 py-2 mb-6 inline-block shadow-sm">
              <p className="text-primary-700 font-medium font-sans">
                Assessment #{progressAnalysis.totalAssessments} • 
                {progressAnalysis.improvements.length > 0 && (
                  <span className="text-secondary-600 ml-2"> {progressAnalysis.improvements.length} areas improved</span>
                )}
              </p>
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button
              icon={Download}
              onClick={handleDownloadReport}
              variant="secondary"
              size="lg"
            >
              Download PDF Report
            </Button>
            <Button
              icon={MessageCircle}
              onClick={() => setShowChat(!showChat)}
              variant="outline"
              size="lg"
            >
              {showChat ? 'Hide Chat' : 'Chat with AI Counselor'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-2 inline-flex border border-gray-100">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed Analysis', icon: PieChart },
              { id: 'progress', label: 'Progress Tracking', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* AI Insights */}
                <Card className="bg-white border-primary-100">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-3 rounded-full mr-4 shadow-lg">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">AI Counselor Insights</h2>
                      {loading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <div className="prose max-w-none text-gray-600 font-sans">
                          {aiInsights.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Top Strengths Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getTopStrengths().slice(0, 3).map(([category, score], index) => (
                    <Card key={category} className="text-center bg-white border-gray-100">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-4 shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 font-heading">#{index + 1} Strength</h3>
                      <p className="text-primary-600 font-semibold font-sans">{category}</p>
                      <p className="text-2xl font-bold text-primary-700 mt-2 font-sans">{(score as number).toFixed(1)}/5.0</p>
                    </Card>
                  ))}
                </div>

                {/* Strengths Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResultsChart
                    scores={numericalScores}
                    type="bar"
                    title="Your Intelligence Strengths"
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
                  <Card className="bg-blue-50 border-blue-100">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center font-heading">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Multiple Intelligences Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(numericalScores)
                        .filter(([category]) => ['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800 font-heading">{category}</h4>
                              <span className="text-blue-600 font-bold font-sans">{(score as number).toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${((score as number) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>

                  {/* Personality Analysis */}
                  <Card className="bg-purple-50 border-purple-100">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center font-heading">
                      <Users className="w-5 h-5 mr-2" />
                      Personality & Aptitude Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(numericalScores)
                        .filter(([category]) => !['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800 font-heading">{category}</h4>
                              <span className="text-purple-600 font-bold font-sans">{(score as number).toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
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
                                    <span className="text-gray-700 font-sans">{category}</span>
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
              <strong className="text-blue-700">About Your Results:</strong> The above results are calculated using your quantitative responses from Layers 1-5 (Multiple Intelligences, Personality Traits, Aptitudes & Skills, Background & Environment, and Interests & Values).
              Layer 6's open-ended responses have been used qualitatively to inform and train the AI for more personalized 
              guidance in the chat section and enhanced analysis below.
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

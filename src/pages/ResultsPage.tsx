import React, { useState, useEffect } from 'react';
import { Download, MessageCircle, Filter, ArrowUpDown, ExternalLink, TrendingUp, Award, Target, BookOpen, Users, Lightbulb, BarChart3, PieChart, Activity, Loader2 } from 'lucide-react';
import { Assessment, CareerRecommendation, User, ChatMessage } from '../types';
import { CAREER_DETAILS } from '../data/careerMapping';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ assessment, user, previousAssessments = [] }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'name'>('match');
  const [filterBy, setFilterBy] = useState<'all' | 'high-growth' | 'high-salary'>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'progress'>('overview');
  const [aiEnhancedResults, setAiEnhancedResults] = useState<{
    insights: string; // 2-3 paragraphs
    recommendations: Array<{ // 5-7 recommendations
      name: string;
      pros: string[]; // 2-3 bullet points
      cons: string[]; // 1-2 bullet points
      nextSteps: string[]; // 2-3 actionable steps
      layer6Match: string; // 1-2 sentences explaining Layer 6 alignment
    }>;
    visualizationData: {
      labels: string[];
      baseScores: number[];
      enhancedScores: number[];
    };
    careerFitData: Array<{ // Bar chart data
      career: string;
      fitScore: number; // 0-5 scale
    }>;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Save assessment to Supabase on component mount
  useEffect(() => {
    const saveAssessment = async () => {
      try {
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            current_layer: 6,
            status: 'completed',
            completed_at: assessment.completedAt.toISOString(),
            scores: assessment.scores,
            recommended_careers: assessment.recommendedCareers,
            ml_prediction: assessment.mlPrediction
          })
          .select()
          .single();

        if (assessmentError) throw assessmentError;

        const responsesToSave = assessment.responses.map(response => ({
          assessment_id: assessmentData.id,
          layer_number: parseInt(response.layerId.replace('layer', '')),
          question_id: response.questionId,
          question_text: response.questionText,
          response_value: response.response,
          category_id: response.categoryId
        }));

        const { error: responsesError } = await supabase
          .from('assessment_responses')
          .insert(responsesToSave);

        if (responsesError) throw responsesError;

        console.log('Assessment saved successfully');
      } catch (error) {
        console.error('Failed to save assessment:', error);
      }
    };

    saveAssessment();
  }, [assessment, user.id]);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        const insights = await aiService.generateCareerRecommendations(
          assessment.scores as Record<string, number>,
          assessment.responses,
          previousAssessments
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
        assessment.responses
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
    
    const lastAssessment = previousAssessments[previousAssessments.length - 1];
    const lastScores = lastAssessment.scores as Record<string, number>;
    const improvements = [];
    const declines = [];
    
    Object.entries(numericalScores).forEach(([category, currentScore]) => {
      const previousScore = lastScores[category];
      if (previousScore) {
        const change = currentScore - previousScore;
        if (change > 0.3) improvements.push({ category, change });
        else if (change < -0.3) declines.push({ category, change });
      }
    });
    
    return { improvements, declines, totalAssessments: previousAssessments.length + 1 };
  };

  const progressAnalysis = getProgressAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-6 mx-auto">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Your Career Assessment Results
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Congratulations, {user.name}! Here's your personalized career guidance.
          </p>
          {progressAnalysis && (
            <div className="bg-gradient-to-r from-vibrant-100 to-primary-100 rounded-lg p-4 mb-6 inline-block">
              <p className="text-vibrant-800 font-medium">
                Assessment #{progressAnalysis.totalAssessments} • 
                {progressAnalysis.improvements.length > 0 && (
                  <span className="text-vibrant-600"> {progressAnalysis.improvements.length} areas improved</span>
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
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed Analysis', icon: PieChart },
              { id: 'progress', label: 'Progress Tracking', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
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
                <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-3 rounded-full mr-4">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Counselor Insights</h2>
                      {loading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <div className="prose prose-blue max-w-none">
                          {aiInsights.split('\n').map((paragraph, index) => (
                            <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Top Strengths Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getTopStrengths().slice(0, 3).map(([category, score], index) => (
                    <Card key={category} className="text-center bg-gradient-to-br from-white to-primary-50 border-primary-200">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-4">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">#{index + 1} Strength</h3>
                      <p className="text-primary-700 font-semibold">{category}</p>
                      <p className="text-2xl font-bold text-primary-600 mt-2">{score.toFixed(1)}/5.0</p>
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
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Detailed Analysis by Category</h2>
                  
                  {/* Intelligence Analysis */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Multiple Intelligences Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(numericalScores)
                        .filter(([category]) => ['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800">{category}</h4>
                              <span className="text-blue-600 font-bold">{score.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(score / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>

                  {/* Personality Analysis */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Personality & Aptitude Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(numericalScores)
                        .filter(([category]) => !['Linguistic', 'Logical-Mathematical', 'Visual-Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic'].includes(category))
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, score]) => (
                          <div key={category} className="bg-white p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-gray-800">{category}</h4>
                              <span className="text-purple-600 font-bold">{score.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(score / 5) * 100}%` }}
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
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Progress Tracking</h2>
                  
                  {progressAnalysis ? (
                    <>
                      <Card className="bg-gradient-to-r from-vibrant-50 to-green-50 border-vibrant-200">
                        <h3 className="text-xl font-bold text-vibrant-800 mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Your Growth Journey
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-vibrant-700 mb-3">Areas of Improvement</h4>
                            {progressAnalysis.improvements.length > 0 ? (
                              <div className="space-y-2">
                                {progressAnalysis.improvements.map(({ category, change }) => (
                                  <div key={category} className="flex items-center justify-between bg-white p-3 rounded-lg">
                                    <span className="text-gray-800">{category}</span>
                                    <span className="text-vibrant-600 font-bold">+{change.toFixed(1)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-600">No significant improvements detected since last assessment.</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Assessment History</h4>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-2xl font-bold text-primary-600">{progressAnalysis.totalAssessments}</p>
                              <p className="text-gray-600">Total Assessments Completed</p>
                              <p className="text-sm text-gray-500 mt-2">
                                Last assessment: {new Date(previousAssessments[previousAssessments.length - 1]?.completedAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </>
                  ) : (
                    <Card className="text-center py-12">
                      <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2">First Assessment Complete!</h3>
                      <p className="text-gray-500">Take another assessment in the future to track your progress and growth.</p>
                    </Card>
                  )}
                </div>
              </>
            )}

            {/* Career Recommendations - Always visible */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Recommended Career Paths
              </h2>
              
              {/* Enhanced Filters and Sorting */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Careers</option>
                      <option value="high-growth">High Growth</option>
                      <option value="high-salary">High Salary ($80k+)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="salary">Salary Range</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-primary-50 px-3 py-1 rounded-full">
                  Showing {careerRecommendations.length} career{careerRecommendations.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerRecommendations.map((career, index) => (
                  <CareerCard key={index} career={career} />
                ))}
              </div>
              
              {/* Enhanced Next Steps Section */}
              <div className="bg-gradient-to-r from-primary-50 via-purple-50 to-secondary-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ready to Take Action?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <a
                    href="https://www.linkedin.com/jobs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full mr-4">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Find Jobs</h4>
                      <p className="text-sm text-gray-600">Search for opportunities</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.coursera.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-gradient-to-r from-vibrant-500 to-vibrant-600 p-3 rounded-full mr-4">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-vibrant-600 transition-colors">Learn Skills</h4>
                      <p className="text-sm text-gray-600">Take online courses</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.mentorship.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="bg-gradient-to-r from-secondary-500 to-accent-500 p-3 rounded-full mr-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-secondary-600 transition-colors">Find Mentors</h4>
                      <p className="text-sm text-gray-600">Connect with experts</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Instructional Paragraph */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              <strong>About Your Results:</strong> The above results are calculated using your quantitative responses from Layers 1-5 
              (Multiple Intelligences, Personality Traits, Aptitudes & Skills, Background & Environment, and Interests & Values). 
              Layer 6's open-ended responses have been used qualitatively to inform and train the AI for more personalized 
              guidance in the chat section and enhanced analysis below.
            </p>
          </div>

          {/* AI-Enhanced Results Accordion */}
          <div className="mb-8">
            <div className="border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl overflow-hidden shadow-lg">
              <AccordionTrigger 
                onClick={() => {
                  setIsAccordionOpen(!isAccordionOpen);
                  if (!isAccordionOpen) {
                    generateAIResults();
                  }
                }}
                className="w-full flex items-center justify-between p-6 text-left bg-gradient-to-r from-primary-50 to-purple-50 hover:from-primary-100 hover:to-purple-100 transition-all duration-200 text-lg font-semibold text-primary-800 hover:text-primary-900 border-none"
              >
                <span className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">AI-Enhanced Career Analysis</div>
                    <div className="text-sm text-primary-600 font-normal">Comprehensive insights powered by your Layer 6 responses</div>
                  </div>
                </span>
                <div className={`transform transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </AccordionTrigger>
              
              {isAccordionOpen && (
                <div className="bg-white border-t border-primary-200">
                {aiLoading ? (
                  <div className="flex flex-col justify-center items-center py-16 px-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyzing Your Complete Profile</h3>
                      <p className="text-gray-600">Our AI is processing your responses to generate personalized career insights...</p>
                      <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                ) : aiEnhancedResults ? (
                  <div className="p-8 space-y-10">
                    {/* AI-Generated Insights */}
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">Comprehensive AI Analysis</h3>
                          <p className="text-purple-600 font-medium">Based on your complete assessment profile</p>
                        </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                        <div className="prose prose-blue max-w-none">
                          {aiEnhancedResults.insights.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="text-gray-800 mb-4 leading-relaxed text-lg">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Personalized Career Recommendations */}

                    {/* Enhanced Visualization */}
                    {aiEnhancedResults.visualizationData && (
                      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">Enhanced Score Analysis</h3>
                            <p className="text-blue-600 font-medium">Base scores vs. AI-adjusted with Layer 6 insights</p>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart 
                                data={aiEnhancedResults.visualizationData.labels.map((label, i) => ({
                                  label: label.length > 12 ? label.substring(0, 12) + '...' : label,
                                  fullLabel: label,
                                  base: aiEnhancedResults.visualizationData.baseScores[i] || 0,
                                  enhanced: aiEnhancedResults.visualizationData.enhancedScores[i] || 0
                                }))}
                                margin={{ top: 40, right: 60, left: 60, bottom: 40 }}
                              >
                                <PolarGrid stroke="#e0e7ff" />
                                <PolarAngleAxis dataKey="label" fontSize={12} fontWeight="500" />
                                <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} fontSize={11} />
                                <Radar
                                  name="Base Score (Layers 1-5)"
                                  dataKey="base"
                                  stroke="#6366f1"
                                  fill="#6366f1"
                                  fillOpacity={0.2}
                                  strokeWidth={3}
                                />
                                <Radar
                                  name="AI-Enhanced Score (+ Layer 6)"
                                  dataKey="enhanced"
                                  stroke="#10b981"
                                  fill="#10b981"
                                  fillOpacity={0.3}
                                  strokeWidth={3}
                                />
                                <Tooltip 
                                  formatter={(value, name, props) => [
                                    `${Number(value).toFixed(1)}/5.0`, 
                                    name,
                                    props.payload.fullLabel
                                  ]}
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Legend 
                                  wrapperStyle={{
                                    paddingTop: '20px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                  }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <p className="font-semibold text-blue-900 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Understanding Your Enhanced Scores
                            </p>
                            <p>
                              The <span className="text-indigo-600 font-semibold">indigo area</span> represents your quantitative assessment scores (Layers 1-5). 
                              The <span className="text-emerald-600 font-semibold">green area</span> shows AI-enhanced scores that integrate your personal reflections 
                              and goals from Layer 6, providing a more holistic view of your career potential.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Career Fit Scores Bar Chart */}
                    {aiEnhancedResults.careerFitData && aiEnhancedResults.careerFitData.length > 0 && (
                      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 border border-emerald-200 shadow-lg">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">Career Compatibility Matrix</h3>
                            <p className="text-emerald-600 font-medium">AI-calculated fit scores for your top career matches</p>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                          <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={aiEnhancedResults.careerFitData} 
                                margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                <XAxis
                                  dataKey="career"
                                  angle={-45}
                                  textAnchor="end"
                                  height={120}
                                  interval={0}
                                  fontSize={13}
                                  fontWeight="500"
                                />
                                <YAxis 
                                  domain={[0, 5]} 
                                  fontSize={12}
                                  fontWeight="500"
                                />
                                <Tooltip
                                  formatter={(value, name, props) => [
                                    `${Number(value).toFixed(1)}/5.0`,
                                    props.payload.career
                                  ]}
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Bar 
                                  dataKey="fitScore" 
                                  fill="url(#careerFitGradient)" 
                                  radius={[6, 6, 0, 0]}
                                  stroke="#059669"
                                  strokeWidth={1}
                                />
                                <defs>
                                  <linearGradient id="careerFitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                            <p className="font-semibold text-emerald-900 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Career Compatibility Insights
                            </p>
                            <p>
                              These scores represent your compatibility with different career paths, calculated using advanced AI analysis of your complete profile. 
                              Higher scores indicate stronger alignment with your skills, personality, and personal aspirations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personalized Career Recommendations */}
                    {aiEnhancedResults.recommendations && aiEnhancedResults.recommendations.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-8 border border-amber-200 shadow-lg">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">Personalized Career Roadmap</h3>
                            <p className="text-amber-600 font-medium">Tailored recommendations based on your complete profile</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {aiEnhancedResults.recommendations.map((rec, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                              <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">{index + 1}</span>
                                </div>
                                <h4 className="font-bold text-xl text-gray-800">{rec.name}</h4>
                              </div>
                              
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg mb-4 border border-amber-200">
                                <p className="text-sm font-medium text-amber-800 mb-1">Personal Alignment</p>
                                <p className="text-amber-700">{rec.layer6Match}</p>
                              </div>

                              <div className="space-y-4 mb-4">
                                {rec.pros && rec.pros.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-emerald-700 flex items-center mb-2">
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Advantages
                                    </p>
                                    <ul className="space-y-1">
                                      {rec.pros.map((item, i) => (
                                        <li key={i} className="flex items-start text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {rec.cons && rec.cons.length > 0 && (
                                  <div>
                                    <p className="font-semibold text-red-700 flex items-center mb-2">
                                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-2-9a1 1 0 000 2v4a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      Considerations
                                    </p>
                                    <ul className="space-y-1">
                                      {rec.cons.map((item, i) => (
                                        <li key={i} className="flex items-start text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {rec.nextSteps && rec.nextSteps.length > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                  <p className="font-semibold text-blue-800 mb-3 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Action Plan
                                  </p>
                                  <ul className="space-y-2">
                                    {rec.nextSteps.map((step, i) => (
                                      <li key={i} className="flex items-start text-blue-800">
                                        <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                                          {i + 1}
                                        </span>
                                        {step}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lightbulb className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Ready for Deep Insights?</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Click the button above to generate comprehensive AI-enhanced insights that combine all your assessment responses 
                      for a complete career analysis.
                    </p>
                  </div>
                )}
                )}
            </div>
          </div>

          {/* Enhanced Chat Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8">
              {showChat ? (
                <AIChat 
                  userResults={{
                    scores: numericalScores,
                    careers: assessment.recommendedCareers,
                    previousAssessments
                  }} 
                />
              ) : (
                <Card className="text-center bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
                  <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Guidance?</h3>
                  <p className="text-gray-600 mb-4">Chat with our AI counselor for personalized advice about your results.</p>
                  <Button
                    icon={MessageCircle}
                    onClick={() => setShowChat(true)}
                    className="w-full"
                  >
                    Start Conversation
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

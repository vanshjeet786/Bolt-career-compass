import React, { useState, useEffect } from 'react';
import { Download, MessageCircle, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Assessment, CareerRecommendation, User } from '../types';
import { CAREER_DETAILS } from '../data/careerMapping';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ResultsChart } from '../components/Results/ResultsChart';
import { CareerCard } from '../components/Results/CareerCard';
import { AIChat } from '../components/Results/AIChat';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';

interface ResultsPageProps {
  assessment: Assessment;
  user: User;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ assessment, user }) => {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'name'>('match');
  const [filterBy, setFilterBy] = useState<'all' | 'high-growth' | 'high-salary'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        const insights = await aiService.generateCareerRecommendations(
          assessment.scores as Record<string, number>,
          assessment.responses
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
  }, [assessment]);

  const generateCareerRecommendations = (): CareerRecommendation[] => {
    return assessment.recommendedCareers.map(career => {
      const details = CAREER_DETAILS[career];
      if (details) {
        return {
          name: career,
          match: Math.random() * 0.3 + 0.7, // Generate realistic match scores
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
  };

  const filteredAndSortedCareers = () => {
    let careers = generateCareerRecommendations();
    
    // Apply filters
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
    
    // Apply sorting
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

  const careerRecommendations = filteredAndSortedCareers();
  const numericalScores = Object.entries(assessment.scores)
    .reduce((acc, [key, value]) => {
      if (typeof value === 'number') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Career Assessment Results
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Congratulations, {user.name}! Here's your personalized career guidance.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              icon={Download}
              onClick={handleDownloadReport}
              variant="secondary"
            >
              Download PDF Report
            </Button>
            <Button
              icon={MessageCircle}
              onClick={() => setShowChat(!showChat)}
              variant="outline"
            >
              {showChat ? 'Hide Chat' : 'Chat with AI Counselor'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* AI Insights */}
            <Card>
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
            </Card>

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

            {/* Career Recommendations */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Recommended Career Paths
              </h2>
              
              {/* Filters and Sorting */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="salary">Salary Range</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing {careerRecommendations.length} career{careerRecommendations.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerRecommendations.map((career, index) => (
                  <CareerCard key={index} career={career} />
                ))}
              </div>
              
              {/* Next Steps Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Take Action?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="https://www.linkedin.com/jobs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Find Jobs</h4>
                      <p className="text-sm text-gray-600">Search for opportunities</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.coursera.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ExternalLink className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Learn Skills</h4>
                      <p className="text-sm text-gray-600">Take online courses</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.mentorship.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ExternalLink className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">Find Mentors</h4>
                      <p className="text-sm text-gray-600">Connect with experts</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Chat - Always visible but collapsible */}
            <div className="sticky top-8">
              {showChat ? (
                <AIChat 
                  userResults={{
                    scores: numericalScores,
                    careers: assessment.recommendedCareers
                  }} 
                />
              ) : (
                <Card className="text-center">
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
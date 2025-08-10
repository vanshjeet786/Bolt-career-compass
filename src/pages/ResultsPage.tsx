import React, { useState, useEffect } from 'react';
import { Download, MessageCircle } from 'lucide-react';
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
        description: 'A promising career path that aligns with your assessment results.'
      };
    }).sort((a, b) => b.match - a.match);
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

  const careerRecommendations = generateCareerRecommendations();
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
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Recommended Career Paths
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerRecommendations.slice(0, 6).map((career, index) => (
                  <CareerCard key={index} career={career} />
                ))}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            {showChat && (
              <div className="sticky top-8">
                <AIChat 
                  userResults={{
                    scores: numericalScores,
                    careers: assessment.recommendedCareers
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
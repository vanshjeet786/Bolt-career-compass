import React, { useState, useEffect } from 'react';
import { Assessment, User, CareerRecommendation } from '../types';
import { Card } from '../components/ui/Card';
import { ResultsChart } from '../components/Results/ResultsChart';
import { CareerCard } from '../components/Results/CareerCard';
import { AIChat } from '../components/Results/AIChat';
import { CAREER_DETAILS } from '../data/careerMapping';
import { Button } from '../components/ui/Button';
import { Download } from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';

interface ResultsPageProps {
  assessment: Assessment;
  user: User;
  previousAssessments: Assessment[];
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ assessment, user, previousAssessments }) => {
  const [careerDetails, setCareerDetails] = useState<CareerRecommendation[]>([]);

  useEffect(() => {
    const details = assessment.recommendedCareers.map(careerName => {
      const detail = CAREER_DETAILS[careerName] || {
        skills: ['Communication', 'Problem-Solving'],
        outlook: 'Stable',
        salaryRange: '$50k - $90k',
        description: 'A rewarding career with diverse opportunities.',
        dailyTasks: ['Collaborate with team members.', 'Complete assigned tasks.', 'Attend meetings.'],
        education: 'Bachelor\'s degree in a relevant field.',
        growthOpportunities: ['Senior roles', 'Management positions']
      };
      const matchScore = (Math.random() * 0.2) + 0.8; // Simulate a high match score

      return {
        name: careerName,
        match: matchScore,
        ...detail
      };
    });
    setCareerDetails(details);
  }, [assessment.recommendedCareers]);

  const handleDownload = async () => {
    const aiRecommendations = await aiService.generateCareerRecommendations(
      assessment.scores as Record<string, number>,
      assessment.responses,
      previousAssessments
    );

    pdfService.generateReport({
      scores: assessment.scores as Record<string, number>,
      careers: assessment.recommendedCareers,
      recommendations: aiRecommendations,
      userName: user.name,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Assessment Results</h1>
          <p className="text-xl text-gray-600">An overview of your strengths and career recommendations</p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ResultsChart scores={assessment.scores as Record<string, number>} type="bar" title="Top Intelligence Areas" />
          <ResultsChart scores={assessment.scores as Record<string, number>} type="radar" title="Intelligence Profile" />
        </div>

        {/* AI Chat */}
        <div className="mb-8">
          <AIChat
            userResults={{
              scores: assessment.scores as Record<string, number>,
              careers: assessment.recommendedCareers,
              previousAssessments,
            }}
          />
        </div>

        {/* Career Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Recommended Careers</h2>
            <Button onClick={handleDownload} icon={Download}>
              Download Report
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {careerDetails.map(career => (
              <CareerCard key={career.name} career={career} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

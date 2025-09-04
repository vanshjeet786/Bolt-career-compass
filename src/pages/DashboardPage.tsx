import React, { useState } from 'react';
import { User, Assessment } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, Calendar, TrendingUp, Award, Target, BookOpen, Users, ArrowRight, Plus, Eye, Play, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  user: User;
  assessments: Assessment[];
  hasInProgressAssessment: boolean;
  onStartNewAssessment: () => void;
  onResumeAssessment: () => void;
  onViewResults: (assessment: Assessment) => void;
  loadingAssessments: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  assessments,
  hasInProgressAssessment,
  onStartNewAssessment,
  onResumeAssessment,
  onViewResults,
  loadingAssessments
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '6months' | '1year'>('all');

  const getFilteredAssessments = () => {
    if (selectedTimeframe === 'all') return assessments;
    
    const cutoffDate = new Date();
    if (selectedTimeframe === '6months') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }
    
    return assessments.filter(assessment => 
      new Date(assessment.completed_at) >= cutoffDate
    );
  };

  const getProgressInsights = () => {
    if (assessments.length < 2) return null;
    
    const latest = assessments[0]; // newest is at the start
    const previous = assessments[1];
    
    const latestScores = latest.scores as Record<string, number>;
    const previousScores = previous.scores as Record<string, number>;
    
    const improvements = [];
    const declines = [];
    
    Object.entries(latestScores).forEach(([category, currentScore]) => {
      const previousScore = previousScores[category];
      if (previousScore && typeof currentScore === 'number') {
        const change = currentScore - previousScore;
        if (change > 0.3) improvements.push({ category, change });
        else if (change < -0.3) declines.push({ category, change });
      }
    });
    
    return { improvements, declines };
  };

  const getTopStrengths = () => {
    if (assessments.length === 0) return [];
    
    const latestAssessment = assessments[0];
    const scores = latestAssessment.scores as Record<string, number>;
    
    return Object.entries(scores)
      .filter(([_, score]) => typeof score === 'number')
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
  };

  const filteredAssessments = getFilteredAssessments();
  const progressInsights = getProgressInsights();
  const topStrengths = getTopStrengths();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Welcome back, {user.name}!
                </span>
              </h1>
              <p className="text-xl text-gray-600">Track your career development journey</p>
            </div>
            <div className="flex gap-3">
              {hasInProgressAssessment && (
                <Button
                  icon={Play}
                  onClick={onResumeAssessment}
                  size="lg"
                  variant="secondary"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Continue Where You Left
                </Button>
              )}
              <Button
                icon={Plus}
                onClick={onStartNewAssessment}
                size="lg"
                className="hover:scale-105 transition-transform duration-200"
              >
                Take New Assessment
              </Button>
            </div>
          </div>
        </div>

        {/* In-Progress Assessment Alert */}
        {hasInProgressAssessment && (
          <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full mr-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-1">Assessment In Progress</h3>
                <p className="text-amber-700">You have an unfinished assessment. Continue where you left off or start a new one.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Play}
                  onClick={onResumeAssessment}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Continue
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartNewAssessment}
                  className="text-amber-600 hover:text-amber-800"
                >
                  Start New
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primary-600">{assessments.length}</h3>
            <p className="text-gray-600">Assessments Completed</p>
          </Card>

          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-600">
              {progressInsights?.improvements.length || 0}
            </h3>
            <p className="text-gray-600">Areas Improved</p>
          </Card>

          <Card className="text-center bg-gradient-to-br from-secondary-50 to-orange-50 border-secondary-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-secondary-600 to-orange-600 rounded-full mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-600">{topStrengths.length}</h3>
            <p className="text-gray-600">Top Strengths</p>
          </Card>

          <Card className="text-center bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-pink-600">
              {assessments.length > 0 ? assessments[0].recommendedCareers.length : 0}
            </h3>
            <p className="text-gray-600">Career Matches</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Assessments */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-primary-600" />
                  Assessment History
                </h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Time</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              {loadingAssessments ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your assessments...</p>
                </div>
              ) : filteredAssessments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAssessments.slice(0, 5).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-full">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Assessment #{assessments.length - assessments.indexOf(assessment)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed on {new Date(assessment.completed_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-primary-600">
                            {assessment.recommendedCareers.length} career matches found
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => onViewResults(assessment)}
                      >
                        View Results
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No assessments yet</h3>
                  <p className="text-gray-500 mb-4">Take your first assessment to get started!</p>
                  <Button onClick={onStartNewAssessment} icon={Plus}>
                    Take Assessment
                  </Button>
                </div>
              )}
            </Card>

            {/* Progress Insights */}
            {progressInsights && (
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Your Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3">Recent Improvements</h3>
                    {progressInsights.improvements.length > 0 ? (
                      <div className="space-y-2">
                        {progressInsights.improvements.map(({ category, change }) => (
                          <div key={category} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <span className="text-gray-800">{category}</span>
                            <span className="text-green-600 font-bold">+{change.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No significant improvements detected.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Assessment Streak</h3>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">{assessments.length}</p>
                      <p className="text-gray-600">Total Assessments</p>
                      {assessments.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Last: {new Date(assessments[0].completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Strengths */}
            {topStrengths.length > 0 && (
              <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-600" />
                  Your Top Strengths
                </h3>
                <div className="space-y-3">
                  {topStrengths.map(([category, score], index) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-gray-800 text-sm">{category}</span>
                      </div>
                      <span className="text-primary-600 font-bold">{(score as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-secondary-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Plus}
                  onClick={onStartNewAssessment}
                >
                  Take New Assessment
                </Button>
                {assessments.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={Eye}
                    onClick={() => onViewResults(assessments[0])}
                  >
                    View Latest Results
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={BookOpen}
                >
                  Career Resources
                </Button>
              </div>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="bg-gradient-to-br from-secondary-50 to-orange-50 border-secondary-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <ArrowRight className="w-5 h-5 mr-2 text-secondary-600" />
                Recommended Next Steps
              </h3>
              <div className="space-y-3 text-sm">
                {assessments.length === 0 ? (
                  <p className="text-gray-600">Complete your first assessment to get personalized recommendations.</p>
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">Explore career opportunities in your top recommended fields</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">Connect with professionals in your areas of interest</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700">Consider taking another assessment in 3-6 months to track progress</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};


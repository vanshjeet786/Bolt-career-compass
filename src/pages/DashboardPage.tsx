import React, { useState, useEffect } from 'react';
import { User, Assessment } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabaseClient';
import { BarChart3, Calendar, TrendingUp, Award, Target, BookOpen, Users, ArrowRight, Plus, Eye } from 'lucide-react';

interface DashboardPageProps {
  user: User;
  assessments: Assessment[];
  onStartNewAssessment: () => void;
  onViewResults: (assessment: Assessment) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  assessments,
  onStartNewAssessment,
  onViewResults
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '6months' | '1year'>('all');
  const [loadedAssessments, setLoadedAssessments] = useState<Assessment[]>([]);

  // Load assessments from Supabase on component mount
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const { data: assessments, error } = await supabase
          .from('assessments')
          .select(`
            *,
            assessment_responses (*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (error) throw error;

        // Use the assessments from props if available, otherwise use loaded ones
        setLoadedAssessments(assessments || []);
      } catch (error) {
        console.error('Failed to load assessments:', error);
      }
    };

    loadAssessments();
  }, [user.id]);

  const getFilteredAssessments = () => {
    const allAssessments = assessments.length > 0 ? assessments : loadedAssessments;
    if (selectedTimeframe === 'all') return allAssessments;
    
    const cutoffDate = new Date();
    if (selectedTimeframe === '6months') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }
    
    return allAssessments.filter(assessment => 
      new Date(assessment.completedAt) >= cutoffDate
    );
  };

  const getProgressInsights = () => {
    if (assessments.length < 2) return null;
    
    const latest = assessments[assessments.length - 1];
    const previous = assessments[assessments.length - 2];
    
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
    const allAssessments = assessments.length > 0 ? assessments : loadedAssessments;
    if (allAssessments.length === 0) return [];
    
    const latestAssessment = allAssessments[allAssessments.length - 1];
    const scores = latestAssessment.scores as Record<string, number>;
    
    return Object.entries(scores)
      .filter(([_, score]) => typeof score === 'number')
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
  };

  const filteredAssessments = getFilteredAssessments();
  const allAssessments = assessments.length > 0 ? assessments : loadedAssessments;
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primary-600">{allAssessments.length}</h3>
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
              {allAssessments.length > 0 ? allAssessments[allAssessments.length - 1].recommendedCareers.length : 0}
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

              {filteredAssessments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAssessments.slice(-5).reverse().map((assessment, index) => (
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
                            Assessment #{filteredAssessments.length - index}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed on {new Date(assessment.completedAt).toLocaleDateString()}
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
                          Last: {new Date(assessments[assessments.length - 1].completedAt).toLocaleDateString()}
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
                {allAssessments.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={Eye}
                    onClick={() => onViewResults(allAssessments[allAssessments.length - 1])}
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
                {allAssessments.length === 0 ? (
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
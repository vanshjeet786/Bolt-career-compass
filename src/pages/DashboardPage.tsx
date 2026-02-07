import React, { useState, useEffect } from 'react';
import { User, Assessment } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BarChart3,
  Calendar,
  Play,
  Plus,
  Eye,
  BookOpen,
  ArrowRight,
  History
} from 'lucide-react';
import { ViewMode } from '../utils/analytics';
import { ViewModeSelector } from '../components/dashboard/ViewModeSelector';
import { AreasImprovedCard } from '../components/dashboard/AreasImprovedCard';
import { StrengthsCard } from '../components/dashboard/StrengthsCard';
import { CareerMatchesCard } from '../components/dashboard/CareerMatchesCard';

interface DashboardPageProps {
  user: User;
  assessments: Assessment[];
  onStartNewAssessment: () => void;
  onResumeAssessment: () => void;
  onViewResults: (assessment: Assessment) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  assessments,
  onStartNewAssessment,
  onResumeAssessment,
  onViewResults
}) => {
  const [hasInProgress, setHasInProgress] = useState(false);
  const [globalViewMode, setGlobalViewMode] = useState<ViewMode>('latest');
  const [historyTimeframe, setHistoryTimeframe] = useState<'all' | '6months' | '1year'>('all');

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`inProgressAssessment_${user.id}`);
      setHasInProgress(!!savedData);
    }
  }, [user]);

  const getFilteredAssessments = () => {
    const allAssessments = assessments;
    if (historyTimeframe === 'all') return allAssessments;
    
    const cutoffDate = new Date();
    if (historyTimeframe === '6months') {
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
    } else {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    }
    
    return allAssessments.filter(assessment => 
      new Date(assessment.completedAt) >= cutoffDate
    );
  };

  const filteredHistory = getFilteredAssessments();

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 font-heading">
              <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Welcome back, {user.name}!
              </span>
            </h1>
            <p className="text-xl text-gray-600 font-sans">Track your career development journey</p>
          </div>

          <div className="flex flex-col items-end space-y-4">
             <div className="flex items-center space-x-4">
              {hasInProgress && (
                <Button
                  icon={Play}
                  onClick={onResumeAssessment}
                  size="lg"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Resume
                </Button>
              )}
              <Button
                icon={Plus}
                onClick={onStartNewAssessment}
                size="lg"
                variant={hasInProgress ? "outline" : "primary"}
                className="hover:scale-105 transition-transform duration-200 shadow-lg shadow-primary-500/20"
              >
                New Assessment
              </Button>
            </div>

            {/* Global View Mode Selector */}
            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-sm font-medium text-gray-500 mx-3">Analysis View:</span>
                <ViewModeSelector mode={globalViewMode} onChange={setGlobalViewMode} />
            </div>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Simple KPI: Total Assessments */}
           <Card className="flex flex-col justify-center items-center bg-white border-blue-100 h-full">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-3 border border-blue-100">
              <History className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{assessments.length}</h3>
            <p className="text-sm text-gray-500">Assessments Completed</p>
            {assessments.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                    Last: {new Date(assessments[0].completedAt).toLocaleDateString()}
                </p>
            )}
          </Card>

          {/* New Smart Cards */}
          <AreasImprovedCard assessments={assessments} globalMode={globalViewMode} />
          <StrengthsCard assessments={assessments} globalMode={globalViewMode} />
          <CareerMatchesCard assessments={assessments} globalMode={globalViewMode} />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column: History */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white shadow-md border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center font-heading">
                  <Calendar className="w-6 h-6 mr-2 text-primary-600" />
                  Assessment History
                </h2>
                <select
                  value={historyTimeframe}
                  onChange={(e) => setHistoryTimeframe(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="space-y-4">

                  {filteredHistory.map((assessment, index) => 
                  (

                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-primary-100 group-hover:bg-primary-50 transition-colors">
                          <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 font-heading">
                            Assessment #{filteredHistory.length - index}
                          </h3>
                          <p className="text-sm text-gray-500 font-sans">
                            Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Matches</p>
                            <p className="text-sm font-bold text-primary-600">{assessment.recommendedCareers.length}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => onViewResults(assessment)}
                            className="bg-white hover:bg-gray-50"
                        >
                            Results
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2 font-heading">No assessments yet</h3>
                  <p className="text-gray-400 mb-6 font-sans">Take your first assessment to get started!</p>
                  <Button onClick={onStartNewAssessment} icon={Plus}>
                    Take Assessment
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white shadow-md border-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center font-heading">
                <Play className="w-5 h-5 mr-2 text-secondary-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  icon={Plus}
                  onClick={onStartNewAssessment}
                >
                  Take New Assessment
                </Button>
                {assessments.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    icon={Eye}
                    onClick={() => onViewResults(assessments[0])}
                  >
                    View Latest Results
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  icon={BookOpen}
                >
                  Career Resources
                </Button>
              </div>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="bg-gradient-to-br from-secondary-50 to-orange-50 border-secondary-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center font-heading">
                <ArrowRight className="w-5 h-5 mr-2 text-secondary-600" />
                Recommended Next Steps
              </h3>
              <div className="space-y-3 text-sm font-sans">
                {assessments.length === 0 ? (
                  <p className="text-gray-500">Complete your first assessment to get personalized recommendations.</p>
                ) : (
                  <>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></div>
                      <p className="text-gray-700">Explore career opportunities in your top recommended fields</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></div>
                      <p className="text-gray-700">Connect with professionals in your areas of interest</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></div>
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

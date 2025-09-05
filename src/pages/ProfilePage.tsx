import React, { useState } from 'react';
import { User, Assessment } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User as UserIcon, Calendar, Award, BarChart3, Eye, Download, Settings, Mail, Clock } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  assessments: Assessment[];
  onViewResults: (assessment: Assessment) => void;
  onStartNewAssessment: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  assessments,
  onViewResults,
  onStartNewAssessment
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'assessments' | 'settings'>('overview');

  const getAssessmentStats = () => {
    if (assessments.length === 0) return null;

    const totalAssessments = assessments.length;
    const latestAssessment = assessments[0]; // Assuming sorted by date desc
    const averageCareerMatches = assessments.reduce((sum, assessment) => 
      sum + assessment.recommendedCareers.length, 0) / totalAssessments;

    return {
      totalAssessments,
      latestAssessment,
      averageCareerMatches: Math.round(averageCareerMatches)
    };
  };

  const stats = getAssessmentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-6 mx-auto">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {user.name}'s Profile
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">Manage your career assessment journey</p>
          
          {/* Profile Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-2 inline-flex">
              {[
                { id: 'overview', label: 'Overview', icon: UserIcon },
                { id: 'assessments', label: 'Assessment History', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === tab.id
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
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* Profile Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-600">{stats?.totalAssessments || 0}</h3>
                  <p className="text-gray-600">Assessments Completed</p>
                </Card>

                <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">
                    {stats?.averageCareerMatches || 0}
                  </h3>
                  <p className="text-gray-600">Avg Career Matches</p>
                </Card>

                <Card className="text-center bg-gradient-to-br from-secondary-50 to-orange-50 border-secondary-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-secondary-600 to-orange-600 rounded-full mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-600">
                    {stats?.latestAssessment ? new Date(stats.latestAssessment.completed_at).toLocaleDateString() : 'N/A'}
                  </h3>
                  <p className="text-gray-600">Latest Assessment</p>
                </Card>

                <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-600">
                    {user.createdAt ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </h3>
                  <p className="text-gray-600">Days Since Joined</p>
                </Card>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <UserIcon className="w-6 h-6 mr-2 text-primary-600" />
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium text-gray-800">
                          {user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-secondary-600" />
                    Recent Activity
                  </h2>
                  {assessments.length > 0 ? (
                    <div className="space-y-3">
                      {assessments.slice(0, 3).map((assessment, index) => (
                        <div key={assessment.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-primary-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Assessment #{assessments.length - index}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(assessment.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => onViewResults(assessment)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No assessments completed yet</p>
                      <Button onClick={onStartNewAssessment} size="sm">
                        Take Your First Assessment
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'assessments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-800">Assessment History</h2>
                <Button onClick={onStartNewAssessment} icon={BarChart3}>
                  Take New Assessment
                </Button>
              </div>

              {assessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessments.map((assessment, index) => (
                    <Card key={assessment.id} hover>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-800">
                            Assessment #{assessments.length - index}
                          </h3>
                          <div className="bg-green-100 px-2 py-1 rounded-full">
                            <span className="text-green-800 text-xs font-medium">Completed</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {new Date(assessment.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {assessment.recommendedCareers.length} career matches
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => onViewResults(assessment)}
                            className="flex-1"
                          >
                            View Results
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Download}
                            className="text-gray-600"
                          >
                            Export
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No assessments yet</h3>
                  <p className="text-gray-500 mb-6">Start your career discovery journey today!</p>
                  <Button onClick={onStartNewAssessment} icon={BarChart3} size="lg">
                    Take Your First Assessment
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Account Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                        readOnly
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      To update your profile information, please contact support.
                    </p>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates about new features</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Assessment Reminders</p>
                        <p className="text-sm text-gray-600">Get reminded to retake assessments</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        defaultChecked
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
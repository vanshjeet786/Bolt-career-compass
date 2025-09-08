import React, { useState } from 'react';
import { X, User, Calendar, Award, Eye, Trash2, Download, Settings } from 'lucide-react';
import { User as UserType, Assessment } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../services/supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  assessments: Assessment[];
  onViewResults: (assessment: Assessment) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  assessments,
  onViewResults,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'settings'>('overview');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(assessmentId);
    try {
      // Delete assessment responses first
      const { error: responsesError } = await supabase
        .from('assessment_responses')
        .delete()
        .eq('assessment_id', assessmentId);

      if (responsesError) throw responsesError;

      // Delete assessment
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (assessmentError) throw assessmentError;

      // Refresh the page to update the assessments list
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
      alert('Failed to delete assessment. Please try again.');
    } finally {
      setIsDeleting(null);
    }
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

  const topStrengths = getTopStrengths();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'assessments', label: 'Assessments', icon: Calendar },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full mb-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-600">{assessments.length}</h3>
                  <p className="text-gray-600 text-sm">Assessments Completed</p>
                </Card>

                <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-3">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600">{topStrengths.length}</h3>
                  <p className="text-gray-600 text-sm">Top Strengths</p>
                </Card>

                <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </h3>
                  <p className="text-gray-600 text-sm">Member Since</p>
                </Card>
              </div>

              {/* Top Strengths */}
              {topStrengths.length > 0 && (
                <Card>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Your Top Strengths</h3>
                  <div className="space-y-3">
                    {topStrengths.map(([category, score], index) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-800">{category}</span>
                        </div>
                        <span className="text-primary-600 font-bold">{(score as number).toFixed(1)}/5.0</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Assessment History</h3>
                <span className="text-sm text-gray-600">{assessments.length} total assessments</span>
              </div>

              {assessments.length > 0 ? (
                <div className="space-y-3">
                  {assessments.map((assessment, index) => (
                    <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-2 rounded-full">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Assessment #{assessments.length - index}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-primary-600">
                              {assessment.recommendedCareers.length} career matches
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              onViewResults(assessment);
                              onClose();
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteAssessment(assessment.id)}
                            loading={isDeleting === assessment.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No assessments yet</h4>
                  <p className="text-gray-500">Take your first assessment to get started!</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <input
                      type="text"
                      value={new Date(user.createdAt).toLocaleDateString()}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    icon={Download}
                    className="w-full justify-start"
                    onClick={() => {
                      // Export user data functionality could be added here
                      alert('Data export feature coming soon!');
                    }}
                  >
                    Export My Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onLogout}
                    className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
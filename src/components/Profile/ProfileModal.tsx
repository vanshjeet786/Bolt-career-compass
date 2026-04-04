import React, { useState } from 'react';
import { X, User, Calendar, Award, Eye, Trash2, Download, Settings, Trash, Edit2, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Award, Eye, Trash2, Download, Settings, Trash, FileText, Save, CheckCircle2 } from 'lucide-react';
import { User as UserType, Assessment } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { supabase } from '../../services/supabaseClient';
import { getFriendlyName } from '../../utils/categoryNames';
import { INDIAN_DEGREES, SPECIALIZATIONS, JOB_TITLES, USER_TYPES } from '../../data/backgroundOptions';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'background' | 'settings'>('overview');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showSingleDeleteModal, setShowSingleDeleteModal] = useState<string | null>(null);
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundForm, setBackgroundForm] = useState({
    userType: user?.backgroundInfo?.userType || '',
    jobTitle: user?.backgroundInfo?.details?.jobTitle || '',
    yearsExperience: user?.backgroundInfo?.details?.yearsExperience || '',
    fieldOfStudy: user?.backgroundInfo?.details?.fieldOfStudy || '',
    specialization: user?.backgroundInfo?.details?.specialization || '',
    currentStatus: user?.backgroundInfo?.details?.currentStatus || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [bgUserType, setBgUserType] = useState('');
  const [bgDetails, setBgDetails] = useState({
    jobTitle: '',
    yearsExperience: '',
    fieldOfStudy: '',
    specialization: '',
    currentStatus: ''
  });
  const [bgSaveSuccess, setBgSaveSuccess] = useState(false);

  // Load saved background info when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const saved = localStorage.getItem(`savedBackgroundInfo_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBgUserType(parsed.userType || '');
          setBgDetails({
            jobTitle: parsed.details?.jobTitle || '',
            yearsExperience: parsed.details?.yearsExperience || '',
            fieldOfStudy: parsed.details?.fieldOfStudy || '',
            specialization: parsed.details?.specialization || '',
            currentStatus: parsed.details?.currentStatus || ''
          });
        } catch (e) {
          console.error('Failed to parse saved background info', e);
        }
      } else if (assessments.length > 0 && assessments[0].backgroundInfo) {
        const bg = assessments[0].backgroundInfo;
        setBgUserType(bg.userType || '');
        setBgDetails({
          jobTitle: bg.details?.jobTitle || '',
          yearsExperience: bg.details?.yearsExperience || '',
          fieldOfStudy: bg.details?.fieldOfStudy || '',
          specialization: bg.details?.specialization || '',
          currentStatus: bg.details?.currentStatus || ''
        });
      }
    }
  }, [isOpen, user, assessments]);

  const handleSaveBackgroundInfo = () => {
    if (!user) return;
    const data = {
      userType: bgUserType,
      details: {
        jobTitle: bgUserType === 'professional' ? bgDetails.jobTitle : undefined,
        yearsExperience: bgUserType === 'professional' ? bgDetails.yearsExperience : undefined,
        fieldOfStudy: ['student', 'graduate'].includes(bgUserType) ? bgDetails.fieldOfStudy : undefined,
        specialization: ['student', 'graduate'].includes(bgUserType) ? bgDetails.specialization : undefined,
        currentStatus: bgUserType === 'other' ? bgDetails.currentStatus : undefined
      }
    };
    localStorage.setItem(`savedBackgroundInfo_${user.id}`, JSON.stringify(data));
    setBgSaveSuccess(true);
    setTimeout(() => setBgSaveSuccess(false), 2500);
  };

  if (!isOpen || !user) return null;

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBackgroundForm(prev => ({ ...prev, [name]: value }));
  };

  const saveBackgroundInfo = async () => {
    setIsSaving(true);
    try {
      const updatedBackgroundInfo = {
        userType: backgroundForm.userType,
        details: {
          jobTitle: backgroundForm.userType === 'professional' ? backgroundForm.jobTitle : undefined,
          yearsExperience: backgroundForm.userType === 'professional' ? backgroundForm.yearsExperience : undefined,
          fieldOfStudy: ['student', 'graduate'].includes(backgroundForm.userType) ? backgroundForm.fieldOfStudy : undefined,
          specialization: ['student', 'graduate'].includes(backgroundForm.userType) ? backgroundForm.specialization : undefined,
          currentStatus: backgroundForm.userType === 'other' ? backgroundForm.currentStatus : undefined
        }
      };

      const { error } = await supabase
        .from('users')
        .update({ background_info: updatedBackgroundInfo })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user object
      if (user) {
        user.backgroundInfo = updatedBackgroundInfo as any;
      }
      setIsEditingBackground(false);
    } catch (error) {
      console.error('Failed to update background info:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to user's saved data
    setBackgroundForm({
      userType: user?.backgroundInfo?.userType || '',
      jobTitle: user?.backgroundInfo?.details?.jobTitle || '',
      yearsExperience: user?.backgroundInfo?.details?.yearsExperience || '',
      fieldOfStudy: user?.backgroundInfo?.details?.fieldOfStudy || '',
      specialization: user?.backgroundInfo?.details?.specialization || '',
      currentStatus: user?.backgroundInfo?.details?.currentStatus || ''
    });
    setIsEditingBackground(false);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
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
      setShowSingleDeleteModal(null);
    }
  };

  const handleDeleteAllAssessments = async () => {
    setIsDeleting('all');
    try {
      // 1. Fetch ALL assessment IDs for the user from the database to ensure we have the complete list
      const { data: userAssessments, error: fetchError } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      if (userAssessments && userAssessments.length > 0) {
        const assessmentIds = userAssessments.map(a => a.id);

        // 2. Delete all responses linked to these assessment IDs
        // We do this in batches if necessary, but typically this should be fine
        const { error: responsesError } = await supabase
          .from('assessment_responses')
          .delete()
          .in('assessment_id', assessmentIds);

        if (responsesError) throw responsesError;
      }

      // 3. Finally, delete the assessments themselves
      const { error: assessmentError } = await supabase
        .from('assessments')
        .delete()
        .eq('user_id', user.id);

      if (assessmentError) throw assessmentError;

      // Refresh the page to update the assessments list
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete all assessments:', error);
      alert('Failed to delete all assessments. Please try again.');
    } finally {
      setIsDeleting(null);
      setShowDeleteAllModal(false);
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
    <>
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
              { id: 'background', label: 'Background', icon: FileText },
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
                            <span className="text-gray-800">{getFriendlyName(category)}</span>
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
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Assessment History</h3>
                    <span className="text-sm text-gray-600">{assessments.length} total assessments</span>
                  </div>
                  {assessments.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Trash}
                      onClick={() => setShowDeleteAllModal(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Delete All
                    </Button>
                  )}
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
                                Completed on {assessment.completedAt.toLocaleDateString()}
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
                              onClick={() => setShowSingleDeleteModal(assessment.id)}
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

            {activeTab === 'background' && (
              <div className="space-y-6">
                {bgSaveSuccess && (
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    Background info saved! It will be pre-filled in your next assessment.
                  </div>
                )}

                <Card>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Your Background Information</h3>
                  <p className="text-sm text-gray-500 mb-6">This information helps personalize your career recommendations. Edit and save to update your profile.</p>

                  {/* User Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      {USER_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setBgUserType(type.id);
                            if (type.id !== bgUserType) {
                              setBgDetails({ jobTitle: '', yearsExperience: '', fieldOfStudy: '', specialization: '', currentStatus: '' });
                            }
                          }}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            bgUserType === type.id
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields */}
                  {bgUserType === 'professional' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <select
                          value={bgDetails.jobTitle}
                          onChange={(e) => setBgDetails(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="block w-full rounded-lg border-gray-300 bg-white py-2.5 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        >
                          <option value="">Select your job title...</option>
                          {JOB_TITLES.map(job => (
                            <option key={job} value={job}>{job}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                          type="number"
                          value={bgDetails.yearsExperience}
                          onChange={(e) => setBgDetails(prev => ({ ...prev, yearsExperience: e.target.value }))}
                          min="0" max="50" placeholder="e.g. 5"
                          className="block w-full rounded-lg border-gray-300 py-2.5 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {(bgUserType === 'student' || bgUserType === 'graduate') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study / Degree</label>
                        <select
                          value={bgDetails.fieldOfStudy}
                          onChange={(e) => setBgDetails(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                          className="block w-full rounded-lg border-gray-300 bg-white py-2.5 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        >
                          <option value="">Select your degree...</option>
                          {INDIAN_DEGREES.map(degree => (
                            <option key={degree} value={degree}>{degree}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization / Major</label>
                        <select
                          value={bgDetails.specialization}
                          onChange={(e) => setBgDetails(prev => ({ ...prev, specialization: e.target.value }))}
                          className="block w-full rounded-lg border-gray-300 bg-white py-2.5 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        >
                          <option value="">Select your specialization...</option>
                          {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {bgUserType === 'other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                      <textarea
                        value={bgDetails.currentStatus}
                        onChange={(e) => setBgDetails(prev => ({ ...prev, currentStatus: e.target.value }))}
                        rows={3} placeholder="Describe your current situation..."
                        className="block w-full rounded-lg border-gray-300 py-2.5 px-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  )}

                  {bgUserType && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Button
                        icon={Save}
                        onClick={handleSaveBackgroundInfo}
                        className="w-full"
                      >
                        Save Background Info
                      </Button>
                    </div>
                  )}

                  {!bgUserType && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Select a category above to view and edit your background details.
                    </div>
                  )}
                </Card>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Background Information</h3>
                    {!isEditingBackground ? (
                      <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setIsEditingBackground(true)}>
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        <Button size="sm" icon={Save} onClick={saveBackgroundInfo} loading={isSaving}>Save</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Status / Type</label>
                      <select
                        name="userType"
                        value={backgroundForm.userType}
                        onChange={handleBackgroundChange}
                        disabled={!isEditingBackground}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                      >
                        <option value="">Select type...</option>
                        {USER_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {backgroundForm.userType === 'professional' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <select
                            name="jobTitle"
                            value={backgroundForm.jobTitle}
                            onChange={handleBackgroundChange}
                            disabled={!isEditingBackground}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                          >
                            <option value="">Select title...</option>
                            {JOB_TITLES.map(title => (
                              <option key={title} value={title}>{title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                          <input
                            type="number"
                            name="yearsExperience"
                            value={backgroundForm.yearsExperience}
                            onChange={handleBackgroundChange}
                            disabled={!isEditingBackground}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    )}

                    {['student', 'graduate'].includes(backgroundForm.userType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                          <select
                            name="fieldOfStudy"
                            value={backgroundForm.fieldOfStudy}
                            onChange={handleBackgroundChange}
                            disabled={!isEditingBackground}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                          >
                            <option value="">Select field...</option>
                            {INDIAN_DEGREES.map(deg => (
                              <option key={deg} value={deg}>{deg}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                          <select
                            name="specialization"
                            value={backgroundForm.specialization}
                            onChange={handleBackgroundChange}
                            disabled={!isEditingBackground}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                          >
                            <option value="">Select specialization...</option>
                            {SPECIALIZATIONS.map(spec => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {backgroundForm.userType === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="currentStatus"
                          value={backgroundForm.currentStatus}
                          onChange={handleBackgroundChange}
                          disabled={!isEditingBackground}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50"
                        />
                      </div>
                    )}
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

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllAssessments}
        title="Delete All Assessments"
        message="Are you sure you want to delete all your assessment history? This action cannot be undone."
        confirmText="Delete All"
        isDestructive={true}
        isLoading={isDeleting === 'all'}
      />

      {/* Single Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showSingleDeleteModal}
        onClose={() => setShowSingleDeleteModal(null)}
        onConfirm={() => showSingleDeleteModal && handleDeleteAssessment(showSingleDeleteModal)}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting === showSingleDeleteModal}
      />
    </>
  );
};

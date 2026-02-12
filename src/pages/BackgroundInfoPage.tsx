import React, { useState } from 'react';
import { Briefcase, GraduationCap, School, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { INDIAN_DEGREES, SPECIALIZATIONS, JOB_TITLES, USER_TYPES } from '../data/backgroundOptions';

interface BackgroundInfoPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

export const BackgroundInfoPage: React.FC<BackgroundInfoPageProps> = ({ onComplete, onBack }) => {
  const [userType, setUserType] = useState<string>('');
  const [details, setDetails] = useState({
    jobTitle: '',
    yearsExperience: '',
    fieldOfStudy: '',
    specialization: '',
    currentStatus: ''
  });
  const [showSkipModal, setShowSkipModal] = useState(false);

  const handleTypeSelect = (type: string) => {
    setUserType(type);
    // Reset details when type changes
    setDetails({
      jobTitle: '',
      yearsExperience: '',
      fieldOfStudy: '',
      specialization: '',
      currentStatus: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const isDetailsEmpty = () => {
    if (userType === 'professional') {
      return !details.jobTitle || !details.yearsExperience;
    }
    if (userType === 'student' || userType === 'graduate') {
      return !details.fieldOfStudy || !details.specialization;
    }
    if (userType === 'other') {
      return !details.currentStatus;
    }
    return true;
  };

  const handleSubmit = () => {
    if (isDetailsEmpty()) {
      setShowSkipModal(true);
    } else {
      completeSubmission();
    }
  };

  const completeSubmission = () => {
    const submissionData = {
      userType,
      details: {
        ...details,
        // Clean up irrelevant fields based on type
        jobTitle: userType === 'professional' ? details.jobTitle : undefined,
        yearsExperience: userType === 'professional' ? details.yearsExperience : undefined,
        fieldOfStudy: ['student', 'graduate'].includes(userType) ? details.fieldOfStudy : undefined,
        specialization: ['student', 'graduate'].includes(userType) ? details.specialization : undefined,
        currentStatus: userType === 'other' ? details.currentStatus : undefined
      }
    };
    onComplete(submissionData);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'professional': return <Briefcase className="w-6 h-6" />;
      case 'student': return <School className="w-6 h-6" />;
      case 'graduate': return <GraduationCap className="w-6 h-6" />;
      default: return <HelpCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
            Help Us Know You Better
          </h1>
          <p className="text-lg text-gray-600 font-sans">
            To provide the most accurate career advice, tell us a bit about your current status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {USER_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className={`flex items-center p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                userType === type.id
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 ring-offset-2'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                userType === type.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {getIconForType(type.id)}
              </div>
              <div>
                <h3 className={`font-bold font-heading ${
                  userType === type.id ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {type.label}
                </h3>
              </div>
              {userType === type.id && (
                <div className="ml-auto text-primary-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </button>
          ))}
        </div>

        {userType && (
          <Card className="animate-fade-in mb-8 border-primary-100 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 font-heading border-b border-gray-100 pb-4">
              {userType === 'professional' && 'Professional Details'}
              {userType === 'student' && 'Education Details'}
              {userType === 'graduate' && 'Education Background'}
              {userType === 'other' && 'Tell us more'}
            </h3>

            <div className="space-y-6">
              {userType === 'professional' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Job Title
                    </label>
                    <div className="relative">
                      <select
                        name="jobTitle"
                        value={details.jobTitle}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-sans transition-colors"
                      >
                        <option value="">Select your job title...</option>
                        {JOB_TITLES.map(job => (
                          <option key={job} value={job}>{job}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsExperience"
                      value={details.yearsExperience}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      placeholder="e.g. 5"
                      className="block w-full rounded-lg border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-sans"
                    />
                  </div>
                </>
              )}

              {(userType === 'student' || userType === 'graduate') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Field of Study / Degree
                    </label>
                    <select
                      name="fieldOfStudy"
                      value={details.fieldOfStudy}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-sans"
                    >
                      <option value="">Select your degree...</option>
                      {INDIAN_DEGREES.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Specialization / Major Subject
                    </label>
                    <select
                      name="specialization"
                      value={details.specialization}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-sans"
                    >
                      <option value="">Select your specialization...</option>
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {userType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Current Status
                  </label>
                  <textarea
                    name="currentStatus"
                    value={details.currentStatus}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please describe your current situation (e.g., Taking a break, Career break, Homemaker, etc.)"
                    className="block w-full rounded-lg border-gray-300 py-3 px-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-sans"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-sans"
          >
            Back
          </button>

          <Button
            onClick={handleSubmit}
            disabled={!userType}
            size="lg"
            className="px-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            icon={ArrowRight}
          >
            Start Assessment
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={completeSubmission}
        title="Skip Details?"
        message="Providing these details helps our AI generate much more accurate and personalized career recommendations for you. Are you sure you want to proceed without them?"
        confirmText="Yes, Skip"
        cancelText="I'll Add Details"
        isDestructive={false}
      />
    </div>
  );
};

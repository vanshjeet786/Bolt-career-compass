import React from 'react';
import { Brain, Target, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assessment',
      description: 'Advanced algorithms analyze your responses across 6 comprehensive layers'
    },
    {
      icon: Target,
      title: 'Personalized Recommendations',
      description: 'Get career suggestions tailored to your unique strengths and interests'
    },
    {
      icon: Users,
      title: '24/7 AI Counselor',
      description: 'Chat with our AI counselor anytime for guidance and support'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Market Data',
      description: 'Access current salary ranges, job outlooks, and industry trends'
    }
  ];

  const assessmentLayers = [
    'Multiple Intelligences - Discover your natural talents',
    'Personality Traits - Understand your work style preferences',
    'Aptitudes & Skills - Assess your abilities and competencies',
    'Background & Environment - Consider your unique circumstances',
    'Interests & Values - Explore what truly motivates you',
    'Self-Reflection & Synthesis - Create your personalized action plan'
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full mb-8 mx-auto animate-pulse shadow-xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-heading text-gray-900">
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Navigate Your
            </span>
            <br />
            <span>Career Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
            Take our comprehensive AI-driven assessment to uncover your strengths, 
            explore career opportunities, and navigate your path to professional success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              icon={ArrowRight}
              className="text-lg px-8 py-4 bg-secondary-500 text-black hover:bg-secondary-400"
            >
              Start Free Assessment
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center border-gray-100 bg-white shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-full mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">{feature.title}</h3>
              <p className="text-gray-600 font-sans">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Assessment Overview */}
      <section className="bg-gray-50 py-16 border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
                Comprehensive 6-Layer Assessment
              </h2>
              <p className="text-xl text-gray-600 font-sans">
                Our scientifically-backed assessment examines multiple dimensions 
                of your personality, skills, and preferences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessmentLayers.map((layer, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-full border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 font-heading">
                      Layer {index + 1}
                    </h3>
                    <p className="text-gray-600 font-sans">{layer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-sans">
            Join thousands of professionals who have found their ideal career path 
            through our AI-powered assessment.
          </p>
          <Button
            size="lg"
            variant="primary"
            onClick={onGetStarted}
            className="text-lg px-8 py-4 shadow-xl bg-secondary-500 text-black hover:bg-secondary-400"
          >
            Start Your Journey Now
          </Button>
        </div>
      </section>
    </div>
  );
};

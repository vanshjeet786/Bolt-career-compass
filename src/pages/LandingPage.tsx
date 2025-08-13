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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 mx-auto">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Navigate Your
            </span>
            <br />
            <span className="text-gray-800">Career Journey</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Take our comprehensive AI-driven assessment to uncover your strengths, 
            explore career opportunities, and navigate your path to professional success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              icon={ArrowRight}
              className="text-lg px-8 py-4"
            >
              Start Free Assessment
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Assessment Overview */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Comprehensive 6-Layer Assessment
              </h2>
              <p className="text-xl text-gray-600">
                Our scientifically-backed assessment examines multiple dimensions 
                of your personality, skills, and preferences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessmentLayers.map((layer, index) => (
                <div key={index} className="flex items-start space-x-4 p-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Layer {index + 1}
                    </h3>
                    <p className="text-gray-600">{layer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their ideal career path 
            through our AI-powered assessment.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={onGetStarted}
            className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50"
          >
            Start Your Journey Now
          </Button>
        </div>
      </section>
    </div>
  );
};
import React from 'react';
import { TrendingUp, DollarSign, Star, BookOpen, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { CareerRecommendation } from '../../types';
import { Card } from '../ui/Card';

interface CareerCardProps {
  career: CareerRecommendation;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card hover padding="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{career.name}</h3>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-600">
                {(career.match * 100).toFixed(0)}% Match
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-blue-800 font-semibold text-sm">
                {(career.match * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600">{career.description}</p>
        
        {/* Expandable detailed information */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More Details
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Daily Tasks */}
            {career.dailyTasks && (
              <div>
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Daily Tasks</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {career.dailyTasks.map((task, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education Requirements */}
            {career.education && (
              <div>
                <div className="flex items-center mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Education Required</h4>
                </div>
                <p className="text-sm text-gray-600">{career.education}</p>
              </div>
            )}

            {/* Growth Opportunities */}
            {career.growthOpportunities && (
              <div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">Career Growth</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {career.growthOpportunities.map((opportunity, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {opportunity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Salary Range</p>
              <p className="font-semibold text-gray-800">{career.salaryRange}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Job Outlook</p>
              <p className="font-semibold text-gray-800">{career.outlook}</p>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-2">Key Skills</p>
          <div className="flex flex-wrap gap-2">
            {career.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
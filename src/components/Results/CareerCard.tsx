import React from 'react';
import { TrendingUp, DollarSign, Star } from 'lucide-react';
import { CareerRecommendation } from '../../types';
import { Card } from '../ui/Card';

interface CareerCardProps {
  career: CareerRecommendation;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
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
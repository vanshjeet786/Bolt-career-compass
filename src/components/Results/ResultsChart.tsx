import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card } from '../ui/Card';

interface ResultsChartProps {
  scores: Record<string, number>;
  type: 'bar' | 'radar';
  title: string;
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ scores, type, title }) => {
  const data = Object.entries(scores)
    .filter(([_, score]) => typeof score === 'number')
    .map(([category, score]) => ({
      category: category.length > 15 ? category.substring(0, 15) + '...' : category,
      score: Number(score),
      fullName: category
    }))
    .sort((a, b) => b.score - a.score);

  if (data.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">No numerical scores available for visualization</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis domain={[0, 5]} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${Number(value).toFixed(1)}/5.0`, 
                  props.payload.fullName
                ]}
              />
              <Bar dataKey="score" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
            <RadarChart data={data.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} fontSize={10} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${Number(value).toFixed(1)}/5.0`, 
                  props.payload.fullName
                ]}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
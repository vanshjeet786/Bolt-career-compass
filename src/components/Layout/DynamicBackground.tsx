import React from 'react';

interface DynamicBackgroundProps {
  query?: string;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ query = 'space,stars,galaxy,nebula' }) => {
  const imageUrl = `https://source.unsplash.com/1920x1080/?${query}`;

  return (
    <div className="fixed inset-0 z-[-1] w-full h-full transition-opacity duration-1000 ease-in-out opacity-100">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center animate-slow-zoom"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 w-full h-full bg-black opacity-50" />
    </div>
  );
};

export default DynamicBackground;

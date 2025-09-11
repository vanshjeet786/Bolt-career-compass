import React, { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506443432602-ac2dcd7e203d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1780&auto=format&fit=crop',
];

const DynamicBackground: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setImageUrl(randomImage);
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[-1] w-full h-full transition-opacity duration-1000 ease-in-out" style={{ opacity: imageUrl ? 1 : 0}}>
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center animate-slow-zoom"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 w-full h-full bg-black opacity-50" />
    </div>
  );
};

export default DynamicBackground;

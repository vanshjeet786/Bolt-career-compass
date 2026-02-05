import React from 'react';

const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] w-full h-full bg-slate-50 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/50 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default DynamicBackground;

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import DynamicBackground from '../Layout/DynamicBackground';

interface AIResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AIResultsModal: React.FC<AIResultsModalProps> = ({ isOpen, onClose, children }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      // Allow fade-out animation to complete before unmounting
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <DynamicBackground query='abstract,particles,gradient' />

      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4 sm:p-8">
        <div className="relative w-full h-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-grow h-0 overflow-y-auto p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

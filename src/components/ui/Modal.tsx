import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = '' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 opacity-100"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className={`relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4 sm:p-8 ${className}`}>
        <div className="relative w-full h-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 bg-white/10 rounded-full"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-grow h-0 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

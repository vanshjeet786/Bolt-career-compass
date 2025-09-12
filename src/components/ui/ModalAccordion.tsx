import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModalAccordionContextType {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const ModalAccordionContext = createContext<ModalAccordionContextType | undefined>(undefined);

interface ModalAccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
}

export const ModalAccordion: React.FC<ModalAccordionProps> = ({
  children,
  type = 'single',
  collapsible = true,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (value: string) => {
    if (type === 'single') {
      if (openItems.has(value) && collapsible) {
        setOpenItems(new Set());
      } else {
        setOpenItems(new Set([value]));
      }
    } else {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(value)) {
        newOpenItems.delete(value);
      } else {
        newOpenItems.add(value);
      }
      setOpenItems(newOpenItems);
    }
  };

  return (
    <ModalAccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </ModalAccordionContext.Provider>
  );
};

interface ModalAccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const ModalAccordionItem: React.FC<ModalAccordionItemProps> = ({
  children,
  value,
  className = ''
}) => {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface ModalAccordionTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ModalAccordionTrigger: React.FC<ModalAccordionTriggerProps> = ({
  children,
  onClick,
  className = ''
}) => {
  const context = useContext(ModalAccordionContext);
  if (!context) throw new Error('ModalAccordionTrigger must be used within ModalAccordion');

  const { openItems, toggleItem } = context;
  const value = 'ai-enhanced'; // Default value for this implementation
  const isOpen = openItems.has(value);

  const handleClick = () => {
    toggleItem(value);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-between p-4 text-left bg-gradient-to-r from-primary-50 to-purple-50 hover:from-primary-100 hover:to-purple-100 transition-all duration-200 ${className}`}
    >
      <span className="font-semibold text-gray-800">{children}</span>
      <ChevronDown
        className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
          isOpen ? 'transform rotate-180' : ''
        }`}
      />
    </button>
  );
};

import DynamicBackground from '../Layout/DynamicBackground';
import { X } from 'lucide-react';

interface ModalAccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalAccordionContent: React.FC<ModalAccordionContentProps> = ({
  children,
  className = ''
}) => {
  const context = useContext(ModalAccordionContext);
  if (!context) throw new Error('ModalAccordionContent must be used within ModalAccordion');

  const { openItems, toggleItem } = context;
  const value = 'ai-enhanced';
  const isOpen = openItems.has(value);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => toggleItem(value)} />

      <DynamicBackground query='abstract,particles,gradient' />

      <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4 sm:p-8">
        <div className={`relative w-full h-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl flex flex-col ${className}`}>
          <button
            onClick={() => toggleItem(value)}
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

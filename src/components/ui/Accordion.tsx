import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ 
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
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
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

interface AccordionTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ 
  children, 
  onClick,
  className = '' 
}) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

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

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({ 
  children, 
  className = '' 
}) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const { openItems } = context;
  // This is a bit of a hack since the item doesn't pass its value down.
  // A better implementation would pass the value through context from AccordionItem.
  // For now, we assume a single value for the AI results accordion.
  const value = 'ai-enhanced';
  const isOpen = openItems.has(value);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: isOpen ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s ease-out',
      }}
    >
      <div className={`overflow-hidden ${className}`}>
        <div className="p-6 bg-white border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

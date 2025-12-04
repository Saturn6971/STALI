'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ComparisonContextType {
  comparisonList: string[];
  addToComparison: (id: string) => boolean;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cpuComparison');
    if (saved) {
      try {
        setComparisonList(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading comparison list:', error);
      }
    }
  }, []);

  // Save to localStorage whenever comparisonList changes
  useEffect(() => {
    localStorage.setItem('cpuComparison', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (id: string): boolean => {
    if (comparisonList.includes(id)) {
      return false; // Already in comparison
    }
    
    if (comparisonList.length >= 4) {
      return false; // Max 4 items
    }
    
    setComparisonList(prev => [...prev, id]);
    return true;
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(prev => prev.filter(item => item !== id));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (id: string) => {
    return comparisonList.includes(id);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}

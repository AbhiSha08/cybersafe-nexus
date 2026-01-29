import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const UIContext = createContext();

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext must be used within UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // Persistence for AI awareness
  const [quizResultData, setQuizResultData] = useState(() => {
    const saved = sessionStorage.getItem('nexus_last_quiz');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (quizResultData) sessionStorage.setItem('nexus_last_quiz', JSON.stringify(quizResultData));
  }, [quizResultData]);

  const [highlightedElements, setHighlightedElements] = useState(new Set());
  
  const highlightElement = useCallback((elementId, duration = 3000) => {
    if (!elementId) return;
    setHighlightedElements(prev => new Set([...prev, elementId]));
    setTimeout(() => {
      setHighlightedElements(prev => {
        const next = new Set(prev);
        next.delete(elementId);
        return next;
      });
    }, duration);
  }, []);

  const value = {
    currentPage, setCurrentPage,
    leaderboardData, setLeaderboardData,
    quizResultData, setQuizResultData,
    dashboardStats, setDashboardStats,
    highlightElement,
    isHighlighted: (id) => highlightedElements.has(id),
    getAiPromptContext: () => ({
      page: currentPage,
      xp: dashboardStats?.xp,
      lastScore: quizResultData?.percentage
    })
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
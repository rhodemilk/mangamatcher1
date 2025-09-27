import React, { useState } from 'react';
import './App.css';
import Quiz from './Quiz';
import Recommendations from './Recommendations';

function App() {
  const [currentView, setCurrentView] = useState('quiz'); // 'quiz' or 'recommendations'
  const [recommendations, setRecommendations] = useState([]);

  // Handle quiz completion
  const handleQuizComplete = (quizRecommendations) => {
    setRecommendations(quizRecommendations);
    setCurrentView('recommendations');
  };

  // Handle back to quiz
  const handleBackToQuiz = () => {
    setCurrentView('quiz');
    setRecommendations([]);
  };

  // Render different views
  if (currentView === 'quiz') {
    return <Quiz onQuizComplete={handleQuizComplete} />;
  }

  if (currentView === 'recommendations') {
    return <Recommendations recommendations={recommendations} onBackToQuiz={handleBackToQuiz} />;
  }

  return null;
}

export default App;

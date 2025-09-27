import React, { useState } from 'react';
import './App.css';
import Quiz from './Quiz';
import Recommendations from './Recommendations';

function App() {
  const [currentView, setCurrentView] = useState('quiz'); // 'quiz' or 'recommendations'
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Handle quiz completion
  const handleQuizComplete = ({ recommendations: recs, message }) => {
    setRecommendations(recs || []);
    setCurrentView('recommendations');
    setError('');
    setInfo(message || (recs && recs.length === 0 ? 'No matching manga found for your selections.' : ''));
  };

  // Surface fetch/error from children
  const handleError = (msg) => {
    setError(msg || 'Something went wrong. Please try again.');
    setInfo('');
  };

  // Handle back to quiz
  const handleBackToQuiz = () => {
    setCurrentView('quiz');
    setRecommendations([]);
    setError('');
    setInfo('');
  };

  if (currentView === 'quiz') {
    return (
      <div className="App">
        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert info">{info}</div>}
        <Quiz onQuizComplete={handleQuizComplete} onError={handleError} />
      </div>
    );
  }

  if (currentView === 'recommendations') {
    return (
      <div className="App">
        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert info">{info}</div>}
        <Recommendations recommendations={recommendations} onBackToQuiz={handleBackToQuiz} />
      </div>
    );
  }
  return null;
}
export default App;

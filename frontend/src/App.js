import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Quiz from './Quiz';
import Recommendations from './Recommendations';
import Profile from './Profile';
import Chats from './Chats';

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Handle quiz completion
  const handleQuizComplete = ({ recommendations: recs, message }) => {
    console.log('Quiz completed with data:', { recs, message });
    console.log('Recommendations array:', recs);
    console.log('Array length:', recs?.length);
    setRecommendations(recs || []);
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
    setRecommendations([]);
    setError('');
    setInfo('');
  };

  return (
    <Router>
      <div className="App">
        <nav className="app-nav">
          <div className="nav-container">
            <Link to="/" className="nav-logo">🌸 MangaMatcher</Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/quiz" className="nav-link">Quiz</Link>
              <Link to="/chats" className="nav-link">Chats</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </div>
          </div>
        </nav>

        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert info">{info}</div>}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/quiz" 
            element={
              recommendations.length > 0 ? (
                <Recommendations recommendations={recommendations} onBackToQuiz={handleBackToQuiz} />
              ) : (
                <Quiz onQuizComplete={handleQuizComplete} onError={handleError} />
              )
            } 
          />
          <Route path="/chats" element={<Chats />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1 className="home-title">🌸 MangaMatcher</h1>
          <p className="home-subtitle">Discover Your Perfect Manga Match</p>
        </div>

        <div className="description-section">
          <div className="description-card">
            <h2>What is MangaMatcher?</h2>
            <p>
              MangaMatcher is your personal manga discovery companion! Take our intelligent quiz 
              to find manga recommendations tailored specifically to your preferences. Whether you're 
              into action-packed adventures, heartwarming romances, or mind-bending mysteries, 
              we'll help you discover your next favorite series.
            </p>
          </div>

        </div>

        <div className="cta-section">
          <h2>Ready to Find Your Perfect Match?</h2>
          <p>Take our quick quiz and discover manga that you'll absolutely love!</p>
          <button className="start-quiz-btn" onClick={handleStartQuiz}>
            Start Quiz Now
          </button>
        </div>

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Take the Quiz</h3>
              <p>Answer questions about your favorite genres, demographics, and reading preferences.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized manga suggestions based on your answers.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Explore & Chat</h3>
              <p>Like your favorites, chat with characters, and build your personal manga collection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

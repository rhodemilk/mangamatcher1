import React, { useState, useEffect } from 'react';
import './Quiz.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Quiz({ onQuizComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizOptions, setQuizOptions] = useState({
    genres: [],
    demographics: [],
    year_buckets: []
  });
  const [answers, setAnswers] = useState({
    genres: [],
    audience: [],
    eras: [],
    vibe: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch quiz options from API
  useEffect(() => {
    const fetchQuizOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/quiz/options`);
        if (!response.ok) throw new Error('Failed to fetch quiz options');
        const data = await response.json();
        setQuizOptions(data);
      } catch (err) {
        setError('Failed to load quiz options: ' + err.message);
      }
    };
    fetchQuizOptions();
  }, []);

  const handleGenreToggle = (genre) => {
    setAnswers(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleAudienceToggle = (audience) => {
    setAnswers(prev => ({
      ...prev,
      audience: prev.audience.includes(audience)
        ? prev.audience.filter(a => a !== audience)
        : [...prev.audience, audience]
    }));
  };

  const handleEraToggle = (era) => {
    setAnswers(prev => ({
      ...prev,
      eras: prev.eras.includes(era)
        ? prev.eras.filter(e => e !== era)
        : [...prev.eras, era]
    }));
  };

  const handleVibeChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      vibe: e.target.value
    }));
  };

  const submitQuiz = async () => {
    if (answers.genres.length === 0 && answers.audience.length === 0 && answers.eras.length === 0) {
      setError('Please select at least one preference');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) throw new Error('Failed to get recommendations');

      const data = await response.json();
      onQuizComplete(data.recommendations);
    } catch (err) {
      setError('Failed to get recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="quiz-step">
            <h2>🌸 What genres do you enjoy?</h2>
            <p className="quiz-subtitle">Select all that apply</p>
            <div className="options-grid">
              {quizOptions.genres.map(genre => (
                <label key={genre} className="option-card">
                  <input
                    type="checkbox"
                    checked={answers.genres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span className="option-text">{genre}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="quiz-step">
            <h2>👥 What target audience do you prefer?</h2>
            <p className="quiz-subtitle">Choose your preferred demographics</p>
            <div className="options-grid">
              {quizOptions.demographics.map(demographic => (
                <label key={demographic} className="option-card">
                  <input
                    type="checkbox"
                    checked={answers.audience.includes(demographic)}
                    onChange={() => handleAudienceToggle(demographic)}
                  />
                  <span className="option-text">
                    {demographic}
                    {demographic === 'Shōnen' && ' (Young boys)'}
                    {demographic === 'Shōjo' && ' (Young girls)'}
                    {demographic === 'Seinen' && ' (Adult men)'}
                    {demographic === 'Josei' && ' (Adult women)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="quiz-step">
            <h2>📅 What era of manga do you like?</h2>
            <p className="quiz-subtitle">Select your preferred time periods</p>
            <div className="options-grid">
              {quizOptions.year_buckets.map(bucket => (
                <label key={bucket} className="option-card">
                  <input
                    type="checkbox"
                    checked={answers.eras.includes(bucket)}
                    onChange={() => handleEraToggle(bucket)}
                  />
                  <span className="option-text">
                    {bucket === 'classic' && 'Classic (70s-90s)'}
                    {bucket === '2000s' && '2000s (2000-2009)'}
                    {bucket === 'modern' && 'Modern (2010-present)'}
                    {!['classic', '2000s', 'modern'].includes(bucket) && bucket}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="quiz-step">
            <h2>🎭 Describe your reading vibe</h2>
            <p className="quiz-subtitle">What kind of mood are you in? (Optional)</p>
            <div className="vibe-input">
              <textarea
                value={answers.vibe}
                onChange={handleVibeChange}
                placeholder="e.g., dark psychological, lighthearted comedy, epic adventure, slice of life..."
                rows="4"
                className="vibe-textarea"
              />
            </div>
            <div className="quiz-summary">
              <h3>Your Preferences:</h3>
              <div className="summary-item">
                <strong>Genres:</strong> {answers.genres.length > 0 ? answers.genres.join(', ') : 'None selected'}
              </div>
              <div className="summary-item">
                <strong>Audience:</strong> {answers.audience.length > 0 ? answers.audience.join(', ') : 'None selected'}
              </div>
              <div className="summary-item">
                <strong>Eras:</strong> {answers.eras.length > 0 ? answers.eras.join(', ') : 'None selected'}
              </div>
              {answers.vibe && (
                <div className="summary-item">
                  <strong>Vibe:</strong> {answers.vibe}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>🌸 MangaMatcher Quiz</h1>
        <p>Help us find your perfect manga recommendations!</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicator">
          Step {currentStep} of 4
        </div>
      </div>

      <div className="quiz-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {renderStep()}

        <div className="quiz-navigation">
          {currentStep > 1 && (
            <button onClick={prevStep} className="btn btn-secondary">
              ← Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button onClick={nextStep} className="btn btn-primary">
              Next →
            </button>
          ) : (
            <button 
              onClick={submitQuiz} 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Finding Recommendations...' : 'Get My Recommendations! 🌸'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;

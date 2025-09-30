import React, { useState, useEffect } from 'react';
import './Quiz.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Quiz({ onQuizComplete, onError }) {
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
        vibe: []
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
                const errorMsg = 'Failed to load quiz options: ' + err.message;
                setError(errorMsg);
                if (onError) onError(errorMsg);
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

    const handleVibeToggle = (vibe) => {
        setAnswers(prev => ({
            ...prev,
            vibe: prev.vibe.includes(vibe)
                ? prev.vibe.filter(v => v !== vibe)
                : [...prev.vibe, vibe]
        }));
    };

    const submitQuiz = async () => {
        if (answers.genres.length === 0 && answers.audience.length === 0 && answers.eras.length === 0 && answers.vibe.length === 0) {
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
            console.log('Quiz API response:', data);
            console.log('Calling onQuizComplete with:', data);
            onQuizComplete(data);
        } catch (err) {
            const errorMsg = 'Failed to get recommendations: ' + err.message;
            setError(errorMsg);
            if (onError) onError(errorMsg);
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
                                        {demographic === 'Shōnen' && ' (Young Men)'}
                                        {demographic === 'Shōjo' && ' (Young Women)'}
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
                            {[
                                { value: 'classic', label: 'Classic (70s-90s)' },
                                { value: '2000s', label: '2000s (2000-2009)' },
                                { value: 'modern', label: 'Modern (2010-present)' }
                            ].map(era => (
                                <label key={era.value} className="option-card">
                                    <input
                                        type="checkbox"
                                        checked={answers.eras.includes(era.value)}
                                        onChange={() => handleEraToggle(era.value)}
                                    />
                                    <span className="option-text">{era.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            //Make this part of the database
            case 4:
                return (
                    <div className="quiz-step">
                        <h2>🎭 What's your reading mood?</h2>
                        <p className="quiz-subtitle">Select the vibes that appeal to you</p>
                        <div className="options-grid">
                            {['Dark & Psychological', 'Lighthearted Comedy', 'Epic Adventure', 'Slice of Life', 'Romantic', 'Action-Packed', 'Mysterious', 'Heartwarming'].map(vibe => (
                                <label key={vibe} className="option-card">
                                    <input
                                        type="checkbox"
                                        checked={answers.vibe.includes(vibe)}
                                        onChange={() => handleVibeToggle(vibe)}
                                    />
                                    <span className="option-text">{vibe}</span>
                                </label>
                            ))}
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
                            <div className="summary-item">
                                <strong>Mood:</strong> {answers.vibe.length > 0 ? answers.vibe.join(', ') : 'None selected'}
                            </div>
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
                <h1>🌸 Manga Preferences Quiz</h1>
                <p>Help us find your perfect manga match!</p>
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

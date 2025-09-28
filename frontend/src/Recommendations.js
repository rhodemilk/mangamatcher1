import React, { useState, useEffect } from 'react';
import './Recommendations.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Recommendations({ recommendations, onBackToQuiz }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentManga, setCurrentManga] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [likedManga, setLikedManga] = useState([]);
    const [rejectedManga, setRejectedManga] = useState([]);

    useEffect(() => {
        if (recommendations && recommendations.length > 0) {
            setCurrentManga(recommendations[currentIndex]);
        }
    }, [recommendations, currentIndex]);

    const handleSwipe = (direction) => {
        if (isAnimating || !currentManga) return;

        setIsAnimating(true);

        if (direction === 'like') {
            setLikedManga(prev => [...prev, currentManga]);
        } else {
            setRejectedManga(prev => [...prev, currentManga]);
        }

        // Move to next manga after animation
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setIsAnimating(false);
        }, 300);
    };

    const handleLike = () => handleSwipe('like');
    const handleReject = () => handleSwipe('reject');

    const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft') {
            handleReject();
        } else if (e.key === 'ArrowRight') {
            handleLike();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="recommendations-container">
                <div className="no-recommendations">
                    <h2>No recommendations found</h2>
                    <p>Try adjusting your preferences in the quiz.</p>
                    <button onClick={onBackToQuiz} className="btn btn-primary">
                        Back to Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (currentIndex >= recommendations.length) {
        return (
            <div className="recommendations-container">
                <div className="results-summary">
                    <h2>🌸 You've seen all recommendations!</h2>
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-number">{likedManga.length}</span>
                            <span className="stat-label">Liked</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{rejectedManga.length}</span>
                            <span className="stat-label">Passed</span>
                        </div>
                    </div>

                    {likedManga.length > 0 && (
                        <div className="liked-manga">
                            <h3>Your Liked Manga:</h3>
                            <div className="liked-list">
                                {likedManga.map((manga, index) => (
                                    <div key={index} className="liked-item">
                                        <h4>{manga.manga.title}</h4>
                                        <p>by {manga.manga.author}</p>
                                        {manga.manga.amazon_link && (
                                            <a
                                                href={manga.manga.amazon_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="amazon-link"
                                            >
                                                View on Amazon
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={onBackToQuiz} className="btn btn-primary">
                        Take Quiz Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recommendations-container">
            <div className="recommendations-header">
                <h1>🌸 MangaMatcher</h1>
                <div className="progress-info">
                    <span>{currentIndex + 1} of {recommendations.length}</span>
                </div>
            </div>

            <div className="card-container">
                <div
                    className={`manga-card ${isAnimating ? 'swiping' : ''}`}
                    key={currentIndex}
                >
                    <div className="card-image">
                        {currentManga?.manga.cover_image_url ? (
                            <img
                                src={currentManga.manga.cover_image_url}
                                alt={currentManga.manga.title}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <div className="no-image" style={{ display: currentManga?.manga.cover_image_url ? 'none' : 'block' }}>
                            <div className="no-image-icon">📚</div>
                        </div>
                    </div>

                    <div className="card-content">
                        <h2 className="manga-title">{currentManga?.manga.title}</h2>
                        <p className="manga-author">by {currentManga?.manga.author}</p>

                        <div className="manga-details">
                            <div className="detail-item">
                                <span className="detail-label">Genre:</span>
                                <span className="detail-value">{currentManga?.manga.genre}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Demographic:</span>
                                <span className="detail-value">{currentManga?.manga.demographic}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Year:</span>
                                <span className="detail-value">{currentManga?.manga.year}</span>
                            </div>
                            {currentManga?.manga.rating_avg && (
                                <div className="detail-item">
                                    <span className="detail-label">Rating:</span>
                                    <span className="detail-value">⭐ {currentManga.manga.rating_avg}/100</span>
                                </div>
                            )}
                        </div>

                        {currentManga?.manga.description && (
                            <div className="manga-description">
                                <p>{currentManga.manga.description}</p>
                            </div>
                        )}

                        {currentManga?.manga.tags && (
                            <div className="manga-tags">
                                {currentManga.manga.tags.split(', ').slice(0, 5).map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button
                    className="action-btn reject-btn"
                    onClick={handleReject}
                    disabled={isAnimating}
                >
                    ✕
                </button>
                <button
                    className="action-btn like-btn"
                    onClick={handleLike}
                    disabled={isAnimating}
                >
                    ♥
                </button>
            </div>

            <div className="instructions">
                <p>Use the buttons to swipe</p>
            </div>
        </div>
    );
}

export default Recommendations;
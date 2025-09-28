import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Recommendations.css';
import { getCharacterForManga } from './characterDatabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Recommendations({ recommendations, onBackToQuiz }) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentManga, setCurrentManga] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [likedManga, setLikedManga] = useState([]);
    const [rejectedManga, setRejectedManga] = useState([]);
    const [isFlipped, setIsFlipped] = useState(false);

    // Swipe functionality state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
    const [swipeDirection, setSwipeDirection] = useState(null);
    const cardRef = useRef(null);

    useEffect(() => {
        if (recommendations && recommendations.length > 0) {
            setCurrentManga(recommendations[currentIndex]);
            setIsFlipped(false); // Reset flip state when changing cards
        }
    }, [recommendations, currentIndex]);

    const handleCardClick = (e) => {
        // Only flip if not dragging
        if (!isDragging) {
            setIsFlipped(!isFlipped);
        }
    };

    // Touch/Mouse event handlers for swiping
    const handleStart = (clientX, clientY) => {
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
        setDragCurrent({ x: clientX, y: clientY });
        setSwipeDirection(null);
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;

        setDragCurrent({ x: clientX, y: clientY });

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 50) {
                setSwipeDirection('right');
            } else if (deltaX < -50) {
                setSwipeDirection('left');
            } else {
                setSwipeDirection(null);
            }
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        const deltaX = dragCurrent.x - dragStart.x;
        const deltaY = dragCurrent.y - dragStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Check if it's a valid swipe (minimum distance and horizontal movement)
        if (distance > 100 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                handleSwipe('like');
            } else {
                handleSwipe('reject');
            }
        }

        // Reset drag state
        setDragStart({ x: 0, y: 0 });
        setDragCurrent({ x: 0, y: 0 });
        setSwipeDirection(null);
    };

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // Touch events
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    const handleSwipe = (direction) => {
        if (isAnimating || !currentManga) return;

        setIsAnimating(true);

        if (direction === 'like') {
            const newLikedManga = [...likedManga, currentManga];
            setLikedManga(newLikedManga);
            // Save to localStorage
            localStorage.setItem('likedManga', JSON.stringify(newLikedManga));
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

    const handleChatWithCharacter = (manga) => {
        const character = getCharacterForManga(manga.manga.title);
        if (character) {
            navigate('/chats');
        }
    };

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

    // Add global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, dragStart, dragCurrent]);

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
                                        <div className="liked-item-actions">
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
                                            <button
                                                onClick={() => handleChatWithCharacter(manga)}
                                                className="chat-character-btn"
                                            >
                                                💬 Chat with Character
                                            </button>
                                        </div>
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
                    ref={cardRef}
                    className={`manga-card ${isAnimating ? 'swiping' : ''} ${isFlipped ? 'flipped' : ''} ${isDragging ? 'dragging' : ''}`}
                    key={currentIndex}
                    onClick={handleCardClick}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={{
                        transform: isDragging ?
                            `translateX(${dragCurrent.x - dragStart.x}px) rotate(${(dragCurrent.x - dragStart.x) * 0.1}deg)` :
                            undefined
                    }}
                >
                    <div className="manga-card-inner">
                        <div className="manga-card-front">
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

                        <div className="manga-card-back">
                            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>📖 {currentManga?.manga.title}</h2>
                            <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                                <p><strong>Author:</strong> {currentManga?.manga.author}</p>
                                <p><strong>Publisher:</strong> {currentManga?.manga.publisher}</p>
                                <p><strong>Volumes:</strong> {currentManga?.manga.num_of_vol}</p>
                                <p><strong>Sales:</strong> {currentManga?.manga.sales}</p>
                            </div>
                            {currentManga?.manga.amazon_link && (
                                <a
                                    href={currentManga.manga.amazon_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'white',
                                        textDecoration: 'underline',
                                        fontSize: '1.1rem',
                                        marginTop: '20px'
                                    }}
                                >
                                    🛒 Buy on Amazon
                                </a>
                            )}
                            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: 0.8 }}>
                                Click to flip back
                            </p>
                        </div>
                    </div>

                    {/* Swipe direction overlays */}
                    {isDragging && (
                        <>
                            {swipeDirection === 'right' && (
                                <div className="swipe-overlay like-overlay">
                                    <div className="swipe-text">LIKE</div>
                                </div>
                            )}
                            {swipeDirection === 'left' && (
                                <div className="swipe-overlay reject-overlay">
                                    <div className="swipe-text">REJECT</div>
                                </div>
                            )}
                        </>
                    )}
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
                <p>Swipe left to reject, right to like, or use the buttons below</p>
            </div>
        </div>
    );
}

export default Recommendations;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { getCharacterForManga } from './characterDatabase';

function Profile() {
    const navigate = useNavigate();
    const [likedManga, setLikedManga] = useState([]);
    const [userStats, setUserStats] = useState({
        totalQuizzes: 0,
        totalLiked: 0,
        favoriteGenres: [],
        favoriteDemographics: []
    });

    useEffect(() => {
        // Load liked manga from localStorage
        const savedLikedManga = localStorage.getItem('likedManga');
        if (savedLikedManga) {
            setLikedManga(JSON.parse(savedLikedManga));
        }

        // Load user stats from localStorage
        const savedStats = localStorage.getItem('userStats');
        if (savedStats) {
            setUserStats(JSON.parse(savedStats));
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('likedManga');
        localStorage.removeItem('userStats');
        setLikedManga([]);
        setUserStats({
            totalQuizzes: 0,
            totalLiked: 0,
            favoriteGenres: [],
            favoriteDemographics: []
        });
    };

    const handleChatWithCharacter = (manga) => {
        const character = getCharacterForManga(manga.manga.title);
        if (character) {
            navigate('/chats', {
                state: {
                    selectedCharacter: { ...character, manga: manga.manga },
                    manga: manga.manga
                }
            });
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-main-content">
                <div className="profile-header">
                    <h1>🌸 Your MangaMatcher Profile</h1>
                    <p>Track your manga journey and preferences</p>
                </div>

                <div className="profile-content">

                    {userStats.favoriteGenres.length > 0 && (
                        <div className="preferences-section">
                            <h2>🎯 Your Preferences</h2>
                            <div className="preference-group">
                                <h3>Favorite Genres</h3>
                                <div className="preference-tags">
                                    {userStats.favoriteGenres.map((genre, index) => (
                                        <span key={index} className="preference-tag genre-tag">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {userStats.favoriteDemographics.length > 0 && (
                                <div className="preference-group">
                                    <h3>Favorite Demographics</h3>
                                    <div className="preference-tags">
                                        {userStats.favoriteDemographics.map((demo, index) => (
                                            <span key={index} className="preference-tag demo-tag">
                                                {demo}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {likedManga.length > 0 && (
                        <div className="liked-manga-section">
                            <h2>❤️ Your Picks</h2>
                            <div className="manga-grid">
                                {likedManga.map((manga, index) => (
                                    <div key={index} className="profile-manga-card">
                                        <div className="profile-manga-image">
                                            {manga.manga.cover_image_url ? (
                                                <img
                                                    src={manga.manga.cover_image_url}
                                                    alt={manga.manga.title}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="profile-no-image" style={{ display: manga.manga.cover_image_url ? 'none' : 'flex' }}>
                                                <span>📚</span>
                                            </div>
                                        </div>
                                        <div className="profile-manga-info">
                                            <h3>{manga.manga.title}</h3>
                                            <p>by {manga.manga.author}</p>
                                            <div className="profile-manga-meta">
                                                <span className="profile-genre">{manga.manga.genre}</span>
                                                <span className="profile-demographic">{manga.manga.demographic}</span>
                                            </div>
                                            <div className="profile-manga-actions">
                                                {manga.manga.amazon_link && (
                                                    <a
                                                        href={manga.manga.amazon_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="profile-amazon-link"
                                                    >
                                                        View on Amazon
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleChatWithCharacter(manga)}
                                                    className="profile-chat-character-btn"
                                                >
                                                    💬 Chat with Character
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {likedManga.length === 0 && userStats.totalQuizzes === 0 && (
                        <div className="empty-state">
                            <h2>🌟 Start Your Manga Journey!</h2>
                            <p>Take your first quiz to discover amazing manga and build your profile.</p>
                            <a href="/" className="btn btn-primary">Take Quiz</a>
                        </div>
                    )}

                    <div className="profile-actions">
                        <button onClick={clearHistory} className="btn btn-secondary">
                            Clear History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Chats.css';
import { getCharacterForManga } from './characterDatabase';

function Chats() {
    const location = useLocation();
    const [likedManga, setLikedManga] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load liked manga from localStorage
        const savedLikedManga = localStorage.getItem('likedManga');
        if (savedLikedManga) {
            setLikedManga(JSON.parse(savedLikedManga));
        }

        // Load chat history from localStorage
        const savedChats = localStorage.getItem('chatHistory');
        if (savedChats) {
            setChatMessages(JSON.parse(savedChats));
        }
    }, []);

    // Handle character selection from navigation state
    useEffect(() => {
        if (location.state?.selectedCharacter && location.state?.manga) {
            const { selectedCharacter: passedCharacter, manga } = location.state;
            
            // Add the manga to liked manga if it's not already there
            const savedLikedManga = localStorage.getItem('likedManga');
            let currentLikedManga = savedLikedManga ? JSON.parse(savedLikedManga) : [];
            
            const mangaExists = currentLikedManga.some(liked => liked.manga.title === manga.title);
            if (!mangaExists) {
                currentLikedManga.push({ manga });
                setLikedManga(currentLikedManga);
                localStorage.setItem('likedManga', JSON.stringify(currentLikedManga));
            }

            // Open the chat for this character
            openChat({ manga });
            
            // Clear the location state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, selectedCharacter]);

    const openChat = (manga) => {
        const character = getCharacterForManga(manga.manga.title);
        setSelectedCharacter({ ...character, manga: manga.manga });

        // Initialize chat if it doesn't exist
        if (!chatMessages[manga.manga.title]) {
            const initialMessage = {
                id: Date.now(),
                type: 'character',
                message: `Hello! I'm ${character.name} from "${manga.manga.title}". It's nice to meet you! What would you like to talk about?`,
                timestamp: new Date().toISOString()
            };

            setChatMessages(prev => ({
                ...prev,
                [manga.manga.title]: [initialMessage]
            }));
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedCharacter) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            message: newMessage.trim(),
            timestamp: new Date().toISOString()
        };

        // Add user message
        const updatedMessages = {
            ...chatMessages,
            [selectedCharacter.manga.title]: [
                ...(chatMessages[selectedCharacter.manga.title] || []),
                userMessage
            ]
        };

        setChatMessages(updatedMessages);
        setNewMessage('');

        // Generate AI response
        setTimeout(async () => {
            const aiResponse = await generateAIResponse(selectedCharacter, newMessage.trim());
            const characterMessage = {
                id: Date.now() + 1,
                type: 'character',
                message: aiResponse,
                timestamp: new Date().toISOString()
            };

            const finalMessages = {
                ...updatedMessages,
                [selectedCharacter.manga.title]: [
                    ...updatedMessages[selectedCharacter.manga.title],
                    characterMessage
                ]
            };

            setChatMessages(finalMessages);
        }, 1000);
    };

    const generateAIResponse = async (character, userMessage) => {
        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    character_name: character.name,
                    manga_title: character.manga.title,
                    message: userMessage,
                    character_personality: character.personality
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                return data.response;
            } else {
                throw new Error(data.error || 'Failed to get AI response');
            }
        } catch (error) {
            console.error('AI chat error:', error);
            // Fallback to default responses if AI fails
            const fallbackResponses = [
                "I'm sorry, I'm having trouble responding right now. But I'm still here to chat!",
                "Something seems to be wrong with my connection. Let's try talking about something else!",
                "I'm having a bit of trouble, but I'd love to keep our conversation going!",
                "There seems to be a technical issue, but I'm still listening to you!"
            ];
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
    };

    const saveChatHistory = () => {
        localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    };

    useEffect(() => {
        saveChatHistory();
    }, [chatMessages]);

    const clearChatHistory = () => {
        localStorage.removeItem('chatHistory');
        setChatMessages({});
        setSelectedCharacter(null);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (likedManga.length === 0) {
        return (
            <div className="chats-container">
                <div className="chats-content">
                    <div className="chats-header">
                        <h1>💬 Character Yaps</h1>
                        <p>Yap with your favorite manga characters!</p>
                    </div>
                    <div className="empty-chats">
                        <div className="empty-state">
                            <h2>🌟 Start Your Character Journey</h2>
                            <p>Take a quiz and swipe on some manga to unlock character chats</p>
                            <Link to="/" className="btn btn-primary">Take Quiz</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chats-container">
            <div className="chats-content">
                <div className="chats-header">
                    <h1>Character Chat</h1>
                    <p>Chat with your favorite manga characters!</p>
                </div>

                <div className="chats-main-content">
                    <div className="character-list">
                        <h2>Your Characters</h2>
                        <div className="character-grid">
                            {likedManga.map((manga, index) => {
                                const character = getCharacterForManga(manga.manga.title);
                                const hasUnreadMessages = chatMessages[manga.manga.title]?.some(
                                    msg => msg.type === 'character' &&
                                        new Date(msg.timestamp) > new Date(localStorage.getItem(`lastRead_${manga.manga.title}`) || 0)
                                );

                                return (
                                    <div
                                        key={index}
                                        className={`character-card ${selectedCharacter?.manga.title === manga.manga.title ? 'active' : ''}`}
                                        onClick={() => openChat(manga)}
                                    >
                                        <div className="character-avatar">
                                            <img
                                                src={manga.manga.cover_image_url}
                                                alt={`${character.name} from ${manga.manga.title}`}
                                                className="avatar-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <span className="avatar-icon" style={{ display: 'none' }}>👤</span>
                                        </div>
                                        <div className="character-info">
                                            <h3>{character.name}</h3>
                                            <p>from {manga.manga.title}</p>
                                            <div className="character-traits">
                                                {character.personality.traits.slice(0, 3).map((trait, i) => (
                                                    <span key={i} className="trait-tag">{trait}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {hasUnreadMessages && <div className="unread-indicator"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="chat-area">
                        {selectedCharacter ? (
                            <>
                                <div className="chat-header">
                                    <div className="character-details">
                                        <h3>{selectedCharacter.name}</h3>
                                        <p>from {selectedCharacter.manga.title}</p>
                                    </div>
                                    <button onClick={clearChatHistory} className="clear-btn">
                                        Clear All Chats
                                    </button>
                                </div>

                                <div className="messages-container">
                                    {chatMessages[selectedCharacter.manga.title]?.map((message) => (
                                        <div key={message.id} className={`message ${message.type}`}>
                                            <div className="message-content">
                                                <p>{message.message}</p>
                                                <span className="message-time">{formatTime(message.timestamp)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="message-input">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder={`Message ${selectedCharacter.name}...`}
                                    />
                                    <button onClick={sendMessage} disabled={!newMessage.trim()}>
                                        Send
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <h3>Select a character to start chatting!</h3>
                                <p>Choose from your liked manga characters above.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chats;

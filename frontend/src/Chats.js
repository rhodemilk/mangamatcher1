import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Chats.css';
import { getCharacterForManga } from './characterDatabase';

function Chats() {
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

        // Generate AI response (placeholder for now)
        setTimeout(() => {
            const aiResponse = generateAIResponse(selectedCharacter, newMessage.trim());
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

    const generateAIResponse = (character, userMessage) => {
        // Placeholder AI responses based on character personality
        const responses = {
            "Black Clover": [
                "I'm gonna be the Wizard King! That's my dream and I'll never give up on it!",
                "Even though I don't have magic, I have my friends and my determination!",
                "You know what? I believe in never giving up! That's my magic!",
                "I'm always hungry! Do you have any food? Fighting makes me so hungry!"
            ],
            "Spy × Family": [
                "For the mission, I need to maintain my cover. But I do care about my family.",
                "I'm a professional, but even spies have feelings, you know.",
                "Anya is such a handful, but I wouldn't trade her for anything.",
                "Sometimes the best missions are the ones that teach you about love."
            ],
            "One Piece": [
                "I'm gonna be King of the Pirates! That's my dream!",
                "Meat! I want meat! Fighting makes me so hungry!",
                "I want to be free and sail the seas with my crew!",
                "My friends are my treasure! I'll protect them no matter what!"
            ],
            "Naruto": [
                "I'm gonna be Hokage! Believe it!",
                "I never go back on my word! That's my ninja way!",
                "I used to be alone, but now I have friends who believe in me!",
                "Even if I fail, I'll keep trying until I succeed!"
            ],
            "Dragon Ball": [
                "I want to fight strong opponents! That's how I get stronger!",
                "I'm hungry! Fighting always makes me hungry!",
                "I love training and getting stronger! It's so much fun!",
                "I'll protect Earth and my friends no matter what!"
            ],
            "default": [
                "That's interesting! Tell me more about yourself.",
                "I'm curious about your world. What's it like?",
                "Every story has its own magic, don't you think?",
                "I love meeting new people and hearing their stories!"
            ]
        };

        const characterResponses = responses[character.manga.title] || responses.default;
        return characterResponses[Math.floor(Math.random() * characterResponses.length)];
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
                <div className="chats-header">
                    <h1>💬 Character Chats</h1>
                    <p>Chat with your favorite manga characters!</p>
                </div>
                <div className="empty-chats">
                    <div className="empty-state">
                        <h2>🌟 Start Your Character Journey!</h2>
                        <p>Take a quiz and like some manga to unlock character chats!</p>
                        <Link to="/" className="btn btn-primary">Take Quiz</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chats-container">
            <div className="chats-header">
                <h1>💬 Character Chats</h1>
                <p>Chat with your favorite manga characters!</p>
            </div>

            <div className="chats-content">
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
                                        <span className="avatar-icon">👤</span>
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
    );
}

export default Chats;

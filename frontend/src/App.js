import React, { useState, useEffect } from 'react';
import './App.css';

// API base URL - can be moved to environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [users, setUsers] = useState([]);
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ username: '', email: '' });
  const [newManga, setNewManga] = useState({ title: '', author: '', genre: '', rating: 0 });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch manga from API
  const fetchManga = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/manga`);
      if (!response.ok) throw new Error('Failed to fetch manga');
      const data = await response.json();
      setManga(data);
    } catch (err) {
      setError('Error fetching manga: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error('Failed to create user');
      setNewUser({ username: '', email: '' });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError('Error creating user: ' + err.message);
    }
  };

  // Create new manga
  const createManga = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/manga`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newManga),
      });
      if (!response.ok) throw new Error('Failed to create manga');
      setNewManga({ title: '', author: '', genre: '', rating: 0 });
      fetchManga(); // Refresh the list
    } catch (err) {
      setError('Error creating manga: ' + err.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchManga();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌸 MangaMatcher</h1>
        <p>ShellHacks 2026 Project</p>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}
      </header>

      <main className="main-content">
        {/* User Management Section */}
        <section className="section">
          <h2>Users</h2>
          
          <form onSubmit={createUser} className="form">
            <h3>Add New User</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
              <button type="submit">Add User</button>
            </div>
          </form>

          <div className="list">
            <h3>Current Users ({users.length})</h3>
            {users.map(user => (
              <div key={user.id} className="item">
                <strong>{user.username}</strong> - {user.email}
                <small>Created: {new Date(user.created_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </section>

        {/* Manga Management Section */}
        <section className="section">
          <h2>Manga Collection</h2>
          
          <form onSubmit={createManga} className="form">
            <h3>Add New Manga</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Title"
                value={newManga.title}
                onChange={(e) => setNewManga({...newManga, title: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={newManga.author}
                onChange={(e) => setNewManga({...newManga, author: e.target.value})}
              />
              <input
                type="text"
                placeholder="Genre"
                value={newManga.genre}
                onChange={(e) => setNewManga({...newManga, genre: e.target.value})}
              />
              <input
                type="number"
                placeholder="Rating (0-10)"
                min="0"
                max="10"
                step="0.1"
                value={newManga.rating}
                onChange={(e) => setNewManga({...newManga, rating: parseFloat(e.target.value) || 0})}
              />
              <button type="submit">Add Manga</button>
            </div>
          </form>

          <div className="list">
            <h3>Manga Library ({manga.length})</h3>
            {manga.map(item => (
              <div key={item.id} className="item manga-item">
                <h4>{item.title}</h4>
                <p><strong>Author:</strong> {item.author}</p>
                <p><strong>Genre:</strong> {item.genre}</p>
                <p><strong>Rating:</strong> {item.rating}/10 ⭐</p>
                <small>Added: {new Date(item.created_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Team: Rhode, Gabi, Ethan "the rod" Rodriguez, Alexander</p>
      </footer>
    </div>
  );
}

export default App;

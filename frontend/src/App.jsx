import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TaskList from './components/TaskList';
import { deleteAccount } from './api';
import './index.css';

function App() {
  // Retrieve token and username from localStorage on initial render for persistent auth sessions
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  // Toggle state to switch between Login and Registration views
  const [isRegistering, setIsRegistering] = useState(false);
  
  // State to manage confirmation modal visibility for account deletion
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handles successful user login by storing credentials in state and localStorage
  const handleLoginSuccess = (newToken, loggedInUsername) => {
    setToken(newToken);
    setUsername(loggedInUsername);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', loggedInUsername);
  };

  // Clears user session from React state and removes saved tokens from localStorage
  const handleLogout = () => {
    setToken('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  // Sends account deletion request to the backend API and logs out the user on success
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(token);
      alert('Your account has been deleted.');
      handleLogout(); // Log out and reset session state after successful deletion
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account.');
    } finally {
      setIsModalOpen(false); // Close confirmation modal regardless of outcome
    }
  };

  return (
    <div className="app-container">
      <h1>Task Manager</h1>

      {/* Header section displaying logged-in user welcome message */}
      {token && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#555' }}>
            Welcome, <strong>{username}</strong>! 
          </p>
        </div>
      )}

      {/* Conditional Rendering: Authenticated View vs. Auth Forms View */}
      {token ? (
        <div>
          {/* Header Controls for Logout and Delete Account */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={handleLogout} style={{ flex: 1 }}>
              Logout
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="delete-btn"
              style={{ flex: 1 }}
            >
              Delete Account
            </button>
          </div>

          {/* Main Task Manager Interface Component */}
          <TaskList token={token} />

          {/* Account Deletion Confirmation Modal Overlay */}
          {isModalOpen && (
            <div className="modal-backdrop">
              <div className="modal-content">
                <h2>Delete Account</h2>
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#777' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount} className="delete-btn">
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unauthenticated View: Toggle between Register and Login forms */
        <div>
          {isRegistering ? (
            <div>
              <RegisterForm onRegisterSuccess={() => setIsRegistering(false)} />
              <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account?{' '}
                <button onClick={() => setIsRegistering(false)}>Login here</button>
              </p>
            </div>
          ) : (
            <div>
              <LoginForm onLoginSuccess={handleLoginSuccess} />
              <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Don't have an account?{' '}
                <button onClick={() => setIsRegistering(true)}>Register here</button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
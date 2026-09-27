import React, { useState } from 'react';
import { registerUser } from '../api';

function RegisterForm({ onRegisterSuccess }) {
  // State variables for form inputs and feedback messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Handles form submission and registration API request
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page refresh on form submit
    try {
      // Send user credentials to the backend API
      await registerUser(username, password);
      
      // Update UI feedback on success and clear inputs
      setMessage('User created successfully! You can now login.');
      setUsername('');
      setPassword('');

      // Trigger callback if passed from parent component (e.g., redirecting to login view)
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setMessage('Registration failed. Username might be taken.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h2>Register</h2>
      
      {/* Display success or error notification message */}
      {message && <p>{message}</p>}

      {/* Username Field */}
      <div>
        <label>Username: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterForm;
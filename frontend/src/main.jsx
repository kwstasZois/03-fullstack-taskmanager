import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Initialize the React application and attach it to the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode enables extra checks and warnings in development mode
  <React.StrictMode>
    {/* The main root component of your application */}
    <App />
  </React.StrictMode>
);
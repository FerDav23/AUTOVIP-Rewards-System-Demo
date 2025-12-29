import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QrBridge from './components/QrBridge';
import RewardsPoints from './components/RewardsPoints';
import UserProfile from './components/UserProfile';
import { getCurrentUserMembership } from './services/user';
import { initializeDummyUserData } from './services/dummyUsers';
import initColors from './config/init-colors';
import './variables.css';
import './base.css';
import './components/mobile.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize colors based on user membership
  const initializeColors = () => {
    const membership = getCurrentUserMembership();
    initColors(membership);
  };
  
  useEffect(() => {
    // Initialize dummy user data in localStorage (always sets test membership)
    initializeDummyUserData();
    
    // Always initialize colors based on membership (even if not authenticated, for testing)
    initializeColors();
    
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Re-initialize colors when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      initializeColors();
    } else {
      initColors(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/rewards" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/rewards" /> : <Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
         <Route 
          path="/qr-login" 
          element={<QrBridge setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/rewards"
          element={isAuthenticated ? <RewardsPoints setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <UserProfile setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

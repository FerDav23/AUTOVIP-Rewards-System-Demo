import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AUTOVIPLogin from './components/AUTOVIPLogin';
import ManagerLogin from './components/ManagerLogin';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import QrBridge from './components/QrBridge';
import RewardsPoints from './components/RewardsPoints';
import UserProfile from './components/UserProfile';
import { getMembershipByUserId } from './services/autovipUsers';
import { verifyToken } from './services/user';
import initColors from './config/init-colors';
import './variables.css';
import './base.css';
import './components/mobile.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [membership, setMembership] = useState(null);
  
  // Initialize colors based on user membership
  const initializeColors = async () => {
    try {
      const userId = localStorage.getItem('autovipUserID');
      if (!userId) {
        initColors(null);
        return;
      }
      
      // Parse userId if it's stored as JSON string
      let parsedUserId;
      try {
        parsedUserId = JSON.parse(userId);
      } catch (error) {
        parsedUserId = userId;
      }
      
      const currentMembership = await getMembershipByUserId(parsedUserId);
      if (currentMembership && currentMembership.membership_id) {
        setMembership(currentMembership.membership_id);
        initColors(currentMembership.membership_id);
      } else {
        initColors(null);
      }
    } catch (error) {
      console.error('Failed to initialize colors:', error);
      initColors(null);
    }
  };
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      verifyToken()
        .then(() => {
          setIsAuthenticated(true);
          initializeColors();
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          setIsAuthenticated(false);
          initColors(null);
          setMembership(null);
        });
    } else {
      initColors(null);
      setMembership(null);
    }

    // Listen for storage changes to update membership dynamically
    const handleStorageChange = (e) => {
      if (e.key === 'autovipUserID' || e.key === 'authToken') {
        initializeColors();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Re-initialize colors when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      initializeColors();
    } else {
      initColors(null);
      setMembership(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/rewards" /> : <AUTOVIPLogin setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/rewards" /> : <AUTOVIPLogin setIsAuthenticated={setIsAuthenticated} />}
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
        <Route
          path="/manager-login"
          element={isAuthenticated ? <Navigate to="/manager-dashboard" /> : <ManagerLogin setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/manager-dashboard"
          element={isAuthenticated ? <ManagerDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/manager-login" />}
        />
      </Routes>
    </div>
  );
}

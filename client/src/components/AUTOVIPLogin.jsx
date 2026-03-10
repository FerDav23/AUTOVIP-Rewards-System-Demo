import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAutovipUser } from '../services/user';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import logoCIMImg from '../assets/CIM_LOGOTIPO.png';
import logoImg from '../assets/FJ-LOGOTIPO.png';
import AUTOVIPBackground from './AUTOVIPBackground';
import Alert from './Alert';
import logger from '../utils/logger';
import './AUTOVIPLogin.css';

export default function AUTOVIPLogin({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Remove root padding to make background cover full screen
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      const originalPadding = root.style.padding;
      const originalMarginBottom = root.style.marginBottom;
      const originalBackground = root.style.backgroundColor;
      
      root.style.padding = '0';
      root.style.marginBottom = '0';
      root.style.backgroundColor = 'transparent';
      
      return () => {
        root.style.padding = originalPadding;
        root.style.marginBottom = originalMarginBottom;
        root.style.backgroundColor = originalBackground;
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await loginAutovipUser(username, password);
      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate('/rewards');
    } catch (err) {
      console.error('Failed to login:', err);
        setError('Invalid credentials');
    }
  };

  return (
    <div className="autovip-login-container">
      <AUTOVIPBackground />
      <div className="autovip-login-form">
        <div className="autovip-logo-container">
          <img src={logoImg} alt="CIM Logo" className="autovip-login-logo autovip-login-logo-positioned" />
          <img src={logoCIMImg} alt="CIM Logo" className="autovip-login-logo" />
        </div>
        <h1 className="autovip-welcome-title">Welcome to the AUTOVIP System</h1>
        <h2>Sign In</h2>
        {error && <Alert variant="error" message={error} dismissible={true} />}
        <form onSubmit={handleSubmit}>
          <div className="autovip-form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="autovip-form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="autovip-login-button">Sign In</button>
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <button
              type="button"
              className="autovip-back-to-demo"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft /> Back to demo
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

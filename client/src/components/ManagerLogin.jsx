import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/user';
import logoCIMImg from '../assets/CIM_LOGOTIPO.png';
import logoImg from '../assets/FJ-LOGOTIPO.png';
import AUTOVIPBackground from './AUTOVIPBackground';
import './ManagerLogin.css';

export default function ManagerLogin({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      await login(username, password);
      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error during login or navigation:', err);
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="manager-login-container">
      <AUTOVIPBackground />
      <div className="manager-login-form">
        <div className="manager-logo-container">
          <img src={logoImg} alt="CIM Logo" className="manager-login-logo" style={{ 
            maxWidth: '70px', 
            height: '70px', 
            position: 'absolute',
            zIndex: 1,
            marginRight: '335px',
            marginTop: '-32px'
           }} />
          <img src={logoCIMImg} alt="CIM Logo" className="manager-login-logo" />
        </div>
        <h1 className="manager-welcome-title">Panel de Administración</h1>
        <h2>Acceso Gerentes</h2>
        {error && <div className="manager-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="manager-form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="manager-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="manager-login-button">Ingresar</button>
        
        </form>
      </div>
    </div>
  );
}

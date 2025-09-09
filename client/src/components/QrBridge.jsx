import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/user";
import './QrBridge.css';

export default function QrBridge({ setIsAuthenticated }) {
  const [status, setStatus] = useState("Procesando código QR…");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    // Ensure variables are strings
    const usernameStr = String(username || '');
    const passwordStr = String(password || '');
    
    try {
        setError('');
        setStatus("Iniciando sesión…");
        await login(usernameStr, passwordStr);
        if (setIsAuthenticated) setIsAuthenticated(true);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error during login or navigation:', err);
        setError('Credenciales inválidas. Por favor, verifique su código QR.');
        setStatus("Error en la autenticación");
      }
  }

  useEffect(() => {
    // Parse query params from the URL the phone opened
    const url = new URL(window.location.href);
    const userNameUrl = url.searchParams.get("userName");   // or 'token', 'username', etc.
    const passwordUrl = url.searchParams.get("password");

    if (!userNameUrl || !passwordUrl) {
      setStatus("Faltan parámetros del código QR.");
      setError("El código QR no contiene la información necesaria para iniciar sesión.");
      return;
    }
    handleLogin(userNameUrl, passwordUrl);

    // Fire POST to your backend
   
  }, []);

  const getStatusClass = () => {
    if (error) return 'error';
    if (status.includes('Procesando') || status.includes('Iniciando')) return 'processing';
    if (status.includes('Error')) return 'error';
    return '';
  };

  return (
    <div className="qr-bridge-container">
      <div className="qr-bridge-form">
        <h2>Inicio de Sesión con Código QR</h2>
        {error && <div className="error-message">{error}</div>}
        <div className={`status-message ${getStatusClass()}`}>
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}

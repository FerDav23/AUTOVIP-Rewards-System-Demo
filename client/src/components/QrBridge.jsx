import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAutovipUser } from "../services/user";
import Alert from './Alert';
import './QrBridge.css';

export default function QrBridge({ setIsAuthenticated }) {
  const [status, setStatus] = useState("Processing…");
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    // Ensure variables are strings
    const usernameStr = String(username || '');
    const passwordStr = String(password || '');
    
    try {
        setError('');
        setStatus("Signing in…");
        await loginAutovipUser(usernameStr, passwordStr);
        if (setIsAuthenticated) setIsAuthenticated(true);
        navigate('/rewards');
      } catch (err) {
        console.error('Failed to login:', err);
        setError('Invalid credentials. Please contact support.');
        setStatus("Authentication error");
      }
  }

  useEffect(() => {
    // Parse query params from the URL the phone opened
    const url = new URL(window.location.href);
    const userNameUrl = url.searchParams.get("userName");   // or 'token', 'username', etc.
    const passwordUrl = url.searchParams.get("password");

    if (!userNameUrl || !passwordUrl) {
      setStatus("Missing parameters.");
      setError("The code does not contain the information needed to sign in.");
      return;
    }
    handleLogin(userNameUrl, passwordUrl);

    // Fire POST to your backend
   
  }, []);

  const getStatusClass = () => {
    if (error) return 'error';
    if (status.includes('Processing') || status.includes('Signing')) return 'processing';
    if (status.includes('Error')) return 'error';
    return '';
  };

  return (
    <div className="qr-bridge-container">
      <div className="qr-bridge-form">
        <h2>Sign In</h2>
        {error && <Alert variant="error" message={error} dismissible={true} />}
        <div className={`status-message ${getStatusClass()}`}>
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import client from '../services/apiClient';
import Alert from './Alert';
import './CreateManager.css';

export default function CreateManager() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }
    
    try {
      const response = await client.post('/managers/', { name, username, password });
      setMessage(`Manager created successfully: ${response.data.name || username}`);
      setMessageType('success');
      setName('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create manager');
      setMessageType('error');
    }
  };

  return (
    <div className="create-manager-container">
      <div className="create-manager-card">
        <h2>Create Manager</h2>
        <p className="subtitle">Temporary page - delete after use</p>
        <form className="create-manager-form" onSubmit={handleSubmit}>
          <div className="create-manager-input-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="off"
              required
            />
          </div>
          <div className="create-manager-input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              required
            />
          </div>
          <div className="create-manager-input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="off"
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="create-manager-input-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="off"
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" className="create-manager-btn">Create Manager</button>
        </form>
        {message && (
          <Alert 
            variant={messageType === 'error' ? 'error' : messageType === 'success' ? 'success' : 'info'} 
            message={message} 
            dismissible={true}
          />
        )}
      </div>
    </div>
  );
}

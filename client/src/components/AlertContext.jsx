import { createContext, useContext, useState, useCallback } from 'react';
import Alert from './Alert';
import './Alert.css';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, variant = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      message,
      variant,
      duration
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 5000) => {
    return showAlert(message, 'success', duration);
  }, [showAlert]);

  const showWarning = useCallback((message, duration = 5000) => {
    return showAlert(message, 'warning', duration);
  }, [showAlert]);

  const showError = useCallback((message, duration = 5000) => {
    return showAlert(message, 'error', duration);
  }, [showAlert]);

  const showInfo = useCallback((message, duration = 5000) => {
    return showAlert(message, 'info', duration);
  }, [showAlert]);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{
      showAlert,
      showSuccess,
      showWarning,
      showError,
      showInfo,
      clearAll
    }}>
      {children}
      <div className="toast-container">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            message={alert.message}
            autoClose={alert.duration}
            onClose={() => removeAlert(alert.id)}
            dismissible={true}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

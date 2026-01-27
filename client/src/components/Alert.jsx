import { useEffect, useState } from 'react';
import './Alert.css';

/**
 * Alert Component
 * Displays alert messages with different variants: success, warning, error, info
 * 
 * @param {string} variant - Type of alert: 'success', 'warning', 'error', 'info'
 * @param {string} message - The message to display
 * @param {boolean} dismissible - Whether the alert can be dismissed
 * @param {number} autoClose - Auto-close delay in milliseconds (0 = no auto-close)
 * @param {function} onClose - Callback when alert is closed
 * @param {string} className - Additional CSS classes
 */
export default function Alert({ 
  variant = 'info', 
  message, 
  dismissible = true, 
  autoClose = 0,
  onClose,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(() => onClose(), 300); // Wait for animation
    }
  };

  if (!isVisible || !message) return null;

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div 
      className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`}
      role="alert"
    >
      <div className="alert-content">
        <span className="alert-icon">{icons[variant] || icons.info}</span>
        <span className="alert-message">{message}</span>
      </div>
      {dismissible && (
        <button 
          className="alert-close" 
          onClick={handleClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}

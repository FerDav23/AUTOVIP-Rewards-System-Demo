import { useEffect } from 'react';
import './Confirm.css';
import { FaExclamationTriangle, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * Confirm Component
 * Displays a confirmation modal dialog
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {string} title - The title of the confirmation dialog
 * @param {string} message - The message to display
 * @param {string} variant - Type of confirmation: 'danger', 'warning', 'info'
 * @param {string} confirmText - Text for the confirm button
 * @param {string} cancelText - Text for the cancel button
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 */
export default function Confirm({
  isOpen,
  title = 'Confirmar',
  message,
  variant = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !message) return null;

  const icons = {
    danger: <FaExclamationTriangle />,
    warning: <FaQuestionCircle />,
    info: <FaInfoCircle />
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  return (
    <div className="confirm-overlay" onClick={handleBackdropClick}>
      <div className={`confirm-modal confirm-${variant}`}>
        <div className="confirm-header">
          <div className="confirm-icon">{icons[variant] || icons.warning}</div>
          <h3 className="confirm-title">{title}</h3>
        </div>
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-footer">
          <button
            type="button"
            className="confirm-button confirm-button-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-button confirm-button-${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

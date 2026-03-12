import { useEffect } from 'react';
import { FaTimes, FaUser, FaUserTie, FaCoins, FaGift, FaCog, FaServer } from 'react-icons/fa';
import './DemoInstructionsModal.css';

const DEMO_INSTRUCTIONS_SEEN_KEY = 'autovip-demo-instructions-seen';

export function getDemoInstructionsSeen() {
  try {
    return localStorage.getItem(DEMO_INSTRUCTIONS_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDemoInstructionsSeen() {
  try {
    localStorage.setItem(DEMO_INSTRUCTIONS_SEEN_KEY, 'true');
  } catch {}
}

export default function DemoInstructionsModal({ open, onClose, markAsSeenOnClose = false }) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (markAsSeenOnClose) setDemoInstructionsSeen();
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose, markAsSeenOnClose]);

  const handleClose = () => {
    if (markAsSeenOnClose) setDemoInstructionsSeen();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="demo-instructions-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-instructions-title"
    >
      <div
        className="demo-instructions-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="demo-instructions-close"
          onClick={handleClose}
          aria-label="Close instructions"
        >
          <FaTimes />
        </button>
        <div className="demo-instructions-header">
          <h2 id="demo-instructions-title" className="demo-instructions-title">
            How to use this demo
          </h2>
          <p className="demo-instructions-subtitle">
            Explore the AUTOVIP rewards system with simulated data
          </p>
        </div>
        <div className="demo-instructions-body">
          <ol className="demo-instructions-list">
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaUser className="demo-instructions-icon" />
                Choose your role
              </span>
              <span className="demo-instructions-detail">
                Sign in as <strong>Client</strong> to see the rewards and points experience, or as <strong>Manager</strong> to access the admin dashboard.
              </span>
            </li>
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaCog className="demo-instructions-icon" />
                Use any credentials
              </span>
              <span className="demo-instructions-detail">
                No real login required. Enter any username and password to continue.
              </span>
            </li>
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaCoins className="demo-instructions-icon" />
                As a client
              </span>
              <span className="demo-instructions-detail">
                View your points balance, browse and redeem rewards, see promotions, and check your profile. All data is simulated.
              </span>
            </li>
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaUserTie className="demo-instructions-icon" />
                As a manager
              </span>
              <span className="demo-instructions-detail">
                Manage users, vehicles, rewards, promotions, points transactions, and birthday messages. Changes are in-memory only for this demo.
              </span>
            </li>
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaGift className="demo-instructions-icon" />
                Note
              </span>
              <span className="demo-instructions-detail">
                Maintenance History is disabled in demo mode. No backend is connected—everything runs locally with mock data.
              </span>
            </li>
            <li className="demo-instructions-item">
              <span className="demo-instructions-step">
                <FaServer className="demo-instructions-icon" />
                Backend validation
              </span>
              <span className="demo-instructions-detail">
                Certain actions may be unavailable in this demo because they depend on server-side validation.
              </span>
            </li>
          </ol>
        </div>
        <div className="demo-instructions-footer">
          <button type="button" className="demo-instructions-cta" onClick={handleClose}>
            Got it, let's go
          </button>
        </div>
      </div>
    </div>
  );
}

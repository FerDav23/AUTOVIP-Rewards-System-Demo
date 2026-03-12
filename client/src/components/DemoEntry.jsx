import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoCIMImg from '../assets/CIM_LOGOTIPO.png';
import logoImg from '../assets/FJ-LOGOTIPO.png';
import AUTOVIPBackground from './AUTOVIPBackground';
import DemoInstructionsModal, { getDemoInstructionsSeen } from './DemoInstructionsModal';
import { FaUser, FaUserTie, FaInfoCircle } from 'react-icons/fa';
import './DemoEntry.css';

export default function DemoEntry() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [markAsSeenOnClose, setMarkAsSeenOnClose] = useState(false);

  useEffect(() => {
    if (!getDemoInstructionsSeen()) {
      setMarkAsSeenOnClose(true);
      setShowInstructions(true);
    }
  }, []);

  const openInstructions = () => {
    setMarkAsSeenOnClose(false);
    setShowInstructions(true);
  };

  return (
    <div className="demo-entry-container">
      <AUTOVIPBackground />
      <div className="demo-entry-card">
        <div className="demo-entry-logos">
          <img src={logoImg} alt="Logo" className="demo-entry-logo-small" />
          <img src={logoCIMImg} alt="CIM Logo" className="demo-entry-logo" />
        </div>
        <h1 className="demo-entry-title">AUTOVIP Rewards – Demo</h1>
        <p className="demo-entry-notice">
          This is a demo. Data is simulated and no real backend is connected.
        </p>
        <button
          type="button"
          className="demo-entry-instructions-link"
          onClick={openInstructions}
          aria-label="View demo instructions"
        >
          <FaInfoCircle className="demo-entry-instructions-icon" />
          How to use this demo
        </button>
        <p className="demo-entry-choose">Choose how to sign in:</p>
        <div className="demo-entry-actions">
          <button
            type="button"
            className="demo-entry-btn demo-entry-btn-client"
            onClick={() => navigate('/login')}
          >
            <FaUser className="demo-entry-btn-icon" />
            Sign in as Client
          </button>
          <button
            type="button"
            className="demo-entry-btn demo-entry-btn-manager"
            onClick={() => navigate('/manager-login')}
          >
            <FaUserTie className="demo-entry-btn-icon" />
            Sign in as Manager
          </button>
        </div>
      </div>
      <DemoInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        markAsSeenOnClose={markAsSeenOnClose}
      />
    </div>
  );
}

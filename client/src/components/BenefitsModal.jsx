import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './BenefitsModal.css';

const BENEFITS_BY_MEMBERSHIP = {
  black: {
    title: 'Black Card',
    benefits: [
      '18% discount on automotive parts.',
      '2 free alignments per year.',
      '2 general visual inspections per year.',
      'Pick-up and delivery at home (optional).',
      '4 AutoVIP points per service.',
      'Mobile workshop and towing at exclusive prices.',
      'Access to your vehicle digital history.',
      'Express vehicle wash per service.',
    ],
  },
  gold: {
    title: 'Gold Card',
    benefits: [
      '12% discount on automotive parts.',
      '1 AutoVIP point per service.',
      'Mobile workshop/towing for emergencies.',
      'Access to your vehicle history.',
      'Vehicle wash per service.',
    ],
  },
  platinum: {
    title: 'Platinum Card',
    benefits: [
      '15% discount on automotive parts.',
      '2 free alignments per year.',
      '4 AutoVIP points per service.',
      'Mobile workshop and towing at exclusive prices.',
      'Access to your vehicle digital history.',
      'Express vehicle wash per service.',
    ],
  },
};

export default function BenefitsModal({ open, onClose, membershipType }) {
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const effectiveType = isDemo ? 'black' : (membershipType || '');
  const normalizedType = effectiveType.toLowerCase();
  const data = BENEFITS_BY_MEMBERSHIP[normalizedType] || BENEFITS_BY_MEMBERSHIP.gold;
  const styleClass = ['black', 'gold', 'platinum'].includes(normalizedType)
    ? `benefits-modal-${normalizedType}`
    : 'benefits-modal-gold';

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="benefits-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="benefits-modal-title">
      <div
        className={`benefits-modal-content ${styleClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="benefits-modal-header">
          <h2 id="benefits-modal-title" className="benefits-modal-title">BENEFITS</h2>
          <span className="benefits-modal-subtitle">{data.title}</span>
          <button
            type="button"
            className="benefits-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="benefits-modal-body">
          <ul className="benefits-modal-list">
            {data.benefits.map((item, i) => (
              <li key={i} className="benefits-modal-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

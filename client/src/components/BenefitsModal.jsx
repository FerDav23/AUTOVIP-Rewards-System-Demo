import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './BenefitsModal.css';

const BENEFITS_BY_MEMBERSHIP = {
  black: {
    title: 'Tarjeta Black',
    benefits: [
      '18% dcto., en Repuestos Automotriz.',
      '2 Alineaciones Gratis por año.',
      '2 Inspecciones Generales visuales por año.',
      'Retiro y entrega a domicilio (elección).',
      '4 Puntos AutoVIP por servicio.',
      'Taller Móvil y Grúa con precios exclusivos.',
      'Acceso al Historial Digital de su vehículo.',
      'Lavado express del vehículo por servicio.',
    ],
  },
  gold: {
    title: 'Tarjeta Gold',
    benefits: [
      '12% dcto., en Repuestos Automotriz.',
      '1 punto AutoVIP por servicio.',
      'Taller móvil/grúa para emergencias.',
      'Accesos Histórico de su vehículo.',
      'Lavado de vehículo por servicio.',
    ],
  },
  platinum: {
    title: 'Tarjeta Platinum',
    benefits: [
      '15% dcto., en Repuestos Automotriz.',
      '2 Alineaciones Gratis por año.',
      '4 Puntos AutoVIP por servicio.',
      'Taller Móvil y Grúa con precios exclusivos.',
      'Acceso al Historial Digital de su vehículo.',
      'Lavado express de vehículo por servicio.',
    ],
  },
};

export default function BenefitsModal({ open, onClose, membershipType }) {
  const normalizedType = (membershipType || '').toLowerCase();
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
          <h2 id="benefits-modal-title" className="benefits-modal-title">BENEFICIOS</h2>
          <span className="benefits-modal-subtitle">{data.title}</span>
          <button
            type="button"
            className="benefits-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
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

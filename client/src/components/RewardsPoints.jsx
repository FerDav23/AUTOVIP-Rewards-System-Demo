import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import './RewardsPoints.css';
import { FaGift, FaTag, FaStar, FaCoins, FaChartLine, FaUser } from 'react-icons/fa';

export default function RewardsPoints({ setIsAuthenticated }) {
  const navigate = useNavigate();
  
  // Dummy data for customer points
  const [customerPoints] = useState(800);
  const [userName] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? user.replace(/"/g, '') : 'Cliente';
  });

  const [password] = useState(() => {
    const storedPassword = localStorage.getItem('password');
    return storedPassword ? storedPassword.replace(/"/g, '') : '';
  });

  // Dummy data for promotions
  const promotions = [
    {
      id: 1,
      title: 'Doble Puntos en Mantenimientos',
      description: 'Gana el doble de puntos en todos los servicios de mantenimiento durante este mes',
      validUntil: '2024-12-31',
      badge: 'Nuevo'
    },
    {
      id: 2,
      title: 'Promoción Especial de Fin de Año',
      description: 'Acumula 500 puntos adicionales al realizar un mantenimiento completo',
      validUntil: '2024-12-25',
      badge: 'Popular'
    },
    {
      id: 3,
      title: 'Referidos = Puntos',
      description: 'Invita a un amigo y ambos ganan 200 puntos al registrarse',
      validUntil: '2024-12-20',
      badge: 'Limitado'
    }
  ];

  // Dummy data for rewards
  const rewards = [
    {
      id: 1,
      title: 'Descuento del 10%',
      description: 'Aplica un descuento del 10% en tu próximo servicio',
      pointsRequired: 500,
      category: 'Descuento',
      available: true
    },
    {
      id: 2,
      title: 'Mantenimiento Básico Gratis',
      description: 'Obtén un mantenimiento básico completamente gratis',
      pointsRequired: 1000,
      category: 'Servicio',
      available: true
    },
    {
      id: 3,
      title: 'Descuento del 20%',
      description: 'Aplica un descuento del 20% en tu próximo servicio',
      pointsRequired: 1500,
      category: 'Descuento',
      available: false
    },
    {
      id: 4,
      title: 'Kit de Limpieza Premium',
      description: 'Recibe un kit completo de productos de limpieza para tu vehículo',
      pointsRequired: 800,
      category: 'Producto',
      available: true
    },
    {
      id: 5,
      title: 'Inspección Gratuita',
      description: 'Obtén una inspección completa de tu vehículo sin costo',
      pointsRequired: 600,
      category: 'Servicio',
      available: true
    },
    {
      id: 6,
      title: 'Descuento del 30%',
      description: 'Aplica un descuento del 30% en tu próximo servicio premium',
      pointsRequired: 2000,
      category: 'Descuento',
      available: false
    }
  ];

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleRedeem = (reward) => {
    if (customerPoints >= reward.pointsRequired && reward.available) {
      alert(`¡Felicidades! Has canjeado: ${reward.title}\nPuntos utilizados: ${reward.pointsRequired}`);
      // Here you would make an API call to redeem the reward
    } else if (!reward.available) {
      alert('Este premio no está disponible en este momento.');
    } else {
      alert(`No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos.`);
    }
  };

  const canAfford = (pointsRequired) => {
    return customerPoints >= pointsRequired;
  };

  // Find the next reward the user can't afford yet
  const getNextReward = () => {
    // First, try to find available rewards the user can't afford
    const unavailableAvailableRewards = rewards
      .filter(reward => reward.available && !canAfford(reward.pointsRequired))
      .sort((a, b) => a.pointsRequired - b.pointsRequired);
    
    if (unavailableAvailableRewards.length > 0) {
      return unavailableAvailableRewards[0];
    }
    
    // If user can afford all available rewards, show the next unavailable reward they can't afford
    const unavailableRewards = rewards
      .filter(reward => !canAfford(reward.pointsRequired))
      .sort((a, b) => a.pointsRequired - b.pointsRequired);
    
    return unavailableRewards.length > 0 ? unavailableRewards[0] : null;
  };

  const nextReward = getNextReward();
  const pointsNeeded = nextReward ? Math.max(0, nextReward.pointsRequired - customerPoints) : 0;
  const progressPercentage = nextReward 
    ? Math.min((customerPoints / nextReward.pointsRequired) * 100, 100)
    : 100;
  
  // Calculate circumference for the circle (radius = 52)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const handleNavigateToDashboard = () => {
    const BASE_URL = "https://sistema.cim-clientes.com/qr-login";
    const url = `${BASE_URL}?userName=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`;
    window.open(url, '_blank');
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <>
    <div className="rewards-header">
        <h2>Sistema de Puntos y Recompensas</h2>
        <div className="header-actions">
          <button onClick={handleNavigateToDashboard} className="dashboard-btn">
            <FaChartLine /> Historial de Mantenimiento
          </button>
          <button onClick={handleNavigateToProfile} className="dashboard-btn">
            <FaUser /> Mi Perfil
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    <div className="rewards-container">
      

      {/* Customer Points Display */}
      <div className="points-display-section">
        <div className="points-card">
          <div className="points-icon">
            <FaCoins />
          </div>
          <div className="points-content">
            <h3 className="points-label">Tus Puntos</h3>
            <p className="points-value">{customerPoints.toLocaleString()}</p>
            <p className="points-subtitle">¡Sigue acumulando puntos y canjéalos por increíbles recompensas!</p>
          </div>
          {nextReward && (
            <div className="next-reward-counter">
              <div className="circular-progress">
                <svg className="progress-ring" width="120" height="120">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="#ffffff"
                    strokeWidth="8"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#ffffff"
                    strokeWidth="8"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progressPercentage / 100)}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
                  />
                </svg>
                <div className="progress-content">
                  <span className="progress-label">Faltan</span>
                  <span className="progress-points">{pointsNeeded.toLocaleString()}</span>
                  <span className="progress-text">puntos</span>
                </div>
              </div>
              <p className="next-reward-info">
                Para: <strong>{nextReward.title}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

     
    <div className="rewards-container">
      <div className="section-container">
        <div className="section-header rewards-header">
          <FaGift className="section-icon" />
          <h3>Recompensas Disponibles</h3>
        </div>
        <div className="rewards-grid">
          {rewards.map((reward) => (
            <div 
              key={reward.id} 
              className={`reward-card ${!reward.available ? 'unavailable' : ''} ${canAfford(reward.pointsRequired) && reward.available ? 'affordable' : ''}`}
            >
              <div className="reward-header">
                <span className="reward-category">{reward.category}</span>
                {!reward.available && (
                  <span className="reward-unavailable-badge">No Disponible</span>
                )}
              </div>
              <div className="reward-icon">
                <FaStar />
              </div>
              <h4 className="reward-title">{reward.title}</h4>
              <p className="reward-description">{reward.description}</p>
              <div className="reward-footer">
                <div className="reward-points">
                  <FaCoins className="points-icon-small" />
                  <span>{reward.pointsRequired.toLocaleString()} puntos</span>
                </div>
                <button
                  className={`redeem-btn ${canAfford(reward.pointsRequired) && reward.available ? 'can-redeem' : 'cannot-redeem'}`}
                  onClick={() => handleRedeem(reward)}
                  disabled={!reward.available || !canAfford(reward.pointsRequired)}
                >
                  {!reward.available ? 'No Disponible' : 
                   canAfford(reward.pointsRequired) ? 'Canjear' : 
                   'Puntos Insuficientes'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rewards-container">
        <div className="section-container promotions-section">
            <div className="section-header promotions-header">
            <FaTag className="section-icon promotion-icon" />
            <h3>Promociones Activas</h3>
            </div>
            <div className="promotions-grid">
            {promotions.map((promotion) => (
                <div key={promotion.id} className="promotion-card">
                <div className="promotion-badge">{promotion.badge}</div>
                <h4 className="promotion-title">{promotion.title}</h4>
                <p className="promotion-description">{promotion.description}</p>
                <div className="promotion-footer">
                    <span className="promotion-date">Válido hasta: {new Date(promotion.validUntil).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </>
  );
}


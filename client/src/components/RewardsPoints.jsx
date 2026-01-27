import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import { useAlert } from './AlertContext';
import { getPointsByUserId, getRewardsByUserId } from '../services/autovipUsers';
import { getAllPromotions } from '../services/autovipPromotions';
import './RewardsPoints.css';
import Loading from './Loading';
import { FaGift, FaTag, FaStar, FaCoins, FaChartLine, FaUser } from 'react-icons/fa';

export default function RewardsPoints({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { showError, showWarning } = useAlert();
  
  // State for customer points - loaded from database
  const [customerPoints, setCustomerPoints] = useState(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  // State for rewards - loaded from database
  const [rewards, setRewards] = useState([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  // State for promotions - loaded from database
  const [promotions, setPromotions] = useState([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [userName] = useState(() => {
    const user = localStorage.getItem('autovipUserName');
    return user ? user.replace(/"/g, '') : 'Cliente';
  });

  const [password] = useState(() => {
    const storedPassword = localStorage.getItem('password');
    return storedPassword ? storedPassword.replace(/"/g, '') : '';
  });

  // State for redemption modal
  const [selectedReward, setSelectedReward] = useState(null);

  // Load user points and rewards from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('autovipUserID');
        
        if (!userId) {
          console.warn('No user ID found in localStorage');
          setCustomerPoints(0);
          setRewards([]);
          setIsLoadingPoints(false);
          setIsLoadingRewards(false);
          return;
        }

        // Parse userId if it's stored as JSON string
        let parsedUserId;
        try {
          parsedUserId = JSON.parse(userId);
        } catch (error) {
          parsedUserId = userId;
        }

        // Load points and rewards in parallel
        setIsLoadingPoints(true);
        setIsLoadingRewards(true);
        
        const [points, rewardsData] = await Promise.all([
          getPointsByUserId(parsedUserId),
          getRewardsByUserId(parsedUserId)
        ]);

        setCustomerPoints(points || 0);
        
        // Map the rewards data to match the component's expected format
        // Based on API structure: title, description, reward_type, points_cost, visible, imageUrl
        const mappedRewards = rewardsData.map(reward => ({
          id: reward.id,
          title: reward.title,
          description: reward.description,
          pointsRequired: reward.points_cost || reward.points_required || 0,
          category: reward.reward_type || reward.category?.name || reward.category_name || reward.category || 'General',
          available: reward.visible !== undefined ? reward.visible === true : (reward.available !== undefined ? reward.available : true),
          imageUrl: reward.imageUrl || reward.image_url || null
        }));
        
        setRewards(mappedRewards);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setCustomerPoints(0);
        setRewards([]);
      } finally {
        setIsLoadingPoints(false);
        setIsLoadingRewards(false);
      }
    };

    loadUserData();
  }, []);

  // Load promotions from database
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setIsLoadingPromotions(true);
        const promotionsData = await getAllPromotions();
        
        // Filter promotions: only show non-expired promotions and those with null expires_at
        const currentDate = new Date();
        const filteredPromotions = promotionsData.filter(promotion => {
          // If expires_at is null, include it
          if (promotion.expires_at === null || promotion.expires_at === undefined) {
            return true;
          }
          
          // If expires_at is a date string, check if it's in the future
          const expiresDate = new Date(promotion.expires_at);
          return expiresDate > currentDate;
        });
        
        setPromotions(filteredPromotions);
      } catch (error) {
        console.error('Failed to load promotions:', error);
        setPromotions([]);
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    loadPromotions();
  }, []);



  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleRedeem = (reward) => {
    if (customerPoints >= reward.pointsRequired && reward.available) {
      setSelectedReward(reward);
    } else if (!reward.available) {
      showWarning('Este premio no está disponible en este momento.');
    } else {
      showWarning(`No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos.`);
    }
  };

  const closeModal = () => {
    setSelectedReward(null);
  };

  const handleWhatsAppContact = () => {
    if (!selectedReward) return;
    const supportNumber = '593991469530'; // Replace with actual support WhatsApp number (country code + number, no + or spaces)
    const rucCi = localStorage.getItem('autovipUserRucCi')?.replace(/"/g, '') ?? '';
    // Emojis via Unicode code points so they display correctly regardless of file encoding
    const gift = '\u{1F381}', trophy = '\u{1F3C6}', star = '\u{2B50}', folder = '\u{1F4C2}', memo = '\u{1F4DD}', user = '\u{1F464}';
    const message = [
      `${gift} Hola, deseo canjear mis puntos por la siguiente recompensa:\n`,
      `${trophy} *Recompensa:* ${selectedReward.title}`,
      `${star} *Puntos requeridos:* ${selectedReward.pointsRequired}`,
      `${folder} *Categoría:* ${selectedReward.category || 'N/A'}`,
      selectedReward.description ? `${memo} *Descripción:* ${selectedReward.description}` : '',
      '',
      `${user} *Mis datos:*`,
      `- Nombre: ${userName}`,
      rucCi ? `- RUC/C.I.: ${rucCi}` : ''
    ].filter(Boolean).join('\n');
    // Use api.whatsapp.com/send instead of wa.me - wa.me has a known bug where emojis display incorrectly on desktop/Web
    const url = `https://api.whatsapp.com/send?phone=${supportNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
    <div className="rewards-wrapper">
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
        {isLoadingPoints ? (
          <Loading message="Cargando puntos..." fullScreen={true} />
        ) : (
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
                    strokeWidth="8"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle"
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
        )}
      </div>
    </div>

     
    <div className="rewards-container">
      <div className="section-container">
        <div className="section-header rewards-header">
          <FaGift className="section-icon" />
          <h3>Recompensas Disponibles</h3>
        </div>
        <div className="rewards-grid">
          {isLoadingRewards ? (
            <Loading message="Cargando recompensas..." fullScreen={true}/>
          ) : (
          rewards.map((reward) => (
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
              <div className="reward-image-container">
                {reward.imageUrl ? (
                  <img 
                    src={reward.imageUrl} 
                    alt={reward.title}
                    className="reward-image"
                    onError={(e) => {
                      // Hide image and show fallback icon if image fails to load
                      e.target.style.display = 'none';
                      const container = e.target.parentElement;
                      const fallback = container.querySelector('.reward-icon-fallback');
                      if (fallback) {
                        fallback.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <div className="reward-icon reward-icon-fallback" style={{ display: reward.imageUrl ? 'none' : 'block' }}>
                  <FaStar />
                </div>
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
          ))
          )}
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
            {isLoadingPromotions ? (
              <Loading message="Cargando promociones..." />
            ) : promotions.length === 0 ? (
              <p>No hay promociones activas en este momento.</p>
            ) : (
              promotions.map((promotion) => (
                <div key={promotion.id} className="promotion-card">
                  {promotion.imageUrl && (
                    <div className="promotion-image-container">
                      <img 
                        src={promotion.imageUrl} 
                        alt={promotion.title}
                        className="promotion-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const container = e.target.parentElement;
                          if (container) {
                            container.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  )}
                  <h4 className="promotion-title">{promotion.title}</h4>
                  <p className="promotion-description">{promotion.description}</p>
                  <div className="promotion-footer">
                    {promotion.expires_at ? (
                      <span className="promotion-date">Válido hasta: {new Date(promotion.expires_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    ) : (
                      <span className="promotion-date">Válido permanentemente</span>
                    )}
                  </div>
                </div>
              ))
            )}
            </div>
        </div>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div className="redeem-modal-overlay" onClick={closeModal}>
          <div className="redeem-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="redeem-modal-close-btn" onClick={closeModal}>×</button>
            <div className="redeem-modal-scroll-wrapper">
              <div className="redeem-modal-reward-image-container">
                {selectedReward.imageUrl ? (
                  <img 
                    src={selectedReward.imageUrl} 
                    alt={selectedReward.title}
                    className="redeem-modal-reward-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const container = e.target.parentElement;
                      const fallback = container.querySelector('.redeem-modal-reward-icon-fallback');
                      if (fallback) {
                        fallback.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <div className="redeem-modal-reward-icon redeem-modal-reward-icon-fallback" style={{ display: selectedReward.imageUrl ? 'none' : 'block' }}>
                  <FaStar />
                </div>
              </div>
              <h3 className="redeem-modal-reward-title">{selectedReward.title}</h3>
              <div className="redeem-modal-reward-points">
                <FaCoins className="redeem-modal-points-icon" />
                <span>{selectedReward.pointsRequired.toLocaleString()} puntos</span>
              </div>
              <p className="redeem-modal-instructions">
                Para canjear los puntos porfavor comuniquese con el asesor CIM usando el boton de abajo.
              </p>
              <button className="redeem-modal-whatsapp-btn" onClick={handleWhatsAppContact}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Comunicarse con asesor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


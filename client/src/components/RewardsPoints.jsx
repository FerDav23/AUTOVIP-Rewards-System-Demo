import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import { useAlert } from './AlertContext';
import { getPointsByUserId, getRewardsByUserId } from '../services/autovipUsers';
import { getAllPromotions } from '../services/autovipPromotions';
import logger from '../utils/logger';
import './RewardsPoints.css';
import Loading from './Loading';
import { FaGift, FaTag, FaStar, FaCoins, FaChartLine, FaUser, FaAngleDoubleRight } from 'react-icons/fa';

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

  const [rucCi] = useState(() => {
    const storedRucCi = localStorage.getItem('autovipUserRucCi');
    return storedRucCi ? storedRucCi.replace(/"/g, '') : '';
  });

  // State for redemption modal
  const [selectedReward, setSelectedReward] = useState(null);
  // Category filter for rewards (mobile pill filters)
  const [selectedCategory, setSelectedCategory] = useState(null);

  const availableRewards = useMemo(() => rewards.filter((r) => r.available), [rewards]);
  const rewardCategories = useMemo(() =>
    [...new Set(availableRewards.map((r) => r.category).filter(Boolean))],
    [availableRewards]
  );
  const displayedRewards = selectedCategory
    ? availableRewards.filter((r) => r.category === selectedCategory)
    : availableRewards;

  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
  const rewardsGridRef = useRef(null);
  const promotionsGridRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handle = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handle);
    handle();
    return () => mq.removeEventListener('change', handle);
  }, []);

  const count = displayedRewards.length;
  const infiniteRewards = count > 1 ? [...displayedRewards, ...displayedRewards] : displayedRewards;
  const promoCount = promotions.length;
  const infinitePromotions = promoCount > 1 ? [...promotions, ...promotions] : promotions;
  const rewardsToShow = isMobile ? infiniteRewards : displayedRewards;
  const promotionsToShow = isMobile ? infinitePromotions : promotions;

  const handleRewardsScroll = useCallback(() => {
    const el = rewardsGridRef.current;
    if (!el || count <= 1) return;
    const setWidth = el.scrollWidth / 2;
    if (el.scrollLeft >= setWidth - 20) el.scrollLeft -= setWidth;
    const cardWidth = setWidth / count;
    const idx = Math.min(count - 1, Math.floor(el.scrollLeft / cardWidth + 0.5));
    setCurrentRewardIndex(idx);
  }, [count]);

  const handlePromotionsScroll = useCallback(() => {
    const el = promotionsGridRef.current;
    if (!el || promoCount <= 1) return;
    const setWidth = el.scrollWidth / 2;
    if (el.scrollLeft >= setWidth - 20) el.scrollLeft -= setWidth;
    const cardWidth = setWidth / promoCount;
    const idx = Math.min(promoCount - 1, Math.floor(el.scrollLeft / cardWidth + 0.5));
    setCurrentPromotionIndex(idx);
  }, [promoCount]);

  const scrollRewardsTo = useCallback((index) => {
    const el = rewardsGridRef.current;
    if (!el || count <= 1) return;
    const setWidth = el.scrollWidth / 2;
    const cardWidth = setWidth / count;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setCurrentRewardIndex(index);
  }, [count]);

  const scrollPromotionsTo = useCallback((index) => {
    const el = promotionsGridRef.current;
    if (!el || promoCount <= 1) return;
    const setWidth = el.scrollWidth / 2;
    const cardWidth = setWidth / promoCount;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setCurrentPromotionIndex(index);
  }, [promoCount]);

  useEffect(() => { setCurrentRewardIndex(0); }, [count]);
  useEffect(() => { setCurrentPromotionIndex(0); }, [promoCount]);

  // Load user points and rewards from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('autovipUserID');
        
        if (!userId) {
          logger.warn('No user ID found in localStorage');
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
          console.error('Failed to parse user ID:', error);
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

  // Find the next reward the user can't afford yet (only among available/visible rewards)
  const getNextReward = () => {
    const cantAfford = availableRewards
      .filter(reward => !canAfford(reward.pointsRequired))
      .sort((a, b) => a.pointsRequired - b.pointsRequired);
    return cantAfford.length > 0 ? cantAfford[0] : null;
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
    const BASE_URL = "https://historial-mant.cim-clientes.com/qr-login";
    const url = `${BASE_URL}?userName=${encodeURIComponent(userName)}&rucCi=${encodeURIComponent(rucCi)}`;
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
      

      {/* Customer Points Display – mobile: big number + "puntos" (reference style) */}
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
            <p className="points-value">
              {customerPoints.toLocaleString()}
              <span className="points-units-mobile"> puntos</span>
            </p>
            <p className="points-subtitle">¡Sigue acumulando puntos y canjéalos por increíbles recompensas!</p>
          </div>
          {nextReward && (
            <div className="next-reward-counter">
              <div className="circular-progress">
                <svg className="progress-ring" viewBox="0 0 120 120" width="120" height="120">
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
      <div className="section-container rewards-section">
        <div className="section-header rewards-header section-header-with-hint">
          <span className="section-title-wrap">
            <FaGift className="section-icon" />
            <h3>Recompensas disponibles</h3>
          </span>
          {!isLoadingRewards && availableRewards.length > 0 && (
            <span className="slider-hint" aria-hidden="true">
              Desliza para ver más <FaAngleDoubleRight className="slider-hint-arrow" />
            </span>
          )}
        </div>
        {!isLoadingRewards && availableRewards.length > 0 && rewardCategories.length > 0 && (
          <div className="category-pills" role="tablist" aria-label="Filtrar por categoría">
            <button
              type="button"
              role="tab"
              className={`category-pill ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </button>
            {rewardCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="slider-viewport">
        <div
          ref={rewardsGridRef}
          className="rewards-grid"
          onScroll={handleRewardsScroll}
          role="region"
          aria-label="Recompensas disponibles"
        >
          {isLoadingRewards ? (
            <Loading message="Cargando recompensas..." fullScreen={true}/>
          ) : (
          rewardsToShow.map((reward, i) => (
            <div
              key={count > 1 && isMobile && i >= count ? `${reward.id}-dup` : reward.id} 
              className={`reward-card reward-card-coupon ${canAfford(reward.pointsRequired) ? 'affordable' : ''}`}
            >
              <div className="reward-card-header-bar">
                <span className="reward-category">{reward.category}</span>
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
                  className={`redeem-btn ${canAfford(reward.pointsRequired) ? 'can-redeem' : 'cannot-redeem'}`}
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford(reward.pointsRequired)}
                >
                  {canAfford(reward.pointsRequired) ? 'Canjear' : 'Puntos Insuficientes'}
                </button>
              </div>
            </div>
          ))
          )}
        </div>
        {!isLoadingRewards && count > 1 && (
          <div className="slider-dots" role="tablist" aria-label="Elemento actual">
            {displayedRewards.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === currentRewardIndex}
                aria-label={`Elemento ${i + 1} de ${count}`}
                className={`slider-dot ${i === currentRewardIndex ? 'active' : ''}`}
                onClick={() => scrollRewardsTo(i)}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>

    <div className="rewards-container">
        <div className="section-container promotions-section">
            <div className="section-header promotions-header section-header-with-hint">
            <span className="section-title-wrap">
              <FaTag className="section-icon promotion-icon" />
              <h3>Promociones activas</h3>
            </span>
            {!isLoadingPromotions && promotions.length > 0 && (
              <span className="slider-hint" aria-hidden="true">
                Desliza para ver más <FaAngleDoubleRight className="slider-hint-arrow" />
              </span>
            )}
            </div>
            <div className="slider-viewport">
            <div
              ref={promotionsGridRef}
              className="promotions-grid"
              onScroll={handlePromotionsScroll}
              role="region"
              aria-label="Promociones activas"
            >
            {isLoadingPromotions ? (
              <Loading message="Cargando promociones..." />
            ) : promoCount === 0 ? (
              <p className="promotions-empty">No hay promociones activas en este momento.</p>
            ) : (
              promotionsToShow.map((promotion, i) => (
                <div key={promoCount > 1 && isMobile && i >= promoCount ? `${promotion.id}-dup` : promotion.id} className="promotion-card promotion-card-coupon">
                  <div className="promotion-card-header-bar">
                    <span className="promotion-card-header-label">Promoción</span>
                  </div>
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
            {!isLoadingPromotions && promoCount > 1 && (
              <div className="slider-dots" role="tablist" aria-label="Elemento actual">
                {promotions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === currentPromotionIndex}
                    aria-label={`Elemento ${i + 1} de ${promoCount}`}
                    className={`slider-dot ${i === currentPromotionIndex ? 'active' : ''}`}
                    onClick={() => scrollPromotionsTo(i)}
                  />
                ))}
              </div>
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


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import { getUserInformation, getAllCarsByUserId, getAllRedeemedRewardsByUserId } from '../services/autovipUsers';
import './UserProfile.css';
import Loading from './Loading';
import { 
  FaUser, FaCar, FaReceipt, 
  FaChartLine, FaGift, FaCreditCard, 
  FaCrown, FaIdCard 
} from 'react-icons/fa';

export default function UserProfile({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [rucCi, setRucCi] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserInformation = async () => {
      try {
        setIsLoading(true);
        // Get user ID from localStorage
        const autovipUserID = localStorage.getItem('autovipUserID');
        
        if (!autovipUserID) {
          console.warn('No autovipUserID found in localStorage');
          setIsLoading(false);
          return;
        }

        // Parse the user ID (it's stored as JSON string)
        let userId;
        try {
          userId = JSON.parse(autovipUserID);
        } catch (error) {
          userId = autovipUserID;
        }

        // Fetch user information from API
        const userInfo = await getUserInformation(userId);
        
        if (userInfo) {
          // Set user information from API response
          if (userInfo.name) {
            setUserName(userInfo.name);
          }
          if (userInfo.card_number) {
            setCardNumber(userInfo.card_number);
          }
          if (userInfo.ruc_ci) {
            setRucCi(userInfo.ruc_ci);
          }
          if (userInfo.membership) {
            // If membership is an object, get its name or type
            if (typeof userInfo.membership === 'object' && userInfo.membership !== null) {
              setMembershipType(userInfo.membership.name || userInfo.membership.type || '');
            } else {
              setMembershipType(userInfo.membership);
            }
          }
        }

        // Load vehicles from API
        const vehiclesData = await getAllCarsByUserId(userId);
        if (vehiclesData && Array.isArray(vehiclesData)) {
          // Map API response fields to component format
          const mappedVehicles = vehiclesData.map((vehicle) => ({
            id: vehicle.id || vehicle.plate, // Use id if available, otherwise use plate as fallback
            placa: vehicle.plate || '',
            marca: vehicle.make || '',
            modelo: vehicle.model || '',
            año: vehicle.year || '',
            color: vehicle.color || ''
          }));
          setVehicles(mappedVehicles);
        }

        // Load redeemed rewards from API
        const redeemedRewardsData = await getAllRedeemedRewardsByUserId(userId);
        if (redeemedRewardsData && Array.isArray(redeemedRewardsData)) {
          setRedeemedRewards(redeemedRewardsData);
        }
      } catch (error) {
        console.error('Failed to load user information:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInformation();
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatCardNumber = (card) => {
    if (!card) return '';
    return card.replace(/(\d{4})/g, '$1 ').trim();
  };

  const getMembershipDisplayName = (type) => {
    if (!type) return 'Sin membresía';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getMembershipBadgeClass = (type) => {
    if (!type) return 'membership-badge';
    return `membership-badge membership-${type.toLowerCase()}`;
  };

  const handleNavigateToDashboard = () => {
    const BASE_URL = "https://sistema.cim-clientes.com/qr-login";
    const url = `${BASE_URL}?userName=${encodeURIComponent(userName)}&password=${encodeURIComponent(rucCi)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="profile-container">
      {isLoading && <Loading message="Cargando información del perfil..." fullScreen={true} />}
      <div className="profile-header">
        <div className="profile-title-section">
          <FaUser className="profile-icon" />
          <h2>Mi Perfil</h2>
        </div>
        <div className="header-actions">
          <button onClick={handleNavigateToDashboard} className="nav-btn">
            <FaChartLine /> Historial de Mantenimiento
          </button>
          <button onClick={() => navigate('/rewards')} className="nav-btn">
            <FaGift /> Recompensas
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* User Info Section */}
        <div className="profile-section">
          <div className="section-header">
            <FaUser className="section-icon" />
            <h3>Información del Usuario</h3>
          </div>
          <div className="user-info-card">
            <div className="user-info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{userName || 'Cliente'}</span>
            </div>
            <div className="user-info-item">
              <span className="info-label">Tipo de Membresía:</span>
              <span className={`info-value ${getMembershipBadgeClass(membershipType)}`}>
                <FaCrown className="membership-icon" />
                {getMembershipDisplayName(membershipType)}
              </span>
            </div>
            <div className="user-info-item">
              <span className="info-label">
                <FaCreditCard className="info-icon" /> Número de Tarjeta:
              </span>
              <span className="info-value">{cardNumber ? formatCardNumber(cardNumber) : 'No disponible'}</span>
            </div>
            <div className="user-info-item">
              <span className="info-label">
                <FaIdCard className="info-icon" /> RUC/C.I.:
              </span>
              <span className="info-value">{rucCi || 'No disponible'}</span>
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="profile-section">
          <div className="section-header">
            <FaCar className="section-icon" />
            <h3 className="centered-title">
              Mis Vehículos {vehicles.length > 0 && <span className="count-badge">({vehicles.length}/5)</span>}
            </h3>
          </div>

          {vehicles.length === 0 ? (
            <div className="empty-state">
              <FaCar className="empty-icon" />
              <p>No has agregado vehículos a tu perfil.</p>
              <p className="empty-subtitle">Agrega hasta 5 vehículos para un mejor seguimiento de tus servicios.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-icon">
                    <FaCar />
                  </div>
                  <div className="vehicle-info">
                    <h4 className="vehicle-placa">{vehicle.placa}</h4>
                    <p className="vehicle-details">
                      {vehicle.marca} {vehicle.modelo}
                      {vehicle.año && ` • ${vehicle.año}`}
                      {vehicle.color && ` • ${vehicle.color}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewards History Section */}
        <div className="profile-section">
          <div className="section-header">
            <FaGift className="section-icon" />
            <h3>Historial de Premios Ganados</h3>
          </div>
          {redeemedRewards.length === 0 ? (
            <div className="empty-state">
              <FaGift className="empty-icon" />
              <p>No hay historial de premios ganados disponible.</p>
            </div>
          ) : (
            <div className="billing-table-container">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Premio</th>
                    <th>Puntos Antes</th>
                    <th>Puntos Usados</th>
                    <th>Puntos Después</th>
                    <th>Fecha de Canje</th>
                  </tr>
                </thead>
                <tbody>
                  {redeemedRewards.map((reward, index) => (
                    <tr key={index}>
                      <td>{reward.reward_title || 'N/A'}</td>
                      <td className="amount-cell">{reward.points_before?.toLocaleString() || '0'}</td>
                      <td className="amount-cell">{reward.points_used?.toLocaleString() || '0'}</td>
                      <td className="amount-cell">{reward.points_after?.toLocaleString() || '0'}</td>
                      <td>{reward.redeemedAt ? formatDate(reward.redeemedAt) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}



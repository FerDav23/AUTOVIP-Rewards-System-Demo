import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import { getUserInformation, getAllCarsByUserId } from '../services/autovipUsers';
import './UserProfile.css';
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

  // Dummy billing/payment history data
  const [billingHistory] = useState([
    {
      id: 1,
      date: '2024-12-15',
      service: 'Mantenimiento Completo',
      vehicle: 'ABC-123',
      amount: 150.00,
      status: 'Pagado',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2024-11-20',
      service: 'Cambio de Aceite',
      vehicle: 'XYZ-789',
      amount: 45.00,
      status: 'Pagado',
      invoice: 'INV-2024-002'
    },
    {
      id: 3,
      date: '2024-10-10',
      service: 'Revisión General',
      vehicle: 'ABC-123',
      amount: 80.00,
      status: 'Pagado',
      invoice: 'INV-2024-003'
    },
    {
      id: 4,
      date: '2024-09-05',
      service: 'Alineación y Balanceo',
      vehicle: 'DEF-456',
      amount: 120.00,
      status: 'Pagado',
      invoice: 'INV-2024-004'
    }
  ]);

  useEffect(() => {
    const loadUserInformation = async () => {
      try {
        // Get user ID from localStorage
        const autovipUserID = localStorage.getItem('autovipUserID');
        
        if (!autovipUserID) {
          console.warn('No autovipUserID found in localStorage');
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
      } catch (error) {
        console.error('Failed to load user information:', error);
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-title-section">
          <FaUser className="profile-icon" />
          <h2>Mi Perfil</h2>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="nav-btn">
            <FaChartLine /> Historial
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

        {/* Billing History Section */}
        <div className="profile-section">
          <div className="section-header">
            <FaReceipt className="section-icon" />
            <h3>Historial de Facturación</h3>
          </div>
          {billingHistory.length === 0 ? (
            <div className="empty-state">
              <FaReceipt className="empty-icon" />
              <p>No hay historial de facturación disponible.</p>
            </div>
          ) : (
            <div className="billing-table-container">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Vehículo</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((bill) => (
                    <tr key={bill.id}>
                      <td>{formatDate(bill.date)}</td>
                      <td>{bill.service}</td>
                      <td>{bill.vehicle}</td>
                      <td className="amount-cell">{formatCurrency(bill.amount)}</td>
                      <td>
                        <span className={`status-badge ${bill.status.toLowerCase()}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="invoice-cell">{bill.invoice}</td>
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



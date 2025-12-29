import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUserMembership, getCurrentUserCardNumber, getCurrentUserEmail, getCurrentUserPhoneNumber } from '../services/user';
import './UserProfile.css';
import { FaUser, FaCar, FaTrash, FaPlus, FaReceipt, FaChartLine, FaGift, FaTimes, FaEdit, FaCreditCard, FaCrown, FaPhone } from 'react-icons/fa';

export default function UserProfile({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: '',
    color: ''
  });

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
    const user = localStorage.getItem('user');
    if (user) {
      setUserName(user.replace(/"/g, ''));
    }

    // Load membership data
    const membership = getCurrentUserMembership();
    const card = getCurrentUserCardNumber();
    const email = getCurrentUserEmail();
    const phone = getCurrentUserPhoneNumber();
    
    if (membership) {
      setMembershipType(membership);
    }
    if (card) {
      setCardNumber(card);
    }
    if (email) {
      setUserEmail(email);
    }
    if (phone) {
      setPhoneNumber(phone);
    }

    // Load vehicles from localStorage
    const savedVehicles = localStorage.getItem('userVehicles');
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleAddVehicle = () => {
    if (vehicles.length >= 5) {
      alert('Solo puedes agregar hasta 5 vehículos a tu perfil.');
      return;
    }

    if (!newVehicle.placa || !newVehicle.marca || !newVehicle.modelo) {
      alert('Por favor completa al menos la placa, marca y modelo.');
      return;
    }

    const vehicle = {
      id: Date.now(),
      ...newVehicle
    };

    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);
    localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
    
    setNewVehicle({
      placa: '',
      marca: '',
      modelo: '',
      año: '',
      color: ''
    });
    setShowAddVehicle(false);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      año: vehicle.año || '',
      color: vehicle.color || ''
    });
    setShowEditVehicle(true);
  };

  const handleUpdateVehicle = () => {
    if (!newVehicle.placa || !newVehicle.marca || !newVehicle.modelo) {
      alert('Por favor completa al menos la placa, marca y modelo.');
      return;
    }

    const updatedVehicles = vehicles.map(v => 
      v.id === editingVehicle.id ? { ...v, ...newVehicle } : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
    
    setNewVehicle({
      placa: '',
      marca: '',
      modelo: '',
      año: '',
      color: ''
    });
    setEditingVehicle(null);
    setShowEditVehicle(false);
  };

  const handleCloseModals = () => {
    setShowAddVehicle(false);
    setShowEditVehicle(false);
    setEditingVehicle(null);
    setNewVehicle({
      placa: '',
      marca: '',
      modelo: '',
      año: '',
      color: ''
    });
  };

  const handleDeleteVehicle = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      const updatedVehicles = vehicles.filter(v => v.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({
      ...prev,
      [name]: value
    }));
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
              <span className="info-label">Email:</span>
              <span className="info-value">{userEmail || (userName ? `${userName.toLowerCase()}@example.com` : 'cliente@example.com')}</span>
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
                <FaPhone className="info-icon" /> Teléfono:
              </span>
              <span className="info-value">{phoneNumber || 'No disponible'}</span>
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
            {vehicles.length < 5 && (
              <button 
                className="add-vehicle-btn"
                onClick={() => setShowAddVehicle(true)}
              >
                <FaPlus /> Agregar Vehículo
              </button>
            )}
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
                  <div className="vehicle-card-actions">
                    <div
                      className="edit-vehicle-btn"
                      onClick={() => handleEditVehicle(vehicle)}
                      title="Editar vehículo"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleEditVehicle(vehicle);
                        }
                      }}
                    >
                      <FaEdit />
                    </div>
                    <div
                      className="delete-vehicle-btn"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      title="Eliminar vehículo"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleDeleteVehicle(vehicle.id);
                        }
                      }}
                    >
                      <FaTrash />
                    </div>
                  </div>
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

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Vehículo</h3>
              <button className="modal-close-btn" onClick={handleCloseModals}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Placa *</label>
                  <input
                    type="text"
                    name="placa"
                    value={newVehicle.placa}
                    onChange={handleInputChange}
                    placeholder="ABC-123"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <input
                    type="text"
                    name="marca"
                    value={newVehicle.marca}
                    onChange={handleInputChange}
                    placeholder="Toyota"
                  />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={newVehicle.modelo}
                    onChange={handleInputChange}
                    placeholder="Corolla"
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input
                    type="number"
                    name="año"
                    value={newVehicle.año}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={newVehicle.color}
                    onChange={handleInputChange}
                    placeholder="Blanco"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleAddVehicle} className="save-btn">
                Guardar Vehículo
              </button>
              <button onClick={handleCloseModals} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditVehicle && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Vehículo</h3>
              <button className="modal-close-btn" onClick={handleCloseModals}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Placa *</label>
                  <input
                    type="text"
                    name="placa"
                    value={newVehicle.placa}
                    onChange={handleInputChange}
                    placeholder="ABC-123"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Marca *</label>
                  <input
                    type="text"
                    name="marca"
                    value={newVehicle.marca}
                    onChange={handleInputChange}
                    placeholder="Toyota"
                  />
                </div>
                <div className="form-group">
                  <label>Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={newVehicle.modelo}
                    onChange={handleInputChange}
                    placeholder="Corolla"
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input
                    type="number"
                    name="año"
                    value={newVehicle.año}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={newVehicle.color}
                    onChange={handleInputChange}
                    placeholder="Blanco"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleUpdateVehicle} className="save-btn">
                Actualizar Vehículo
              </button>
              <button onClick={handleCloseModals} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



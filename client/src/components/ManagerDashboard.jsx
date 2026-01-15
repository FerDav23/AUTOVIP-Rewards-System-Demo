import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import './ManagerDashboard.css';
import { 
  FaUsers, FaCar, FaGift, FaTag, FaCoins, FaPlus, FaTrash, 
  FaEdit, FaSearch, FaSignOutAlt, FaTimes, FaCheck, FaMinus, FaCog, FaImage
} from 'react-icons/fa';

// S3 upload functions - to be connected later
const uploadImageToS3 = async (file) => {
  // TODO: Implement S3 upload
  // For now, return a dummy URL based on file name
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a local URL for preview (in production, this would be the S3 URL)
      const dummyUrl = URL.createObjectURL(file);
      resolve(dummyUrl);
    }, 500);
  });
};

const deleteImageFromS3 = async (imageUrl) => {
  // TODO: Implement S3 delete
  // For now, just revoke the object URL if it's a blob
  if (imageUrl && imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl);
  }
  return true;
};

export default function ManagerDashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [carCountFilter, setCarCountFilter] = useState('all');
  const [pointsRangeFilter, setPointsRangeFilter] = useState('all');
  const [cardNumberFilter, setCardNumberFilter] = useState('');
  const [rucCiFilter, setRucCiFilter] = useState('');
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState('all');
  const [rewardAvailabilityFilter, setRewardAvailabilityFilter] = useState('all');
  const [rewardMembershipFilter, setRewardMembershipFilter] = useState('all');
  const [rewardTitleFilter, setRewardTitleFilter] = useState('');
  const [rewardDescriptionFilter, setRewardDescriptionFilter] = useState('');
  const [promoBadgeFilter, setPromoBadgeFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Users state
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', cardNumber: '4532-1234-5678-9012', rucCi: '0912345678', points: 800, membership: 'gold' },
    { id: 2, name: 'María García', cardNumber: '4532-9876-5432-1098', rucCi: '1798765432001', points: 1500, membership: 'platinum' },
    { id: 3, name: 'Carlos López', cardNumber: '4532-5555-4444-3333', rucCi: '0987654321', points: 2500, membership: 'black' },
  ]);

  // Cars state - linked to users (min 1, max 5 per user)
  const [cars, setCars] = useState([
    { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', año: 2020, userId: 1, userName: 'Juan Pérez' },
    { id: 2, placa: 'DEF-456', marca: 'Honda', modelo: 'Civic', año: 2021, userId: 1, userName: 'Juan Pérez' },
    { id: 3, placa: 'GHI-789', marca: 'Ford', modelo: 'Focus', año: 2019, userId: 2, userName: 'María García' },
    { id: 4, placa: 'JKL-012', marca: 'Chevrolet', modelo: 'Cruze', año: 2022, userId: 3, userName: 'Carlos López' },
  ]);

  // Points transactions history
  const [pointsTransactions, setPointsTransactions] = useState([]);

  const MAX_CARS_PER_USER = 5;
  const MIN_CARS_PER_USER = 1;

  const getUserCars = (userId) => cars.filter(c => c.userId === userId);
  const getUserCarCount = (userId) => getUserCars(userId).length;
  const canAddCarToUser = (userId) => getUserCarCount(userId) < MAX_CARS_PER_USER;
  const canDeleteCarFromUser = (userId) => getUserCarCount(userId) > MIN_CARS_PER_USER;

  // Rewards state - memberships array indicates which membership levels can see/redeem this reward
  const [rewards, setRewards] = useState([
    { id: 1, title: 'Descuento del 10%', description: 'Descuento en próximo servicio', pointsRequired: 500, category: 'Descuento', available: true, memberships: ['gold', 'platinum', 'black'], imageUrl: 'https://picsum.photos/seed/reward1/200/150' },
    { id: 2, title: 'Mantenimiento Gratis', description: 'Mantenimiento básico gratis', pointsRequired: 1000, category: 'Servicio', available: true, memberships: ['platinum', 'black'], imageUrl: 'https://picsum.photos/seed/reward2/200/150' },
    { id: 3, title: 'Kit de Limpieza', description: 'Kit premium de limpieza', pointsRequired: 800, category: 'Producto', available: true, memberships: ['black'], imageUrl: 'https://picsum.photos/seed/reward3/200/150' },
  ]);

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalReward, setImageModalReward] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Promotions state
  const [promotions, setPromotions] = useState([
    { id: 1, title: 'Doble Puntos', description: 'Gana el doble de puntos este mes', validUntil: '2024-12-31', badge: 'Nuevo' },
    { id: 2, title: 'Fin de Año', description: '500 puntos extra en mantenimiento completo', validUntil: '2024-12-25', badge: 'Popular' },
  ]);

  // Form states
  const [formData, setFormData] = useState({});

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'cars' || type === 'points') {
      setFormData({ userId: item?.id });
    } else {
      setFormData(item || {});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    const userId = editingItem.id;
    if (!canAddCarToUser(userId)) {
      alert(`Este usuario ya tiene ${MAX_CARS_PER_USER} vehículos registrados (máximo permitido).`);
      return;
    }
    const newCar = {
      id: Date.now(),
      placa: formData.placa,
      marca: formData.marca,
      modelo: formData.modelo,
      año: parseInt(formData.año) || new Date().getFullYear(),
      userId: userId,
      userName: editingItem.name
    };
    setCars(prev => [...prev, newCar]);
    setFormData({ userId: userId });
  };

  const handleDeleteCar = (carId) => {
    const car = cars.find(c => c.id === carId);
    if (!canDeleteCarFromUser(car.userId)) {
      alert(`No se puede eliminar. El usuario debe tener al menos ${MIN_CARS_PER_USER} vehículo registrado.`);
      return;
    }
    setCars(prev => prev.filter(c => c.id !== carId));
  };

  const handlePointsTransaction = (e) => {
    e.preventDefault();
    const amount = parseInt(formData.pointsAmount) || 0;
    const type = formData.transactionType;
    const reason = formData.reason || '';
    
    if (amount <= 0) {
      alert('Ingrese una cantidad válida de puntos.');
      return;
    }

    const pointsChange = type === 'add' ? amount : -amount;
    const user = users.find(u => u.id === editingItem.id);
    const newPoints = Math.max(0, user.points + pointsChange);

    if (type === 'remove' && amount > user.points) {
      alert(`El usuario solo tiene ${user.points} puntos disponibles.`);
      return;
    }

    setUsers(prev => prev.map(u => 
      u.id === editingItem.id ? { ...u, points: newPoints } : u
    ));

    // Record transaction
    setPointsTransactions(prev => [...prev, {
      id: Date.now(),
      userId: editingItem.id,
      userName: editingItem.name,
      type,
      amount,
      reason,
      date: new Date().toISOString(),
      balanceAfter: newPoints
    }]);

    alert(`${type === 'add' ? 'Se agregaron' : 'Se quitaron'} ${amount} puntos. Nuevo saldo: ${newPoints}`);
    setFormData({ userId: editingItem.id, transactionType: 'add', pointsAmount: '', reason: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (modalType) {
      case 'user':
        if (editingItem) {
          setUsers(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...formData } : u));
        } else {
          const newUser = { ...formData, id: Date.now(), points: 0 };
          setUsers(prev => [...prev, newUser]);
          // New user needs at least 1 car - open cars modal after
          setTimeout(() => openModal('cars', newUser), 100);
          return;
        }
        break;
      case 'reward':
        if (editingItem) {
          setRewards(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        } else {
          setRewards(prev => [...prev, { ...formData, id: Date.now(), available: true, memberships: formData.memberships || ['gold', 'platinum', 'black'], imageUrl: formData.imageUrl || '' }]);
        }
        break;
      case 'promotion':
        if (editingItem) {
          setPromotions(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...formData } : p));
        } else {
          setPromotions(prev => [...prev, { ...formData, id: Date.now() }]);
        }
        break;
    }
    closeModal();
  };

  const openImageModal = (reward) => {
    setImageModalReward(reward);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageModalReward(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido.');
      return;
    }

    setUploadingImage(true);
    try {
      // Delete old image if exists
      if (imageModalReward?.imageUrl) {
        await deleteImageFromS3(imageModalReward.imageUrl);
      }

      // Upload new image
      const imageUrl = await uploadImageToS3(file);

      // Update reward with new image
      setRewards(prev => prev.map(r => 
        r.id === imageModalReward.id ? { ...r, imageUrl } : r
      ));

      // Update modal state
      setImageModalReward(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      alert('Error al subir la imagen. Intente de nuevo.');
      console.error('Upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = (type, id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    switch (type) {
      case 'user':
        setUsers(prev => prev.filter(u => u.id !== id));
        setCars(prev => prev.filter(c => c.userId !== id));
        break;
      case 'reward':
        setRewards(prev => prev.filter(r => r.id !== id));
        break;
      case 'promotion':
        setPromotions(prev => prev.filter(p => p.id !== id));
        break;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesName = !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCardNumber = !cardNumberFilter || u.cardNumber.toLowerCase().includes(cardNumberFilter.toLowerCase());
    const matchesRucCi = !rucCiFilter || u.rucCi.toLowerCase().includes(rucCiFilter.toLowerCase());
    
    const matchesMembership = membershipFilter === 'all' || u.membership === membershipFilter;
    
    const carCount = getUserCarCount(u.id);
    let matchesCarCount = true;
    if (carCountFilter === '1') matchesCarCount = carCount === 1;
    else if (carCountFilter === '2-3') matchesCarCount = carCount >= 2 && carCount <= 3;
    else if (carCountFilter === '4-5') matchesCarCount = carCount >= 4 && carCount <= 5;
    
    let matchesPoints = true;
    if (pointsRangeFilter === '0-500') matchesPoints = u.points <= 500;
    else if (pointsRangeFilter === '501-1000') matchesPoints = u.points > 500 && u.points <= 1000;
    else if (pointsRangeFilter === '1001-2000') matchesPoints = u.points > 1000 && u.points <= 2000;
    else if (pointsRangeFilter === '2000+') matchesPoints = u.points > 2000;
    
    return matchesName && matchesMembership && matchesCarCount && matchesPoints && matchesCardNumber && matchesRucCi;
  });

  const filteredRewards = rewards.filter(r => {
    const matchesTitle = !rewardTitleFilter || r.title.toLowerCase().includes(rewardTitleFilter.toLowerCase());
    const matchesDescription = !rewardDescriptionFilter || r.description.toLowerCase().includes(rewardDescriptionFilter.toLowerCase());
    const matchesCategory = rewardCategoryFilter === 'all' || r.category === rewardCategoryFilter;
    const matchesAvailability = rewardAvailabilityFilter === 'all' || 
      (rewardAvailabilityFilter === 'available' && r.available) ||
      (rewardAvailabilityFilter === 'unavailable' && !r.available);
    const matchesMembership = rewardMembershipFilter === 'all' || (r.memberships || []).includes(rewardMembershipFilter);
    return matchesTitle && matchesDescription && matchesCategory && matchesAvailability && matchesMembership;
  });

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBadge = promoBadgeFilter === 'all' || p.badge === promoBadgeFilter;
    return matchesSearch && matchesBadge;
  });

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}><FaTimes /></button>
          
          {/* User Modal */}
          {modalType === 'user' && (
            <>
              <h3>{editingItem ? 'Editar' : 'Crear'} Usuario</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Número de Tarjeta</label>
                  <input type="text" name="cardNumber" value={formData.cardNumber || ''} onChange={handleFormChange} required placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div className="form-group">
                  <label>RUC/C.I.</label>
                  <input type="text" name="rucCi" value={formData.rucCi || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Membresía</label>
                  <select name="membership" value={formData.membership || 'gold'} onChange={handleFormChange}>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={!formData.name || !formData.cardNumber || !formData.rucCi}
                  >
                    <FaCheck /> {editingItem ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Cars Management Modal */}
          {modalType === 'cars' && editingItem && (
            <>
              <h3><FaCar /> Vehículos de {editingItem.name}</h3>
              <p className="modal-subtitle">Vehículos: {getUserCarCount(editingItem.id)}/{MAX_CARS_PER_USER} (mín: {MIN_CARS_PER_USER})</p>
              
              {!canAddCarToUser(editingItem.id) && (
                <div className="max-cars-warning">
                  Este usuario ha alcanzado el máximo de {MAX_CARS_PER_USER} vehículos permitidos.
                </div>
              )}
              
              <div className="cars-list">
                {getUserCars(editingItem.id).map(car => (
                  <div key={car.id} className="car-item">
                    <div className="car-info">
                      <strong>{car.placa}</strong>
                      <span>{car.marca} {car.modelo} ({car.año})</span>
                    </div>
                    <button 
                      className="btn-delete-small"
                      onClick={() => handleDeleteCar(car.id)}
                      disabled={!canDeleteCarFromUser(editingItem.id)}
                      title={canDeleteCarFromUser(editingItem.id) ? "Eliminar" : "Mínimo 1 vehículo"}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {getUserCarCount(editingItem.id) === 0 && (
                  <p className="no-cars">Este usuario necesita al menos 1 vehículo.</p>
                )}
              </div>

              {canAddCarToUser(editingItem.id) && (
                <>
                  <h4 className="add-car-title"><FaPlus /> Agregar Vehículo</h4>
                  <form onSubmit={handleAddCar}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Placa</label>
                        <input type="text" name="placa" value={formData.placa || ''} onChange={handleFormChange} required />
                      </div>
                      <div className="form-group">
                        <label>Año</label>
                        <input type="number" name="año" value={formData.año || ''} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Marca</label>
                        <input type="text" name="marca" value={formData.marca || ''} onChange={handleFormChange} required />
                      </div>
                      <div className="form-group">
                        <label>Modelo</label>
                        <input type="text" name="modelo" value={formData.modelo || ''} onChange={handleFormChange} required />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn-submit btn-full"
                      disabled={!formData.placa || !formData.marca || !formData.modelo}
                    >
                      <FaPlus /> Agregar Vehículo
                    </button>
                  </form>
                </>
              )}
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cerrar</button>
              </div>
            </>
          )}

          {/* Points Transaction Modal */}
          {modalType === 'points' && editingItem && (
            <>
              <h3><FaCoins /> Transacción de Puntos</h3>
              <div className="points-user-info">
                <p><strong>Usuario:</strong> {editingItem.name}</p>
                <p><strong>Saldo actual:</strong> <span className="points-balance">{editingItem.points.toLocaleString()} puntos</span></p>
              </div>
              
              <form onSubmit={handlePointsTransaction}>
                <div className="form-group">
                  <label>Tipo de transacción</label>
                  <div className="transaction-type-selector">
                    <button 
                      type="button"
                      className={`type-btn add ${formData.transactionType === 'add' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, transactionType: 'add' }))}
                    >
                      <FaPlus /> Agregar Puntos
                    </button>
                    <button 
                      type="button"
                      className={`type-btn remove ${formData.transactionType === 'remove' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, transactionType: 'remove' }))}
                    >
                      <FaMinus /> Quitar Puntos
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Cantidad de puntos</label>
                  <input 
                    type="text" 
                    name="pointsAmount" 
                    value={formData.pointsAmount || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d+$/.test(val)) {
                        setFormData(prev => ({ ...prev, pointsAmount: val }));
                      }
                    }}
                    required 
                    placeholder="Ej: 100"
                  />
                </div>
                <div className="form-group">
                  <label>Razón / Descripción</label>
                  <textarea 
                    name="reason" 
                    value={formData.reason || ''} 
                    onChange={handleFormChange}
                    placeholder="Ej: Canje de recompensa, Bonificación, etc."
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className={`btn-submit ${formData.transactionType === 'remove' ? 'btn-remove' : ''}`}
                    disabled={!formData.transactionType || !formData.pointsAmount || !formData.reason}
                  >
                    <FaCheck /> Confirmar Transacción
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Reward Modal */}
          {modalType === 'reward' && (
            <>
              <h3>{editingItem ? 'Editar' : 'Crear'} Recompensa</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Puntos Requeridos</label>
                  <input 
                          type="text" 
                          name="pointsRequired" 
                          value={formData.pointsRequired || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setFormData(prev => ({ ...prev, pointsRequired: val }));
                            }
                          }} 
                          required 
                        />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select name="category" value={formData.category || 'Descuento'} onChange={handleFormChange}>
                    <option value="Descuento">Descuento</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Producto">Producto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Membresías que pueden ver esta recompensa</label>
                  <div className="memberships-checkboxes">
                    {['gold', 'platinum', 'black'].map(m => (
                      <label key={m} className={`membership-checkbox ${m}`}>
                        <input 
                          type="checkbox" 
                          checked={(formData.memberships || []).includes(m)}
                          onChange={(e) => {
                            const current = formData.memberships || [];
                            const updated = e.target.checked 
                              ? [...current, m]
                              : current.filter(x => x !== m);
                            setFormData(prev => ({ ...prev, memberships: updated }));
                          }}
                        />
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Imagen de la recompensa</label>
                  <div className="image-upload-inline">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="image-preview-small" />
                    ) : (
                      <div className="no-image-small">
                        <FaImage />
                      </div>
                    )}
                    <label className={`btn-upload-inline ${uploadingImage ? 'uploading' : ''}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file || !file.type.startsWith('image/')) return;
                          setUploadingImage(true);
                          try {
                            const imageUrl = await uploadImageToS3(file);
                            setFormData(prev => ({ ...prev, imageUrl }));
                          } catch (error) {
                            alert('Error al subir la imagen.');
                          } finally {
                            setUploadingImage(false);
                          }
                        }}
                        disabled={uploadingImage}
                        hidden
                      />
                      <FaImage /> {uploadingImage ? 'Subiendo...' : (formData.imageUrl ? 'Cambiar' : 'Subir imagen')}
                    </label>
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" name="available" checked={formData.available ?? true} onChange={handleFormChange} />
                    Disponible
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={!formData.title || !formData.description || !formData.pointsRequired || !(formData.memberships || []).length || !formData.imageUrl}
                  >
                    <FaCheck /> {editingItem ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Promotion Modal */}
          {modalType === 'promotion' && (
            <>
              <h3>{editingItem ? 'Editar' : 'Crear'} Promoción</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Válido hasta</label>
                  <input type="date" name="validUntil" value={formData.validUntil || ''} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Badge</label>
                  <select name="badge" value={formData.badge || 'Nuevo'} onChange={handleFormChange}>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Popular">Popular</option>
                    <option value="Limitado">Limitado</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={!formData.title || !formData.description || !formData.validUntil}
                  >
                    <FaCheck /> {editingItem ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="manager-dashboard">
      <header className="manager-header">
        <h1>Panel de Administración</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </header>

      <nav className="manager-nav">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          <FaUsers /> Usuarios
        </button>
        <button className={activeTab === 'rewards' ? 'active' : ''} onClick={() => setActiveTab('rewards')}>
          <FaGift /> Recompensas
        </button>
        <button className={activeTab === 'promotions' ? 'active' : ''} onClick={() => setActiveTab('promotions')}>
          <FaTag /> Promociones
        </button>
      </nav>

      <main className="manager-content">
        <div className="content-header">
          <button className="btn-add" onClick={() => openModal(
            activeTab === 'users' ? 'user' :
            activeTab === 'rewards' ? 'reward' : 'promotion'
          )}>
            <FaPlus /> Agregar
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          {activeTab === 'users' && (
            <>
              <input 
                type="text" 
                placeholder="Filtrar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
              <input 
                type="text" 
                placeholder="Filtrar por tarjeta..." 
                value={cardNumberFilter}
                onChange={(e) => setCardNumberFilter(e.target.value)}
                className="filter-input"
              />
              <input 
                type="text" 
                placeholder="Filtrar por RUC/C.I...." 
                value={rucCiFilter}
                onChange={(e) => setRucCiFilter(e.target.value)}
                className="filter-input"
              />
              <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
                <option value="all">Todas las membresías</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="black">Black</option>
              </select>
              <select value={carCountFilter} onChange={(e) => setCarCountFilter(e.target.value)}>
                <option value="all">Todos los vehículos</option>
                <option value="1">1 vehículo</option>
                <option value="2-3">2-3 vehículos</option>
                <option value="4-5">4-5 vehículos</option>
              </select>
              <select value={pointsRangeFilter} onChange={(e) => setPointsRangeFilter(e.target.value)}>
                <option value="all">Todos los puntos</option>
                <option value="0-500">0 - 500 pts</option>
                <option value="501-1000">501 - 1000 pts</option>
                <option value="1001-2000">1001 - 2000 pts</option>
                <option value="2000+">Más de 2000 pts</option>
              </select>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setCardNumberFilter('');
                  setRucCiFilter('');
                  setMembershipFilter('all');
                  setCarCountFilter('all');
                  setPointsRangeFilter('all');
                }}
              >
                <FaTimes /> Limpiar filtros
              </button>
            </>
          )}
          {activeTab === 'rewards' && (
            <>
              <input 
                type="text" 
                placeholder="Filtrar por título..." 
                value={rewardTitleFilter}
                onChange={(e) => setRewardTitleFilter(e.target.value)}
                className="filter-input"
              />
              <input 
                type="text" 
                placeholder="Filtrar por descripción..." 
                value={rewardDescriptionFilter}
                onChange={(e) => setRewardDescriptionFilter(e.target.value)}
                className="filter-input"
              />
              <select value={rewardCategoryFilter} onChange={(e) => setRewardCategoryFilter(e.target.value)}>
                <option value="all">Todas las categorías</option>
                <option value="Descuento">Descuento</option>
                <option value="Servicio">Servicio</option>
                <option value="Producto">Producto</option>
              </select>
              <select value={rewardAvailabilityFilter} onChange={(e) => setRewardAvailabilityFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">No disponibles</option>
              </select>
              <select value={rewardMembershipFilter} onChange={(e) => setRewardMembershipFilter(e.target.value)}>
                <option value="all">Todas las membresías</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="black">Black</option>
              </select>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setRewardTitleFilter('');
                  setRewardDescriptionFilter('');
                  setRewardCategoryFilter('all');
                  setRewardAvailabilityFilter('all');
                  setRewardMembershipFilter('all');
                }}
              >
                <FaTimes /> Limpiar filtros
              </button>
            </>
          )}
          {activeTab === 'promotions' && (
            <>
              <select value={promoBadgeFilter} onChange={(e) => setPromoBadgeFilter(e.target.value)}>
                <option value="all">Todos los badges</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Popular">Popular</option>
                <option value="Limitado">Limitado</option>
              </select>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setPromoBadgeFilter('all');
                }}
              >
                <FaTimes /> Limpiar filtros
              </button>
            </>
          )}
        </div>

        {activeTab === 'users' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Número de Tarjeta</th>
                  <th>RUC/C.I.</th>
                  <th>Membresía</th>
                  <th>Vehículos</th>
                  <th>Puntos</th>
                  <th><FaCog /> Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.cardNumber}</td>
                    <td>{user.rucCi}</td>
                    <td><span className={`membership-badge ${user.membership}`}>{user.membership}</span></td>
                    <td>
                      <button className="btn-cars" onClick={() => openModal('cars', user)} title="Gestionar vehículos">
                        <FaCar /> {getUserCarCount(user.id)}/{MAX_CARS_PER_USER}
                      </button>
                    </td>
                    <td>
                      <button className="btn-points-display" onClick={() => openModal('points', user)} title="Gestionar puntos">
                        <FaCoins /> {user.points.toLocaleString()}
                      </button>
                    </td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openModal('user', user)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete('user', user.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Puntos</th>
                  <th>Categoría</th>
                  <th>Membresías</th>
                  <th>Estado</th>
                  <th><FaCog /> Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRewards.map(reward => (
                  <tr key={reward.id}>
                    <td>
                      <div className="reward-image-cell" onClick={() => openImageModal(reward)}>
                        {reward.imageUrl ? (
                          <img src={reward.imageUrl} alt={reward.title} className="reward-thumbnail" />
                        ) : (
                          <div className="no-image-placeholder">
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td><strong>{reward.title}</strong></td>
                    <td>{reward.description}</td>
                    <td>{reward.pointsRequired.toLocaleString()}</td>
                    <td>{reward.category}</td>
                    <td>
                      <div className="memberships-tags">
                        {(reward.memberships || []).map(m => (
                          <span key={m} className={`membership-badge ${m}`}>{m}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${reward.available ? 'available' : 'unavailable'}`}>
                        {reward.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-image" onClick={() => openImageModal(reward)} title="Gestionar imagen">
                        <FaImage />
                      </button>
                      <button className="btn-edit" onClick={() => openModal('reward', reward)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete('reward', reward.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Válido hasta</th>
                  <th>Badge</th>
                  <th><FaCog /> Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map(promo => (
                  <tr key={promo.id}>
                    <td><strong>{promo.title}</strong></td>
                    <td>{promo.description}</td>
                    <td>{new Date(promo.validUntil).toLocaleDateString('es-ES')}</td>
                    <td><span className="promo-badge">{promo.badge}</span></td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openModal('promotion', promo)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete('promotion', promo.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {renderModal()}

      {/* Image Modal */}
      {showImageModal && imageModalReward && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content image-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}><FaTimes /></button>
            <h3><FaImage /> Imagen de Recompensa</h3>
            <p className="modal-subtitle">{imageModalReward.title}</p>
            
            <div className="image-preview-container">
              {imageModalReward.imageUrl ? (
                <img src={imageModalReward.imageUrl} alt={imageModalReward.title} className="image-preview" />
              ) : (
                <div className="no-image-large">
                  <FaImage />
                  <span>Sin imagen</span>
                </div>
              )}
            </div>

            <div className="image-upload-section">
              <label className={`btn-upload ${uploadingImage ? 'uploading' : ''}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  hidden
                />
                <FaImage /> {uploadingImage ? 'Subiendo...' : (imageModalReward.imageUrl ? 'Cambiar imagen' : 'Subir imagen')}
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeImageModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

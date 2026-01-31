import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/user';
import { useAlert } from './AlertContext';
import { useConfirm } from './ConfirmContext';
import logger from '../utils/logger';
import { 
  getAllAutoVipUsers, 
  getMembershipById, 
  getCarsCountByUserId, 
  getAllMemberships, 
  createAutoVipUser,
  updateUser,
  deleteUser,
  getAllCarsByUserId,
  createCarForUser,
  deleteCarById,
  managePointTransaction,
  loadTransactionTypes,
} from '../services/autovipUsers';
import { 
  getRewardTypes, 
  createReward, 
  getAllRewards, 
  updateReward, 
  deleteReward, 
  uploadImage } from '../services/autovipRewards';
import { createPromotion, getAllPromotions, updatePromotion, deletePromotion } from '../services/autovipPromotions';
import './ManagerDashboard.css';
import logoImage from '../assets/FJ-LOGOTIPO.png';
import Loading from './Loading';
import { 
  FaUsers, FaCar, FaGift, FaTag, FaCoins, FaPlus, FaTrash, 
  FaEdit, FaSearch, FaSignOutAlt, FaTimes, FaCheck, FaMinus, FaCog, FaImage
} from 'react-icons/fa';
import Alert from './Alert';

export default function ManagerDashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useAlert();
  const { showConfirm } = useConfirm();
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
  const [promoTitleFilter, setPromoTitleFilter] = useState('');
  const [promoDescriptionFilter, setPromoDescriptionFilter] = useState('');
  const [promoDesdeFilter, setPromoDesdeFilter] = useState('');
  const [promoHastaFilter, setPromoHastaFilter] = useState('');
  const [promoExpiredFilter, setPromoExpiredFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  // Loading state
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingTransactionTypes, setLoadingTransactionTypes] = useState(false);
  const [loadingRewardTypes, setLoadingRewardTypes] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  
  // Memberships state
  const [memberships, setMemberships] = useState([]);

  // Transaction types state
  const [transactionTypes, setTransactionTypes] = useState([]);

  // Reward types state
  const [rewardTypes, setRewardTypes] = useState([]);

  // Cars state - stores cars for the currently viewed user
  const [cars, setCars] = useState([]);
  const [currentUserIdForCars, setCurrentUserIdForCars] = useState(null);

  // Points transactions history
  const [pointsTransactions, setPointsTransactions] = useState([]);

  const MAX_CARS_PER_USER = 5;
  const MIN_CARS_PER_USER = 1;

  const getUserCars = (userId) => {
    // Only return cars if we're viewing the current user's cars
    if (currentUserIdForCars === userId) {
      return cars;
    }
    return [];
  };
  
  const getUserCarCount = (userId) => {
    // First check if user has carCount property (from API)
    const user = users.find(u => u.id === userId);
    if (user && user.carCount !== undefined) {
      return user.carCount;
    }
    // Fallback to local cars array only if we're viewing this user's cars
    if (currentUserIdForCars === userId) {
      return cars.length;
    }
    return 0;
  };

  const canAddCarToUser = (userId) => getUserCarCount(userId) < MAX_CARS_PER_USER;
  const canDeleteCarFromUser = (userId) => getUserCarCount(userId) > MIN_CARS_PER_USER;

  // Function to load cars for a specific user
  const loadUserCars = async (userId) => {
    setLoadingCars(true);
    try {
      const carsData = await getAllCarsByUserId(userId);
      
      // Transform car data to match component expectations
      const processedCars = carsData.map(car => ({
        id: car.id,
        placa: car.plate,
        marca: car.make,
        modelo: car.model,
        año: car.year,
        color: car.color,
        userId: userId,
        userName: users.find(u => u.id === userId)?.name || '',
        _original: car
      }));


      setCars(processedCars);
      setCurrentUserIdForCars(userId);
    } catch (error) {
      showError('Error al cargar los vehículos. Por favor, intente de nuevo.');
      setCars([]);
      setCurrentUserIdForCars(null);
    } finally {
      setLoadingCars(false);
    }
  };

  // Function to load all users with their membership and car count data
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all users
      const usersData = await getAllAutoVipUsers();
      
      // Process each user to get membership and car count
      const processedUsers = await Promise.all(
        usersData.map(async (user) => {
          let membership = 'undefined'; // default
          let carCount = 0;

          // Get membership details if membresiaId exists
          // the variable name membresiaId might be wrong
          if (user.membership_id) {
            try {
              const membershipData = await getMembershipById(user.membership_id);
              membership = membershipData?.name || 'undefined';
            } catch (error) {
              logger.warn(`Failed to load membership for user ${user.id}:`, error);
            }
          }

          // Get car count for this user
          try {
            carCount = await getCarsCountByUserId(user.id);
          } catch (error) {
            logger.warn(`Failed to load car count for user ${user.id}:`, error?.message || error);
          }

          // Transform user data to match component expectations
          // Adjust field mappings based on your API response structure
          return {
            id: user.id,
            name: user.name,
            cardNumber: user.card_number,
            rucCi: user.ruc_ci, //I decided to change the name of this varible here, make sure is the same in backend and db
            points: user.points_balance,
            membership: membership.toLowerCase(), // Ensure lowercase for consistency
            carCount: carCount, // Store car count in user object
            // Store original user data for reference
            _original: user
          };
        })
      );

      setUsers(processedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      showError('Error al cargar los usuarios. Por favor, intente de nuevo.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to load all memberships
  const loadMemberships = async () => {
    setLoadingMemberships(true);
    try {
      const membershipsData = await getAllMemberships();
      setMemberships(membershipsData);
    } catch (error) {
      console.error('Failed to load memberships:', error);
      showError('Error al cargar las membresías. Por favor, intente de nuevo.');
    } finally {
      setLoadingMemberships(false);
    }
  };

  // Function to load all transaction types
  const loadPointsTransactionTypes = async () => {
    setLoadingTransactionTypes(true);
    try {
      const transactionTypesData = await loadTransactionTypes();
      setTransactionTypes(transactionTypesData);
    } catch (error) {
      console.error('Failed to load transaction types:', error);
      showError('Error al cargar los tipos de transacción. Por favor, intente de nuevo.');
    } finally {
      setLoadingTransactionTypes(false);
    }
  };

  // Function to load all reward types
  const loadRewardTypesData = async () => {
    setLoadingRewardTypes(true);
    try {
      const rewardTypesData = await getRewardTypes();
      setRewardTypes(rewardTypesData);
    } catch (error) {
      console.error('Failed to load reward types:', error);
      showError('Error al cargar los tipos de recompensa. Por favor, intente de nuevo.');
    } finally {
      setLoadingRewardTypes(false);
    }
  };

  // Function to load all rewards
  const loadRewards = async () => {
    setLoadingRewards(true);
    try {
      const rewardsData = await getAllRewards();
      // Process rewards data to match component expectations
      const processedRewards = rewardsData.map(reward => {
        // Find the category name from rewardTypes
        const categoryName = rewardTypes.find(rt => rt.id === reward.categoryId)?.type || 'Desconocido';
        
        // Find membership names from memberships array
        const membershipNames = (reward.memberships || []).map(membershipId => {
          const membership = memberships.find(m => m.id === membershipId);
          return membership ? membership.name.toLowerCase() : null;
        }).filter(Boolean);
        
        return {
          id: reward.id,
          title: reward.title || '',
          description: reward.description || '',
          pointsRequired: reward.pointsRequired || 0,
          category: categoryName,
          available: reward.available ?? true,
          memberships: membershipNames,
          imageUrl: reward.imageUrl || '',
          _original: reward
        };
      });
      setRewards(processedRewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      showError('Error al cargar las recompensas. Por favor, intente de nuevo.');
    } finally {
      setLoadingRewards(false);
    }
  };

  // Load users, memberships, transaction types, and reward types on component mount
  useEffect(() => {
    loadUsers();
    loadMemberships();
    loadPointsTransactionTypes();
    loadRewardTypesData();
  }, []);

  // Function to load all promotions
  const loadPromotions = async () => {
    setLoadingPromotions(true);
    try {
      const promotionsData = await getAllPromotions();
      // Process promotions data to match component expectations
      const processedPromotions = promotionsData.map(promotion => {
        return {
          id: promotion.id,
          title: promotion.title,
          description: promotion.description,
          validUntil: promotion.expires_at || promotion.validUntil || '',
          imageUrl: promotion.imageUrl || '',
          expires_at: promotion.expires_at,
          imageKey: promotion.imageKey,
          createdAt: promotion.createdAt,
          updatedAt: promotion.updatedAt,
          _original: promotion
        };
      });
      setPromotions(processedPromotions);
    } catch (error) {
      console.error('Failed to load promotions:', error);
      showError('Error al cargar las promociones. Por favor, intente de nuevo.');
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Load rewards after memberships and reward types are loaded
  useEffect(() => {
    if (memberships.length > 0 && rewardTypes.length > 0) {
      loadRewards();
    }
  }, [memberships, rewardTypes]);

  // Load promotions on component mount
  useEffect(() => {
    loadPromotions();
  }, []);

  // Rewards state - memberships array indicates which membership levels can see/redeem this reward
  const [rewards, setRewards] = useState([]);

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalItem, setImageModalItem] = useState(null);
  const [imageModalType, setImageModalType] = useState(null); // 'reward' or 'promotion'
  const [uploadingImage, setUploadingImage] = useState(false);

  // Promotions state
  const [promotions, setPromotions] = useState([]);

  // Form states
  const [formData, setFormData] = useState({});

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const openModal = async (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'cars') {
      setFormData({ userId: item?.id });
      setShowModal(true);
      // Load cars for this user
      if (item?.id) {
        await loadUserCars(item.id);
      }
    } else if (type === 'points') {
      setFormData({ 
        userId: item?.id,
        transactionType: 'add',
        pointsAmount: '',
        reason: '',
        transactionTypeId: '',
        rewardId: '' // Optional reward field
      });
      setShowModal(true);
    } else if (type === 'user' && item) {
      // When editing a user, we need to get the membership ID from the original data
      const membershipId = item._original?.membership_id;
      setFormData({
        ...item,
        membership: membershipId
      });
      setShowModal(true);
    } else if (type === 'reward' && item) {
      // When editing a reward, we need to get the category ID and membership IDs from the original data
      let categoryId = item._original?.categoryId || item._original?.category_id;
      
      // Fallback: if categoryId is not found, try to find it by matching the category name
      if (!categoryId && item.category) {
        const foundCategory = rewardTypes.find(rt => rt.type === item.category);
        categoryId = foundCategory?.id;
      }
      
      // Get membership IDs from original data
      let membershipIds = item._original?.memberships || [];
      
      // Fallback: if membership IDs are not found, try to find them by matching membership names
      if (membershipIds.length === 0 && item.memberships && Array.isArray(item.memberships)) {
        membershipIds = item.memberships.map(membershipName => {
          const foundMembership = memberships.find(m => m.name.toLowerCase() === membershipName.toLowerCase());
          return foundMembership?.id;
        }).filter(Boolean);
      }
      
      setFormData({
        ...item,
        category: categoryId,
        memberships: membershipIds,
        imageUrl: item.imageUrl || item._original?.imageUrl || item._original?.image_url || ''
      });
      setShowModal(true);
    } else if (type === 'promotion' && item) {
      // When editing a promotion, map expires_at to validUntil
      setFormData({
        ...item,
        validUntil: item.expires_at || item.validUntil || item._original?.expires_at || item._original?.valid_until || '',
        imageUrl: item.imageUrl || item._original?.imageUrl || item._original?.image_url || ''
      });
      setShowModal(true);
    } else {
      setFormData(item || {});
      setShowModal(true);
    }
  };

  const closeModal = () => {
    // Clean up preview URL if it exists
    if (formData.imagePreviewUrl && formData.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imagePreviewUrl);
    }
    
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    // Clear cars state when closing modal
    if (modalType === 'cars') {
      setCars([]);
      setCurrentUserIdForCars(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const userId = editingItem.id;
    if (!canAddCarToUser(userId)) {
      showWarning(`Este usuario ya tiene ${MAX_CARS_PER_USER} vehículos registrados (máximo permitido).`);
      return;
    }

    try {
      const vehicleData = {
        placa: formData.placa,
        marca: formData.marca,
        modelo: formData.modelo,
        año: parseInt(formData.año) || new Date().getFullYear(),
        color: formData.color || 'No especificado'
      };

      // Create vehicle via API
      await createCarForUser(userId, vehicleData);

      // Reload cars for this user
      await loadUserCars(userId);
      
      // Update user's car count in the users list
      await loadUsers();

      // Clear form
      setFormData({ userId: userId });
      
      showSuccess('Vehículo agregado exitosamente.');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showError(error.response?.data?.message || error.message || error || 'Error al agregar el vehículo. Por favor, intente de nuevo.');
    }
  };

  const handleDeleteCar = async (carId) => {
    const userId = editingItem.id;
    if (!canDeleteCarFromUser(userId)) {
      showWarning(`No se puede eliminar. El usuario debe tener al menos ${MIN_CARS_PER_USER} vehículo registrado.`);
      return;
    }

    const confirmed = await showConfirm('¿Estás seguro de eliminar este vehículo?', {
      title: 'Eliminar Vehículo',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) return;

    try {
      // Delete vehicle via API
      await deleteCarById(carId);

      // Reload cars for this user
      await loadUserCars(userId);
      
      // Update user's car count in the users list
      await loadUsers();

      showSuccess('Vehículo eliminado exitosamente.');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showError(error.response?.data?.message || error.message || error || 'Error al eliminar el vehículo. Por favor, intente de nuevo.');
    }
  };

  const handlePointsTransaction = async (e) => {
    e.preventDefault();
    const amount = parseInt(formData.pointsAmount) || 0;
    const type = formData.transactionType;
    const reason = formData.reason || '';
    const transactionTypeId = formData.transactionTypeId;
    const rewardId = formData.rewardId || null;
    
    if (amount <= 0) {
      showWarning('Ingrese una cantidad válida de puntos.');
      return;
    }

    if (!transactionTypeId) {
      showWarning('Por favor seleccione un tipo de transacción.');
      return;
    }

    const selectedTxType = transactionTypes.find(tx => tx.id === parseInt(transactionTypeId));
    const isCanje = selectedTxType?.type?.toLowerCase() === 'canje';
    
    if (isCanje && !rewardId) {
      showWarning('Por favor seleccione una recompensa para la categoría "Canje".');
      return;
    }

    const user = users.find(u => u.id === editingItem.id);

    if (type === 'remove' && amount > user.points) {
      showWarning(`El usuario solo tiene ${user.points} puntos disponibles.`);
      return;
    }
    
    if (isCanje && rewardId) {
      const selectedReward = rewards.find(r => r.id === parseInt(rewardId));
      if (selectedReward?.pointsRequired !== amount) {
        showWarning(`Los puntos deben coincidir con los puntos de la recompensa seleccionada (${selectedReward.pointsRequired} puntos).`);
        return;
      }
    }

    try {
      // Call API to manage the points transaction
      const transactionData = {
        type,
        amount,
        reason,
        transactionTypeId
      };
      
      // Include rewardId only if it's provided
      if (rewardId) {
        transactionData.rewardId = rewardId;
      }
      
      const updatedUser = await managePointTransaction(editingItem.id, transactionData);

      // Update local state with the new user data
      await loadUsers();

      // Record transaction locally for history
      setPointsTransactions(prev => [...prev, {
        id: Date.now(),
        userId: editingItem.id,
        userName: editingItem.name,
        type,
        amount,
        reason,
        date: new Date().toISOString(),
        balanceAfter: updatedUser.user.points_balance || updatedUser.user.points
      }]);

      showSuccess(`${type === 'add' ? 'Se agregaron' : 'Se quitaron'} ${amount} puntos exitosamente. Nuevo saldo: ${updatedUser.user.points_balance || updatedUser.user.points}`);
      
      // Reset form and close modal
      setFormData({ userId: editingItem.id, transactionType: 'add', pointsAmount: '', reason: '', transactionTypeId: '', rewardId: '' });
      closeModal();
    } catch (error) {
      console.error('Error managing points transaction:', error);
      showError(error.response?.data?.message || error.message || error || 'Error al procesar la transacción de puntos. Por favor, intente de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    switch (modalType) {
      case 'user':
        if (editingItem) {
          // Update existing user via API
          try {
            // Find the selected membership by ID
            const membershipId = parseInt(formData.membership);
            const selectedMembership = memberships.find(m => m.id === membershipId);
            
            if (!selectedMembership) {
              showWarning('Por favor seleccione una membresía válida.');
              return;
            }

            const userData = {
              name: formData.name,
              cardNumber: formData.cardNumber,
              rucCi: formData.rucCi,
              membershipId: selectedMembership.id
            };

            // Call API to update user
            await updateUser(editingItem.id, userData);
            
            // Reload users to get the updated list
            await loadUsers();
            
            showSuccess('Usuario actualizado exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.error('Error updating user:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al actualizar el usuario. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        } else {
          // Create new user with vehicle via API
          try {
            // Find the selected membership by ID
            const membershipId = parseInt(formData.membership);
            const selectedMembership = memberships.find(m => m.id === membershipId);
            
            if (!selectedMembership) {
              showWarning('Por favor seleccione una membresía válida.');
              return;
            }

            const userData = {
              name: formData.name,
              cardNumber: formData.cardNumber,
              rucCi: formData.rucCi,
              membershipId: selectedMembership.id
            };

            const vehicleData = {
              placa: formData.carPlaca,
              marca: formData.carMarca,
              modelo: formData.carModelo,
              año: parseInt(formData.carAño),
              color: formData.carColor
            };

            // Call API to create user and vehicle
            await createAutoVipUser(userData, vehicleData);
            
            // Reload users to get the updated list
            await loadUsers();
            
            showSuccess('Usuario creado exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.log(error);
            console.error('Error creating user:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al crear el usuario. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        }
        break;
      case 'reward':
        if (editingItem) {
          // Edit existing reward via API
          try {
            const rewardData = {
              title: formData.title,
              description: formData.description,
              pointsRequired: parseInt(formData.pointsRequired),
              categoryId: parseInt(formData.category), // Pass category ID
              memberships: formData.memberships || [],
              available: formData.available !== undefined ? formData.available : true
            };

            // Include image file if a new one was selected, otherwise keep existing imageUrl
            if (formData.imageFile) {
              rewardData.imageFile = formData.imageFile;
            } else if (formData.imageUrl) {
              rewardData.imageUrl = formData.imageUrl;
            }

            // Call API to update reward
            await updateReward(editingItem.id, rewardData);
            
            // Reload rewards to get the updated list
            await loadRewards();
            
            showSuccess('Recompensa actualizada exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.error('Error updating reward:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al actualizar la recompensa. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        } else {
          // Create new reward via API
          try {
            const rewardData = {
              title: formData.title,
              description: formData.description,
              pointsRequired: parseInt(formData.pointsRequired),
              categoryId: parseInt(formData.category), // Pass category ID
              memberships: formData.memberships || [],
              available: formData.available !== undefined ? formData.available : true
            };

            // Include image file if provided
            if (formData.imageFile) {
              rewardData.imageFile = formData.imageFile;
            } else if (formData.imageUrl) {
              rewardData.imageUrl = formData.imageUrl;
            }

            // Call API to create reward
            await createReward(rewardData);
            
            // Reload rewards to get the updated list
            await loadRewards();
            
            showSuccess('Recompensa creada exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.error('Error creating reward:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al crear la recompensa. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        }
        break;
      case 'promotion':
        if (editingItem) {
          // Update existing promotion via API
          try {
            const promotionData = {
              title: formData.title,
              description: formData.description,
              validUntil: formData.validUntil
            };

            // Include image file if provided, otherwise use imageUrl
            if (formData.imageFile) {
              promotionData.imageFile = formData.imageFile;
            } else if (formData.imageUrl !== undefined) {
              promotionData.imageUrl = formData.imageUrl;
            }

            // Call API to update promotion
            await updatePromotion(editingItem.id, promotionData);
            
            // Reload promotions to get the updated list
            await loadPromotions();
            
            showSuccess('Promoción actualizada exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.error('Error updating promotion:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al actualizar la promoción. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        } else {
          // Create new promotion via API
          try {
            const promotionData = {
              title: formData.title,
              description: formData.description,
              validUntil: formData.validUntil
            };

            // Include image file if provided, otherwise use imageUrl
            if (formData.imageFile) {
              promotionData.imageFile = formData.imageFile;
            } else if (formData.imageUrl) {
              promotionData.imageUrl = formData.imageUrl;
            }

            // Call API to create promotion
            await createPromotion(promotionData);
            
            // Reload promotions to get the updated list
            await loadPromotions();
            
            showSuccess('Promoción creada exitosamente.');
            closeModal(); // Close modal only on success
            return; // Return early to avoid calling closeModal again
          } catch (error) {
            console.error('Error creating promotion:', error);
            showError(error.response?.data?.message || error.message || error || 'Error al crear la promoción. Por favor, intente de nuevo.');
            return; // Don't close modal on error
          }
        }
        break;
    }
    closeModal();
  };

  const openImageModal = (item, type) => {
    setImageModalItem(item);
    setImageModalType(type);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageModalItem(null);
    setImageModalType(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showWarning('Por favor seleccione un archivo de imagen válido.');
      return;
    }

    setUploadingImage(true);
    try {
      if (imageModalType === 'reward') {
        // For rewards, send image file in the update payload
        const rewardData = {
          imageFile: file
        };
        
        const updatedReward = await updateReward(imageModalItem.id, rewardData);
        
        // Update rewards list with the new image URL from the response
        const newImageUrl = updatedReward.image_url || updatedReward.imageUrl;
        setRewards(prev => prev.map(r => 
          r.id === imageModalItem.id ? { ...r, imageUrl: newImageUrl } : r
        ));
        
        // Update modal state
        setImageModalItem(prev => ({ ...prev, imageUrl: newImageUrl }));
      } else if (imageModalType === 'promotion') {
        // For promotions (local state), use the uploadImage function
        const imageUrl = await uploadImage(file);
        setPromotions(prev => prev.map(p => 
          p.id === imageModalItem.id ? { ...p, imageUrl } : p
        ));
        setImageModalItem(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      showError('Error al subir la imagen. Intente de nuevo.');
      console.error('Upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (type, id) => {
    const elementNames = {
      user: 'usuario',
      reward: 'recompensa',
      promotion: 'promoción'
    };
    
    const elementName = elementNames[type] || 'elemento';
    const confirmed = await showConfirm(`¿Estás seguro de eliminar este ${elementName}?`, {
      title: 'Eliminar Elemento',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) return;
    
    switch (type) {
      case 'user':
        try {
          // Delete user via API
          await deleteUser(id);
          
          // Update local state
          setUsers(prev => prev.filter(u => u.id !== id));
          
          showSuccess('Usuario eliminado exitosamente.');
        } catch (error) {
          console.error('Error deleting user:', error);
          showError(error.response?.data?.message || error.message || error || 'Error al eliminar el usuario. Por favor, intente de nuevo.');
        }
        break;
      case 'reward':
        try {
          // Delete reward via API
          await deleteReward(id);
          
          // Update local state
          await loadRewards();
          
          showSuccess('Recompensa eliminada exitosamente.');
        } catch (error) {
          console.error('Error deleting reward:', error);
          showError(error.response?.data?.message || error.message || error || 'Error al eliminar la recompensa. Por favor, intente de nuevo.');
        }
        break;
      case 'promotion':
        try {
          // Delete promotion via API
          await deletePromotion(id);
          
          // Reload promotions to get the updated list
          await loadPromotions();
          
          showSuccess('Promoción eliminada exitosamente.');
        } catch (error) {
          console.error('Error deleting promotion:', error);
          showError(error.response?.data?.message || error.message || error || 'Error al eliminar la promoción. Por favor, intente de nuevo.');
        }
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
    const matchesTitle = !promoTitleFilter || p.title.toLowerCase().includes(promoTitleFilter.toLowerCase());
    const matchesDescription = !promoDescriptionFilter || p.description.toLowerCase().includes(promoDescriptionFilter.toLowerCase());
    
    // Date range filtering (desde - hasta)
    let matchesDateRange = true;
    if (p.validUntil) {
      const validUntilDate = new Date(p.validUntil);
      validUntilDate.setHours(0, 0, 0, 0);
      
      // If desde is provided, check if validUntil is >= desde
      if (promoDesdeFilter) {
        const desdeDate = new Date(promoDesdeFilter);
        desdeDate.setHours(0, 0, 0, 0);
        if (validUntilDate < desdeDate) {
          matchesDateRange = false;
        }
      }
      
      // If hasta is provided, check if validUntil is <= hasta
      if (promoHastaFilter && matchesDateRange) {
        const hastaDate = new Date(promoHastaFilter);
        hastaDate.setHours(0, 0, 0, 0);
        if (validUntilDate > hastaDate) {
          matchesDateRange = false;
        }
      }
    } else {
      // If promotion has no validUntil date, only show it if no date filters are set
      // or if estado filter is set to 'na'
      if (promoDesdeFilter || promoHastaFilter) {
        matchesDateRange = false;
      }
    }
    
    // Estado filter (valid, expired, N/A)
    let matchesExpired = true;
    if (promoExpiredFilter !== 'all') {
      if (!p.validUntil) {
        // No date means N/A - only match if filter is 'na'
        matchesExpired = promoExpiredFilter === 'na';
      } else {
        // Has date - check if valid or expired
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const validUntilDate = new Date(p.validUntil);
        validUntilDate.setHours(0, 0, 0, 0);
        const isExpired = validUntilDate < today;
        
        if (promoExpiredFilter === 'valid') {
          matchesExpired = !isExpired;
        } else if (promoExpiredFilter === 'expired') {
          matchesExpired = isExpired;
        } else if (promoExpiredFilter === 'na') {
          matchesExpired = false; // N/A only applies to promotions without dates
        }
      }
    }
    
    return matchesTitle && matchesDescription && matchesDateRange && matchesExpired;
  });

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}><FaTimes /></button>
          <div className="modal-content-inner">
          {/* User Modal */}
          {modalType === 'user' && (
            <>
              <h3>{editingItem ? 'Editar' : 'Crear'} Usuario</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} autoComplete="off" required />
                </div>
                <div className="form-group">
                  <label>Número de Tarjeta</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={formData.cardNumber || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      // Remove all non-digit characters
                      const digitsOnly = val.replace(/\D/g, '');
                      // Only update if it's empty or a positive integer (starts with 1-9, followed by any digits)
                      if (digitsOnly === '' || /^[0-9]\d*$/.test(digitsOnly)) {
                        setFormData(prev => ({
                          ...prev,
                          cardNumber: digitsOnly
                        }));
                      }
                    }}
                    pattern="[0-9]\d*"
                    inputMode="numeric"
                    autoComplete="off" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>RUC/C.I.</label>
                  <input 
                    type="text" 
                    name="rucCi" 
                    value={formData.rucCi || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      // Remove all non-digit characters
                      const digitsOnly = val.replace(/\D/g, '');
                      // Only update if it's empty or a positive integer (starts with 1-9, followed by any digits)
                      if (digitsOnly === '' || /^[0-9]\d*$/.test(digitsOnly)) {
                        setFormData(prev => ({
                          ...prev,
                          rucCi: digitsOnly
                        }));
                      }
                    }}
                    pattern="[0-9]\d*"
                    inputMode="numeric"
                    autoComplete="off" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Membresía</label>
                  <select 
                    name="membership" 
                    value={formData.membership || ''} 
                    onChange={handleFormChange}
                    required
                    disabled={loadingMemberships}
                  >
                    <option value="">{loadingMemberships ? 'Cargando...' : 'Seleccione una membresía'}</option>
                    {memberships.map(membership => (
                      <option key={membership.id} value={membership.id}>
                        {membership.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Car fields - only shown when creating a new user */}
                {!editingItem && (
                  <>
                    <div className="form-divider">
                      <h4 className="section-title"><FaCar /> Vehículo (Requerido)</h4>
                      <p className="section-subtitle">Todos los usuarios deben tener al menos un vehículo</p>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Placa *</label>
                        <input type="text" name="carPlaca" value={formData.carPlaca || ''} onChange={handleFormChange} autoComplete="off" required placeholder="ABC123" />
                      </div>
                      <div className="form-group">
                        <label>Año *</label>
                        <input 
                          type="text" 
                          name="carAño" 
                          value={formData.carAño || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            // Remove all non-digit characters
                            const digitsOnly = val.replace(/\D/g, '');
                            // Only update if it's empty or a 4-digit positive integer (starts with 1-9, followed by exactly 3 more digits)
                            if (digitsOnly === '' || (digitsOnly.length <= 4 && /^[0-9]\d{0,3}$/.test(digitsOnly))) {
                              setFormData(prev => ({
                                ...prev,
                                carAño: digitsOnly
                              }));
                            }
                          }}
                          pattern="[0-9]\d{3}"
                          inputMode="numeric"
                          autoComplete="off"
                          required 
                          placeholder={new Date().getFullYear()}
                          minLength="4"
                          maxLength="4"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Marca *</label>
                        <input type="text" name="carMarca" value={formData.carMarca || ''} onChange={handleFormChange} autoComplete="off" required placeholder="Toyota" />
                      </div>
                      <div className="form-group">
                        <label>Modelo *</label>
                        <input type="text" name="carModelo" value={formData.carModelo || ''} onChange={handleFormChange} autoComplete="off" required placeholder="Corolla" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Color *</label>
                        <input type="text" name="carColor" value={formData.carColor || ''} onChange={handleFormChange} autoComplete="off" required placeholder="Rojo" />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={
                      !formData.name || 
                      !formData.cardNumber || 
                      !formData.rucCi ||
                      !formData.membership ||
                      (!editingItem && (!formData.carPlaca || !formData.carMarca || !formData.carModelo || !formData.carColor || !formData.carAño || formData.carAño.length !== 4))
                    }
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
              
              {!canAddCarToUser(editingItem.id) && !loadingCars && (
                <div className="max-cars-warning">
                  Este usuario ha alcanzado el máximo de {MAX_CARS_PER_USER} vehículos permitidos.
                </div>
              )}
              
              {loadingCars ? (
                <Loading message="Cargando vehículos..." fullScreen={true} />
              ) : (
                <div className="cars-list">
                  {getUserCars(editingItem.id).map(car => (
                    <div key={car.id} className="car-item">
                      <div className="car-info">
                        <strong>{car.placa}</strong>
                        <span>{car.marca} {car.modelo} ({car.año}) - {car.color}</span>
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
              )}

              {canAddCarToUser(editingItem.id) && !loadingCars && (
                <>
                  <h4 className="add-car-title"><FaPlus /> Agregar Vehículo</h4>
                  <form onSubmit={handleAddCar}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Placa</label>
                        <input type="text" name="placa" value={formData.placa || ''} onChange={handleFormChange} autoComplete="off" required />
                      </div>
                      <div className="form-group">
                        <label>Año</label>
                        <input 
                          type="text" 
                          name="año" 
                          value={formData.año || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            // Remove all non-digit characters
                            const digitsOnly = val.replace(/\D/g, '');
                            // Only update if it's empty or a 4-digit positive integer (starts with 1-9, followed by exactly 3 more digits)
                            if (digitsOnly === '' || (digitsOnly.length <= 4 && /^[0-9]\d{0,3}$/.test(digitsOnly))) {
                              setFormData(prev => ({
                                ...prev,
                                año: digitsOnly
                              }));
                            }
                          }}
                          pattern="[0-9]\d{3}"
                          inputMode="numeric"
                          autoComplete="off"
                          required
                          placeholder={new Date().getFullYear()}
                          minLength="4"
                          maxLength="4"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Marca</label>
                        <input type="text" name="marca" value={formData.marca || ''} onChange={handleFormChange} autoComplete="off" required />
                      </div>
                      <div className="form-group">
                        <label>Modelo</label>
                        <input type="text" name="modelo" value={formData.modelo || ''} onChange={handleFormChange} autoComplete="off" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Color</label>
                        <input type="text" name="color" value={formData.color || ''} onChange={handleFormChange} autoComplete="off" required />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn-submit btn-full"
                      disabled={!formData.placa || !formData.marca || !formData.modelo || !formData.color || !formData.año || formData.año.length !== 4}
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
                      onClick={() => {
                        const currentTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                        const isGanado = currentTxType?.type?.toLowerCase() === 'ganado';
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          transactionType: 'add',
                          transactionTypeId: isGanado ? prev.transactionTypeId : '',
                          rewardId: ''
                        }));
                      }}
                    >
                      <FaPlus /> Agregar Puntos
                    </button>
                    <button 
                      type="button"
                      className={`type-btn remove ${formData.transactionType === 'remove' ? 'active' : ''}`}
                      onClick={() => {
                        const currentTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                        const isGanado = currentTxType?.type?.toLowerCase() === 'ganado';
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          transactionType: 'remove',
                          transactionTypeId: isGanado ? '' : prev.transactionTypeId,
                          rewardId: ''
                        }));
                      }}
                    >
                      <FaMinus /> Quitar Puntos
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Categoría de transacción</label>
                  <select 
                    name="transactionTypeId" 
                    value={formData.transactionTypeId || ''} 
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        transactionTypeId: e.target.value, 
                        rewardId: '', 
                        pointsAmount: '' 
                      }));
                    }}
                    required
                    disabled={loadingTransactionTypes}
                  >
                    <option value="">{loadingTransactionTypes ? 'Cargando...' : 'Seleccione una categoría'}</option>
                    {transactionTypes
                      .filter(txType => {
                        if (formData.transactionType === 'add') {
                          return txType.type.toLowerCase() === 'ganado';
                        }
                        if (formData.transactionType === 'remove') {
                          return txType.type.toLowerCase() !== 'ganado';
                        }
                        return true;
                      })
                      .map(txType => (
                        <option key={txType.id} value={txType.id}>
                          {txType.type}
                        </option>
                      ))}
                  </select>
                </div>
                
                {(() => {
                  const selectedTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                  const categoryName = selectedTxType?.type?.toLowerCase() || '';
                  const isAjuste = categoryName === 'ajuste' || categoryName === 'ajust';
                  
                  return isAjuste ? (
                    <Alert
                      variant="warning"
                      message={`Este modo (${selectedTxType.type}) debe usarse únicamente para corrección de puntos y no para agregar nuevos puntos o canjear recompensas.`}
                      dismissible={false}
                    />
                  ) : null;
                })()}
                
                <div className="form-group">
                  {(() => {
                    const selectedTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                    const isCanje = selectedTxType?.type?.toLowerCase() === 'canje';
                    
                    return (
                      <>
                        <label>
                          Recompensa asociada
                          {isCanje ? <span style={{ color: 'red' }}> *</span> : ' (opcional)'}
                        </label>
                        <select 
                          name="rewardId" 
                          value={formData.rewardId || ''} 
                          onChange={(e) => {
                            const selectedRewardId = e.target.value;
                            const selectedReward = rewards.find(r => r.id === parseInt(selectedRewardId));
                            
                            if (!selectedRewardId) {
                              setFormData(prev => ({ ...prev, rewardId: '', pointsAmount: '' }));
                            } else if (isCanje && selectedReward) {
                              setFormData(prev => ({ 
                                ...prev, 
                                rewardId: selectedRewardId,
                                pointsAmount: selectedReward.pointsRequired?.toString() || ''
                              }));
                            } else {
                              setFormData(prev => ({ ...prev, rewardId: selectedRewardId }));
                            }
                          }}
                          disabled={formData.transactionType === 'add'}
                          required={isCanje}
                        >
                          {formData.transactionType === 'add' ? (
                            <option value="">Recompensas no disponibles</option>
                          ) : (
                            <>
                              <option value="">{isCanje ? 'Seleccione una recompensa' : 'Ninguna - No aplica'}</option>
                              {(() => {
                                const userMembershipId = editingItem._original?.membership_id;
                                
                                return rewards
                                  .filter(reward => {
                                    if (!reward.available || !userMembershipId) return false;
                                    const rewardMembershipIds = reward._original?.memberships || [];
                                    return rewardMembershipIds.includes(userMembershipId);
                                  })
                                  .map(reward => (
                                    <option key={reward.id} value={reward.id}>
                                      {reward.title} - {(reward.pointsRequired || 0).toLocaleString()} pts ({reward.category})
                                    </option>
                                  ));
                              })()}
                            </>
                          )}
                        </select>
                      </>
                    );
                  })()}
                </div>
                <div className="form-group">
                  {(() => {
                    const selectedTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                    const isCanje = selectedTxType?.type?.toLowerCase() === 'canje';
                    const isDisabled = isCanje && formData.rewardId;
                    
                    return (
                      <>
                        <label>Cantidad de puntos</label>
                        <input 
                          type="text" 
                          name="pointsAmount" 
                          value={formData.pointsAmount || ''} 
                          onChange={(e) => {
                            if (isDisabled) return;
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                              setFormData(prev => ({ ...prev, pointsAmount: val }));
                            }
                          }}
                          autoComplete="off"
                          required 
                          placeholder="Ej: 100"
                          disabled={isDisabled}
                          style={isDisabled ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                        />
                        {isDisabled && (
                          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                            Los puntos se establecen automáticamente según la recompensa seleccionada.
                          </small>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="form-group">
                  <label>Razón / Descripción</label>
                  <textarea 
                    name="reason" 
                    value={formData.reason || ''} 
                    onChange={handleFormChange}
                    placeholder="Ej: Canje de recompensa, Bonificación, etc."
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className={`btn-submit ${formData.transactionType === 'remove' ? 'btn-remove' : ''}`}
                    disabled={(() => {
                      const selectedTxType = transactionTypes.find(tx => tx.id === parseInt(formData.transactionTypeId));
                      const isCanje = selectedTxType?.type?.toLowerCase() === 'canje';
                      const requiresReward = isCanje && !formData.rewardId;
                      
                      return !formData.transactionType || 
                             !formData.transactionTypeId || 
                             !formData.pointsAmount || 
                             !formData.reason ||
                             requiresReward;
                    })()}
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
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title || ''} 
                    onChange={handleFormChange} 
                    autoComplete="off" 
                    required 
                    maxLength={100}
                  />
                  <div className="char-counter">
                    <span className={((formData.title || '').length > 90) ? 'char-counter-warning' : ''}>
                      {(formData.title || '').length} / 100
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleFormChange} 
                    autoComplete="off" 
                    required 
                    maxLength={255}
                  />
                  <div className="char-counter">
                    <span className={((formData.description || '').length > 240) ? 'char-counter-warning' : ''}>
                      {(formData.description || '').length} / 255
                    </span>
                  </div>
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
                          autoComplete="off"
                          required 
                        />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select 
                    name="category" 
                    value={formData.category || ''} 
                    onChange={handleFormChange}
                    required
                    disabled={loadingRewardTypes}
                  >
                    <option value="">{loadingRewardTypes ? 'Cargando...' : 'Seleccione una categoría'}</option>
                    {rewardTypes.map(rewardType => (
                      <option key={rewardType.id} value={rewardType.id}>
                        {rewardType.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Membresías que pueden ver esta recompensa</label>
                  <div className="memberships-checkboxes">
                    {loadingMemberships ? (
                      <p>Cargando membresías...</p>
                    ) : (
                      memberships.map(membership => (
                        <label key={membership.id} className={`membership-checkbox ${membership.name.toLowerCase()}`}>
                          <input 
                            type="checkbox" 
                            checked={(formData.memberships || []).includes(membership.id)}
                            onChange={(e) => {
                              const membershipId = membership.id;
                              const current = formData.memberships || [];
                              const updated = e.target.checked 
                                ? [...current, membershipId]
                                : current.filter(x => x !== membershipId);
                              setFormData(prev => ({ ...prev, memberships: updated }));
                            }}
                          />
                          {membership.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Imagen de la recompensa</label>
                  <div className="image-upload-inline">
                    {(() => {
                      // Show preview from stored preview URL if available, otherwise show existing imageUrl
                      const previewUrl = formData.imagePreviewUrl || formData.imageUrl;
                      
                      return previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="image-preview-small" />
                      ) : (
                        <div className="no-image-small">
                          <FaImage />
                        </div>
                      );
                    })()}
                    <label className="btn-upload-inline">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            showWarning('Por favor seleccione un archivo de imagen válido.');
                            return;
                          }
                          
                          // Revoke previous preview URL if it was a blob
                          if (formData.imagePreviewUrl && formData.imagePreviewUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.imagePreviewUrl);
                          }
                          
                          // Store file and create preview URL
                          const previewUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ 
                            ...prev, 
                            imageFile: file,
                            imagePreviewUrl: previewUrl
                          }));
                        }}
                        hidden
                      />
                      <FaImage /> {formData.imageFile || formData.imageUrl ? 'Cambiar' : 'Subir imagen'}
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
                    disabled={!formData.title || !formData.description || !formData.pointsRequired || !formData.category || !(formData.memberships || []).length || (!formData.imageFile && !formData.imageUrl)}
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
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title || ''} 
                    onChange={handleFormChange} 
                    autoComplete="off" 
                    required 
                    maxLength={100}
                  />
                  <div className="char-counter">
                    <span className={((formData.title || '').length > 90) ? 'char-counter-warning' : ''}>
                      {(formData.title || '').length} / 100
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleFormChange} 
                    autoComplete="off" 
                    required 
                    maxLength={255}
                  />
                  <div className="char-counter">
                    <span className={((formData.description || '').length > 240) ? 'char-counter-warning' : ''}>
                      {(formData.description || '').length} / 255
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Válido hasta (opcional)</label>
                  <input type="date" name="validUntil" value={formData.validUntil || ''} onChange={handleFormChange} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Imagen de la promoción</label>
                  <div className="image-upload-inline">
                    {(() => {
                      // Show preview from stored preview URL if available, otherwise show existing imageUrl
                      const previewUrl = formData.imagePreviewUrl || formData.imageUrl;
                      
                      return previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="image-preview-small" />
                      ) : (
                        <div className="no-image-small">
                          <FaImage />
                        </div>
                      );
                    })()}
                    <label className="btn-upload-inline">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            showWarning('Por favor seleccione un archivo de imagen válido.');
                            return;
                          }
                          
                          // Revoke previous preview URL if it was a blob
                          if (formData.imagePreviewUrl && formData.imagePreviewUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(formData.imagePreviewUrl);
                          }
                          
                          // Store file and create preview URL
                          const previewUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ 
                            ...prev, 
                            imageFile: file,
                            imagePreviewUrl: previewUrl
                          }));
                        }}
                        hidden
                      />
                      <FaImage /> {formData.imageFile || formData.imageUrl ? 'Cambiar' : 'Subir imagen'}
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={!formData.title || !formData.description || (!formData.imageFile && !formData.imageUrl)}
                  >
                    <FaCheck /> {editingItem ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </>
          )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="manager-dashboard">
      <header className="manager-header">
        <div className="header-left">
          <img src={logoImage} alt="Grupo FJ Logo" className="header-logo" />
          <h1>AUTOVIP Panel de Administración</h1>
        </div>
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
                autoComplete="off"
              />
              <input 
                type="text" 
                placeholder="Filtrar por tarjeta..." 
                value={cardNumberFilter}
                onChange={(e) => setCardNumberFilter(e.target.value)}
                className="filter-input"
                autoComplete="off"
              />
              <input 
                type="text" 
                placeholder="Filtrar por RUC/C.I...." 
                value={rucCiFilter}
                onChange={(e) => setRucCiFilter(e.target.value)}
                className="filter-input"
                autoComplete="off"
              />
              <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
                <option value="all">Todas las membresías</option>
                {memberships.map(membership => (
                  <option key={membership.id} value={membership.name.toLowerCase()}>
                    {membership.name}
                  </option>
                ))}
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
                autoComplete="off"
              />
              <input 
                type="text" 
                placeholder="Filtrar por descripción..." 
                value={rewardDescriptionFilter}
                onChange={(e) => setRewardDescriptionFilter(e.target.value)}
                className="filter-input"
                autoComplete="off"
              />
              <select value={rewardCategoryFilter} onChange={(e) => setRewardCategoryFilter(e.target.value)}>
                <option value="all">Todas las categorías</option>
                {rewardTypes.map(rewardType => (
                  <option key={rewardType.id} value={rewardType.type}>
                    {rewardType.type}
                  </option>
                ))}
              </select>
              <select value={rewardAvailabilityFilter} onChange={(e) => setRewardAvailabilityFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">No disponibles</option>
              </select>
              <select value={rewardMembershipFilter} onChange={(e) => setRewardMembershipFilter(e.target.value)}>
                <option value="all">Todas las membresías</option>
                {memberships.map(membership => (
                  <option key={membership.id} value={membership.name.toLowerCase()}>
                    {membership.name}
                  </option>
                ))}
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
              <input 
                type="text" 
                placeholder="Filtrar por título..." 
                value={promoTitleFilter}
                onChange={(e) => setPromoTitleFilter(e.target.value)}
                className="filter-input"
                autoComplete="off"
              />
              <input 
                type="text" 
                placeholder="Filtrar por descripción..." 
                value={promoDescriptionFilter}
                onChange={(e) => setPromoDescriptionFilter(e.target.value)}
                className="filter-input"
                autoComplete="off"
              />
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  position: 'absolute', 
                  top: '-18px', 
                  left: '0', 
                  fontSize: '0.85rem', 
                  color: '#666', 
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>Desde</label>
                <input 
                  type="date" 
                  placeholder="Desde..." 
                  value={promoDesdeFilter}
                  onChange={(e) => setPromoDesdeFilter(e.target.value)}
                  className="filter-input"
                  autoComplete="off"
                />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  position: 'absolute', 
                  top: '-18px', 
                  left: '0', 
                  fontSize: '0.85rem', 
                  color: '#666', 
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>Hasta</label>
                <input 
                  type="date" 
                  placeholder="Hasta..." 
                  value={promoHastaFilter}
                  onChange={(e) => setPromoHastaFilter(e.target.value)}
                  className="filter-input"
                  autoComplete="off"
                />
              </div>
              <select value={promoExpiredFilter} onChange={(e) => setPromoExpiredFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="valid">Válidas</option>
                <option value="expired">Expiradas</option>
                <option value="na">N/A</option>
              </select>
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setPromoTitleFilter('');
                  setPromoDescriptionFilter('');
                  setPromoDesdeFilter('');
                  setPromoHastaFilter('');
                  setPromoExpiredFilter('all');
                }}
              >
                <FaTimes /> Limpiar filtros
              </button>
            </>
          )}
        </div>

        {activeTab === 'users' && (
          <div className="data-table">
            {loadingUsers ? (
              <Loading message="Cargando usuarios..." />
            ) : (
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
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
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
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="data-table">
            {loadingRewards ? (
              <Loading message="Cargando recompensas..." />
            ) : (
              <table className="rewards-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Puntos</th>
                    <th>Categoría</th>
                    <th>Membresías</th>
                    <th className="rewards-estado-col">Estado</th>
                    <th><FaCog /> Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRewards.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron recompensas
                      </td>
                    </tr>
                  ) : (
                    filteredRewards.map(reward => (
                  <tr key={reward.id}>
                    <td>
                      <div className="reward-image-cell">
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
                    <td>{(reward.pointsRequired || 0).toLocaleString()}</td>
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
                      <button className="btn-edit" onClick={() => openModal('reward', reward)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete('reward', reward.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="data-table">
            {loadingPromotions ? (
              <Loading message="Cargando promociones..." />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Válido hasta</th>
                    <th><FaCog /> Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron promociones
                      </td>
                    </tr>
                  ) : (
                    filteredPromotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="reward-image-cell">
                        {promo.imageUrl ? (
                          <img src={promo.imageUrl} alt={promo.title} className="reward-thumbnail" />
                        ) : (
                          <div className="no-image-placeholder">
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td><strong>{promo.title}</strong></td>
                    <td>{promo.description}</td>
                    <td>{promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('es-ES') : 'N/A'}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openModal('promotion', promo)} title="Editar">
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete('promotion', promo.id)} title="Eliminar">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {renderModal()}

      {/* Image Modal */}
      {showImageModal && imageModalItem && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content image-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}><FaTimes /></button>
            <div className="modal-content-inner">
            <h3><FaImage /> Imagen de {imageModalType === 'reward' ? 'Recompensa' : 'Promoción'}</h3>
            <p className="modal-subtitle">{imageModalItem.title}</p>
            
            <div className="image-preview-container">
              {imageModalItem.imageUrl ? (
                <img src={imageModalItem.imageUrl} alt={imageModalItem.title} className="image-preview" />
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
                <FaImage /> {uploadingImage ? 'Subiendo...' : (imageModalItem.imageUrl ? 'Cambiar imagen' : 'Subir imagen')}
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeImageModal}>Cerrar</button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

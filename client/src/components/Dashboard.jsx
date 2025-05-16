import { useState, useEffect, useRef } from 'react';
import { fetchPlacas, fetchReport, logout } from '../services/user';
import PdfViewer from './PdfViewer';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaChevronDown } from 'react-icons/fa';

export default function Dashboard({setIsAuthenticated}) {
  const [placas, setPlacas] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlacas = async () => {
      try {
        const data = await fetchPlacas();
        setPlacas(data.placas);
      } catch (error) {
        console.error('Error loading plates:', error);
      }
    };
    loadPlacas();

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await fetchReport(selectedPlaca, startDate, endDate);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlacaSelect = (placa) => {
    setSelectedPlaca(placa);
    setSearchTerm(placa);
    setDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      setSearchTerm(selectedPlaca);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputClick = (e) => {
    e.stopPropagation(); // Prevent the dropdown from closing when clicking input
    if (!dropdownOpen) {
      setDropdownOpen(true);
    }
  };

  const getFilteredPlacas = () => {
    if (!searchTerm) return placas;
    
    return placas.filter(item => 
      item.placa.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      // Sort by best match (starts with search term first)
      const aStartsWith = a.placa.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = b.placa.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort alphabetically
      return a.placa.localeCompare(b.placa);
    });
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false)
    navigate('/login');
  };


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Reporte Historial Mantenimiento</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="filter-container">
        <form onSubmit={handleSubmit}>
          <div className="filter-row">
            <div className="form-group">
              <label htmlFor="placa">Seleccione Placa:</label>
              <div className={`custom-select-container ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                <div 
                  className="custom-select-header"
                  onClick={handleToggleDropdown}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="custom-select-input"
                    placeholder="Seleccionar..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={handleInputClick}
                  />
                  <FaChevronDown className="dropdown-icon" />
                </div>
                {dropdownOpen && (
                  <div className="custom-select-options">
                    {getFilteredPlacas().length > 0 ? (
                      getFilteredPlacas().map((placa) => (
                        <div 
                          key={placa.placa} 
                          className={`custom-select-option ${selectedPlaca === placa.placa ? 'selected' : ''}`}
                          onClick={() => handlePlacaSelect(placa.placa)}
                        >
                          {placa.placa}
                        </div>
                      ))
                    ) : (
                      <div className="custom-select-no-results">
                        No se encontraron placas
                      </div>
                    )}
                  </div>
                )}
                <input 
                  type="hidden"
                  id="placa"
                  name="placa"
                  value={selectedPlaca}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="startDate">Fecha inicio:</label>
              <input 
                id="startDate" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">Fecha fin:</label>
              <input 
                id="endDate" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Generando...' : 'Generar PDF'}
          </button>
        </form>
      </div>
      
      {pdfUrl && <PdfViewer url={pdfUrl} />}
    </div>
  );
} 
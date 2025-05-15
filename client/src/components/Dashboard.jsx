import { useState, useEffect } from 'react';
import { fetchPlacas, fetchReport, logout } from '../services/user';
import PdfViewer from './PdfViewer';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard({setIsAuthenticated}) {
  const [placas, setPlacas] = useState([]);
  const [selectedPlaca, setSelectedPlaca] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
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
  }, []);

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
              <select 
                id="placa" 
                value={selectedPlaca} 
                onChange={(e) => setSelectedPlaca(e.target.value)}
                required
                className="form-select"
              >
                <option value="">Seleccionar...</option>
                {placas.map((placa) => (
                  <option key={placa.placa} value={placa.placa}>{placa.placa}</option>
                ))}
              </select>
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
import React, { useEffect, useState } from "react";
import { getHistorialData } from "../services/user";
import { Loading, NoData } from './TableStates';
import './InfoTableMobile.css';

const ReporteHistorialMobile = ({placa, startDate, endDate, codigo, descripcion}) => {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalHistorial, setOriginalHistorial] = useState([]);

  const getHistorial = async () => {
    if(!placa) {
        setIsLoading(false);
        return};
    try {
      setIsLoading(true);
      const data = await getHistorialData(placa, startDate, endDate);
      setHistorial(data.historial);
      setOriginalHistorial(data.historial);
    } catch (error) {
      console.error('Error fetching historial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTableCodigo = async() => {
    if (!codigo) {
      setHistorial(originalHistorial);
      return;
    }

    try {
      const regexPattern = new RegExp(codigo, 'i');
      const filteredData = originalHistorial.filter(row => 
        row.tipo.some(tipo => 
          tipo.tipoArray.some(item => 
            regexPattern.test(item.codigo)
          )
        )
      );
      setHistorial(filteredData);
    } catch (error) {
      console.error('Error filtering by codigo:', error);
    }
  }

  const filterTableDescripcion = async() => {
    if (!descripcion) {
      setHistorial(originalHistorial);
      return;
    }

    try {
      const regexPattern = new RegExp(descripcion, 'i');
      const filteredData = originalHistorial.filter(row => 
        row.tipo.some(tipo => 
          tipo.tipoArray.some(item => 
            regexPattern.test(item.detalle)
          )
        )
      );
      setHistorial(filteredData);
    } catch (error) {
      console.error('Error filtering by descripcion:', error);
    }
  }

  useEffect(() => {
    getHistorial();
  }, [placa, startDate, endDate]);

  useEffect(() => {
    filterTableCodigo();
  }, [codigo]);

  useEffect(() => {
    filterTableDescripcion();
  }, [descripcion]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <div className="reporte-container-mobile">
      <h2 className="reporte-title-mobile">REPORTE HISTORIAL MANTENIMIENTO</h2>

      <div className="mobile-cards-container">
        {isLoading ? (
          <Loading />
        ) : historial.length === 0 ? (
          <NoData />
        ) : (
          <div className="cards-wrapper">
            {historial.map((row, rowIndex) => (
              <div key={rowIndex} className="maintenance-card">
                {/* Header Information */}
                <div className="card-header">
                  <div className="header-row">
                    <div className="header-item">
                      <span className="label">FECHA:</span>
                      <span className="value">{formatDate(row.fecha)}</span>
                    </div>
                    <div className="header-item">
                      <span className="label">ORDEN:</span>
                      <span className="value">{row.orden}</span>
                    </div>
                  </div>
                  <div className="header-row">
                    <div className="header-item">
                      <span className="label">KM:</span>
                      <span className="value">{row.km}</span>
                    </div>
                    <div className="header-item">
                      <span className="label">ASESOR:</span>
                      <span className="value">{row.asesor}</span>
                    </div>
                  </div>
                </div>

                {/* Maintenance Items */}
                <div className="card-content">
                  {row.tipo.map((tipo, tipoIndex) => (
                    <div key={tipoIndex} className="maintenance-type">
                      <div className="type-header">
                        <span className="type-name">{tipo.tipoName}</span>
                      </div>
                      
                      <div className="maintenance-items">
                        {tipo.tipoArray.map((item, idx) => (
                          <div key={idx} className="maintenance-item">
                            <div className="item-row">
                              <div className="item-label">CANT:</div>
                              <div className="item-value">{item.cant}</div>
                            </div>
                            <div className="item-row">
                              <div className="item-label">CÓDIGO:</div>
                              <div className="item-value code">{item.codigo}</div>
                            </div>
                            <div className="item-row description">
                              <div className="item-label">DESCRIPCIÓN:</div>
                              <div className="item-value">{item.detalle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="footer-mobile">
        <span>Total de registros: {historial.length}</span>
      </div>
    </div>
  );
};

export default ReporteHistorialMobile;

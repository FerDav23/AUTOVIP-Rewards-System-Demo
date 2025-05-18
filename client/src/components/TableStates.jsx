import React from 'react';
import './TableStates.css';

export const NoData = () => {
  return (
    <div className="no-data-container">
      <div className="no-data-icon">📋</div>
      <h3>No hay datos disponibles</h3>
      <p>No se encontró historial de mantenimiento para los criterios seleccionados.</p>
    </div>
  );
};

export const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando datos...</p>
    </div>
  );
}; 
import React from 'react';
import './TableStates.css';
import LoadingComponent from './Loading';

export const NoData = () => {
  return (
    <div className="no-data-container">
      <div className="no-data-icon">📋</div>
      <h3>No hay datos disponibles</h3>
      <p>No se encontró historial de mantenimiento para los criterios seleccionados.</p>
    </div>
  );
};

// Re-export the new Loading component for backward compatibility
export const Loading = () => {
  return <LoadingComponent message="Cargando datos..." size="medium" />;
}; 
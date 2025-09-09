import React, { useEffect, useState } from "react";
import { getHistorialData } from "../services/user";
import { Loading, NoData } from './TableStates';
import './InfoTable.css';

const ReporteHistorial = ({placa, startDate, endDate, codigo, descripcion}) => {
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
      setHistorial(originalHistorial); // Reset to original data if no codigo filter
      return;
    }

    try {
      const regexPattern = new RegExp(codigo, 'i'); // Case insensitive search
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
      setHistorial(originalHistorial); // Reset to original data if no descripcion filter
      return;
    }

    try {
      const regexPattern = new RegExp(descripcion, 'i'); // Case insensitive search
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

  return (
    <div className="reporte-container">
      <h2 className="reporte-title">REPORTE HISTORIAL MANTENIMIENTO</h2>

      <div className="table-container">
        {isLoading ? (
          <Loading />
        ) : historial.length === 0 ? (
          <NoData />
        ) : (
          <table className="historial-table">
            <thead style={{color: 'white', textAlign: 'center'}}>
              <tr>
                <th>FECHA</th>
                <th>ORDEN</th>
                <th>KM</th>
                <th>ASESOR</th>
                <th>TIPO</th>
                <th>CANT</th>
                <th>CODIGO</th>
                <th>DESCRIPCIÓN DE MANTENIMIENTO</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((row, rowIndex) => (
                row.tipo.map((tipo, tipoIndex) => (
                  tipo.tipoArray.map((item, idx) => (
                    <tr key={`${rowIndex}-${tipoIndex}-${idx}`}>
                      {idx === 0 && tipoIndex === 0 && (
                        <>
                          <td rowSpan={row.CANTTotal}>{row.fecha ? row.fecha.split('T')[0] : ''}</td>
                          <td rowSpan={row.CANTTotal}>{row.orden}</td>
                          <td rowSpan={row.CANTTotal}>{row.km}</td>
                          <td rowSpan={row.CANTTotal}>{row.asesor}</td>
                        </>
                      )}
                      {idx === 0 && (
                        <td rowSpan={tipo.CANT}>{tipo.tipoName}</td>
                      )}
                      <td>{item.cant}</td>
                      <td>{item.codigo}</td>
                      <td>{item.detalle}</td>
                    </tr>
                  ))
                ))
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="footer">
        {/* Footer content if needed */}
      </div>
    </div>
  );
};

export default ReporteHistorial;

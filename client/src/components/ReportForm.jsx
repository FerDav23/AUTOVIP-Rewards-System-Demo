import { useState } from 'react';
import { fetchReport } from '../services/api';

export default function ReportForm({ onPdf }) {
  const [placa, setPlaca] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await fetchReport(placa);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      onPdf(url);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error al generar el reporte. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={placa}
        onChange={e => setPlaca(e.target.value)}
        placeholder="Placa"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Generando...' : 'Generar PDF'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </form>
  );
}

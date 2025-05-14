import { useState } from 'react';
import { fetchReport } from '../services/api';

export default function ReportForm({ onPdf }) {
  const [placa, setPlaca] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    const { data } = await fetchReport(placa);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    onPdf(url);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={placa}
        onChange={e => setPlaca(e.target.value)}
        placeholder="Placa"
        required
      />
      <button type="submit">Generar PDF</button>
    </form>
  );
}

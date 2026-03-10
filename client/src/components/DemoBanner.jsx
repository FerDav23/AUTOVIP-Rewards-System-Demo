import './DemoBanner.css';

export default function DemoBanner() {
  return (
    <div className="demo-banner" role="status" aria-live="polite">
      Demo mode – simulated data only.
    </div>
  );
}
export default function PdfViewer({ url }) {
    if (!url) return null;
    return (
      <div className="pdf-container">
        <h3 className="pdf-title">Vista previa del reporte</h3>
        <iframe
          src={url}
          className="pdf-frame"
          title="Reporte PDF"
        />
      </div>
    );
  }
  
export default function PdfViewer({ url }) {
    if (!url) return null;
    return (
      <iframe
        src={url}
        width="100%"
        height="600px"
        title="Reporte PDF"
      />
    );
  }
  
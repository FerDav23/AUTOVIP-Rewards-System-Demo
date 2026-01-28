import React from 'react';
import logger from '../utils/logger';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service
    logger.error('[ErrorBoundary] Caught an error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
    });

    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry)
      // errorTrackingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Optionally reload the page to ensure clean state
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">⚠️</div>
            <h1 className="error-boundary-title">
              Algo salió mal
            </h1>
            <p className="error-boundary-message">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intente recargar la página.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary-details">
                <summary>Detalles del error (solo en desarrollo)</summary>
                <pre className="error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-boundary-actions">
              <button 
                onClick={this.handleReset}
                className="error-boundary-button error-boundary-button-primary"
              >
                Intentar de nuevo
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="error-boundary-button error-boundary-button-secondary"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

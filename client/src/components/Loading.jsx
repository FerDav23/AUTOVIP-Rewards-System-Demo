import React from 'react';
import Lottie from 'lottie-react';
import carServicesAnimation from '../assets/Car Services.json';
import './Loading.css';

/**
 * Loading Component
 * A reusable loading component using Lottie animation for all pages
 * 
 * @param {Object} props
 * @param {string} props.message - Optional custom loading message
 * @param {string} props.size - Size of the animation ('small', 'medium', 'large'). Default: 'medium'
 * @param {boolean} props.fullScreen - Whether to display as full screen overlay. Default: false
 */
const Loading = ({ 
  message = 'Cargando...', 
  size = 'medium',
  fullScreen = false 
}) => {
  const sizeMap = {
    small: 250,
    medium: 500,
    large: 700
  };

  const animationSize = sizeMap[size] || sizeMap.medium;

  const containerClass = fullScreen 
    ? 'loading-wrapper loading-fullscreen' 
    : 'loading-wrapper loading-overlay';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className="loading-animation" style={{ width: animationSize, height: animationSize }}>
          <Lottie 
            animationData={carServicesAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;

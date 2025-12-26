import React from 'react';

const HeroWithLogo = ({ children, showLogo = true, logoOpacity = 0.03 }) => {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elegant Logo Background */}
      {showLogo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          opacity: logoOpacity,
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <img 
            src="/mspn-logo.jpeg" 
            alt="" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'blur(2px)'
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default HeroWithLogo;

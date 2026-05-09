import React from 'react';

const BrandBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden bg-transparent ${className}`}>
      {/* Background layer removed - global background applied to body */}

      {/* Content Layer */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default BrandBackground;

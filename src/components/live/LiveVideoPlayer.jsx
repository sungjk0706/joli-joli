import React from 'react';
import { X, Maximize2, Radio } from 'lucide-react';

const LiveVideoPlayer = React.memo(({ 
  src = "/인스타.mp4", 
  isMuted, 
  isMiniMode, 
  onBack, 
  onMiniModeChange 
}) => {
  return (
    <div className="relative w-full h-full border-0 outline-none !border-none !outline-none">
      <video 
        key={src}
        className="w-full h-full object-cover bg-black border-0 outline-none" 
        autoPlay 
        muted={isMuted} 
        loop 
        playsInline 
        webkit-playsinline="true"
        preload="auto"
        src={src} 
        style={{ border: 'none !important', outline: 'none !important' }}
      />
      
    </div>
  );
});

export default LiveVideoPlayer;

import React from 'react';
import { X, Maximize2, Radio } from 'lucide-react';

const LiveVideoPlayer = ({ 
  src = "/인스타.mp4", 
  isMuted, 
  isMiniMode, 
  onBack, 
  onMiniModeChange 
}) => {
  return (
    <div className="relative w-full h-full">
      <video 
        key="joli-joli-original-video"
        className="w-full h-full object-cover bg-black" 
        autoPlay 
        muted={isMuted} 
        loop 
        playsInline 
        webkit-playsinline="true"
        preload="auto"
        src={src} 
      />
      
      {/* Mini Mode Controls Overlay */}
      {isMiniMode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <X size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMiniModeChange(false); }}
              className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <Maximize2 size={12} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
             <Radio size={8} /> LIVE
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideoPlayer;

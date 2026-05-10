import React from 'react';
import { Heart, HelpCircle, MessageCircle, Plus, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';

const LiveInteractionSidebar = ({ 
  isAdmin, 
  onLike, 
  isLiked, 
  likeCount, 
  onChatExpand, 
  onDetailOpen,
  onProductSheetOpen,
  onShowGuide
}) => {
  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5 pointer-events-auto mb-2">
      {isAdmin && (
        <button 
          onClick={onProductSheetOpen} 
          className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800 rounded-full flex items-center justify-center text-white shadow-xl"
        >
          <Radio size={24} sm:size={28} />
        </button>
      )}
      <div className="relative mb-2 cursor-pointer active:scale-95 transition-all group/logo" onClick={onDetailOpen}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-brand-pink/60 overflow-hidden shadow-[0_0_20px_rgba(255,107,157,0.4)] bg-white animate-pulse-subtle">
          <img src="/joli-joli-Logo.png" alt="Joli Joli" className="w-full h-full object-contain p-1 group-hover/logo:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <Plus size={12} sm:size={14} className="text-white font-bold" />
        </div>
      </div>
      <button onClick={onLike} className="flex flex-col items-center group">
        <div className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-200",
          isLiked ? "scale-125 bg-brand-pink/30" : "scale-100"
        )}>
          <Heart 
            size={26} 
            sm:size={30} 
            fill={isLiked ? "#FF6B9D" : "none"} 
            className={cn(
              "transition-all duration-200",
              isLiked ? "text-[#FF6B9D] scale-110" : "text-white scale-100"
            )} 
          />
        </div>
        <span className="text-white text-[11px] sm:text-[12px] font-bold mt-1 drop-shadow-md">{likeCount}</span>
      </button>
      <button 
        onClick={onShowGuide}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/20"
      >
        <HelpCircle size={24} sm:size={28} />
      </button>
      <button onClick={onChatExpand} className="w-12 h-12 sm:w-14 sm:h-14 bg-white/95 rounded-full flex items-center justify-center text-gray-900 shadow-xl active:scale-90 transition-all">
        <MessageCircle size={24} sm:size={28} fill="currentColor" className="opacity-80" />
      </button>
    </div>
  );
};

export default LiveInteractionSidebar;

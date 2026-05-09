import React from 'react';
import { Heart, HelpCircle, MessageCircle, Plus, Radio } from 'lucide-react';

const LiveInteractionSidebar = ({ 
  isAdmin, 
  onLike, 
  isLiked, 
  likeCount, 
  onChatExpand, 
  onDetailOpen,
  onProductSheetOpen
}) => {
  return (
    <div className="flex flex-col items-center gap-5 pointer-events-auto mb-2">
      {isAdmin && (
        <button 
          onClick={onProductSheetOpen} 
          className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl animate-pulse"
        >
          <Radio size={24} />
        </button>
      )}
      <div className="relative mb-2 cursor-pointer active:scale-95 transition-all" onClick={onDetailOpen}>
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-xl bg-white">
          <img src="/joli-joli-Logo.png" alt="Joli Joli" className="w-full h-full object-contain p-1" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <Plus size={12} className="text-white" />
        </div>
      </div>
      <button onClick={onLike} className="flex flex-col items-center group">
        <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-active:scale-90 transition-all">
          <Heart size={26} fill={isLiked ? "#FF6B9D" : "none"} className={isLiked ? "text-[#FF6B9D]" : "text-white"} />
        </div>
        <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">{likeCount}</span>
      </button>
      <button className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/20">
        <HelpCircle size={24} />
      </button>
      <button onClick={onChatExpand} className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center text-gray-900 shadow-xl active:scale-90 transition-all">
        <MessageCircle size={24} fill="currentColor" className="opacity-80" />
      </button>
    </div>
  );
};

export default LiveInteractionSidebar;

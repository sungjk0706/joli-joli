import React from 'react';
import { ChevronDown, MoreVertical, Volume2, VolumeX } from 'lucide-react';

const LiveHeader = ({ 
  activeProduct, 
  isMuted, 
  setIsMuted, 
  onMiniModeChange, 
  viewMode 
}) => {
  return (
    <div className={`absolute left-0 right-0 z-[70] flex flex-col px-4 transition-all duration-500 ${viewMode === 'landscape-full' ? 'top-4' : 'top-5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-1">
            <div className="bg-red-600 px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-md">
              <span className="text-white text-[9px] font-black uppercase">LIVE</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-sm flex items-center border border-white/10">
              <span className="text-white text-[11px] font-bold opacity-90">1,291 시청</span>
            </div>
          </div>
          <h2 className="text-white text-[17px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1.5 tracking-tight mt-0.5">
            ✨ {activeProduct?.name || '졸리졸리 라이브 컬렉션'} 💥
          </h2>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold mt-0.5">
            <span>100cm</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>SIZE 100</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>모델 착용</span>
          </div>
          <button className="mt-2 w-fit bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-[11px] font-bold hover:bg-white/20 transition-all shadow-xl group">
            <div className="w-4 h-4 bg-brand-pink rounded-full flex items-center justify-center text-[10px] group-hover:scale-110 transition-all">%</div>
            혜택 보기
            <ChevronDown size={14} className="opacity-60" />
          </button>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button className="w-9 h-9 flex items-center justify-center text-white/90 hover:bg-white/10 rounded-full transition-all">
            <MoreVertical size={20} />
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 flex items-center justify-center text-white/90 hover:bg-white/10 rounded-full transition-all">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={() => onMiniModeChange(true)} className="w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
            <ChevronDown size={22} className="opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveHeader;

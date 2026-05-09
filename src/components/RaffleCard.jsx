import React, { useState } from 'react';
import { Trophy, Users, Clock, Gift, CheckCircle, X } from 'lucide-react';

const RaffleCard = ({ raffle, onEnter, showAlert, customerPhone, customerName }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const now = new Date();
  const startTime = new Date(raffle.start_time);
  const endTime = new Date(raffle.end_time);
  const isActive = raffle.is_active && !raffle.is_completed && now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;
  const isEnded = now > endTime || raffle.is_completed;

  const handleEnter = async () => {
    if (!customerPhone || !customerName) {
      showAlert('참여 불가', '추첨에 참여하려면 먼저 연락처를 입력해주세요.', 'info');
      return;
    }

    setIsEntering(true);
    try {
      await onEnter(raffle.id, customerPhone, customerName);
      setHasEntered(true);
      showAlert('참여 완료', '추첨에 참여했습니다! 당첨 발표를 기다려주세요. 🎉', 'success');
    } catch (error) {
      showAlert('참여 실패', error.message, 'error');
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50 border border-gray-50 overflow-hidden relative animate-fade-in">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink-light/30 rounded-full blur-2xl -mr-16 -mt-16" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-pink-dark">
            <Trophy size={18} />
            <span className="text-[10px] font-black tracking-widest uppercase">GIVEAWAY EVENT</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{raffle.title}</h3>
        </div>
        
        {isActive && (
          <span className="bg-brand-pink-dark text-brand-pink-contrast px-3 py-1 rounded-full text-[10px] font-black tracking-tighter animate-pulse">
            LIVE NOW
          </span>
        )}
        {isUpcoming && (
          <span className="bg-brand-blue-light text-brand-blue-dark px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">
            UPCOMING
          </span>
        )}
        {isEnded && (
          <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">
            ENDED
          </span>
        )}
      </div>

      {raffle.description && (
        <p className="text-gray-500 text-sm mb-5 font-medium leading-relaxed">{raffle.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
          <Clock size={14} className="text-brand-blue-dark" />
          <span>{new Date(raffle.end_time).toLocaleDateString('ko-KR')} 마감</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
          <Gift size={14} className="text-brand-pink-dark" />
          <span>{raffle.winner_count}명 추첨</span>
        </div>
      </div>

      <div className="relative z-10">
        {isActive && !hasEntered && (
          <button
            onClick={handleEnter}
            disabled={isEntering}
            className="w-full bg-brand-pink-dark text-brand-pink-contrast py-4 rounded-2xl font-black text-sm hover:bg-brand-pink transition-all shadow-lg shadow-brand-pink/20 active:scale-95 disabled:opacity-50"
          >
            {isEntering ? '참여 처리 중...' : '이벤트 참여하기'}
          </button>
        )}

        {hasEntered && (
          <div className="w-full bg-brand-pink-light text-brand-pink-dark py-4 rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 border border-brand-pink/10">
            <CheckCircle size={18} />
            <span>참여 완료되었습니다</span>
          </div>
        )}

        {isEnded && (
          <div className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-sm text-center flex items-center justify-center gap-2 border border-gray-100">
            <X size={18} />
            <span>종료된 이벤트입니다</span>
          </div>
        )}

        {isUpcoming && (
          <div className="w-full bg-brand-blue-light text-brand-blue-dark py-4 rounded-2xl font-black text-sm text-center border border-brand-blue/10">
            이벤트 시작 대기 중 ⏰
          </div>
        )}
      </div>
    </div>
  );
};

export default RaffleCard;


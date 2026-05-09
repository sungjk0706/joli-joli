import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

const FlashSaleTimer = ({ endTime, soldQuantity, totalQuantity }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  const remainingQuantity = totalQuantity - soldQuantity;
  const progressPercentage = totalQuantity > 0 ? (soldQuantity / totalQuantity) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-white animate-pulse" />
          <span className="text-white font-black text-sm sm:text-base">선참순 특가</span>
        </div>
        {isExpired ? (
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">종료됨</span>
        ) : (
          <div className="flex items-center gap-1 text-white">
            <Clock size={16} />
            <span className="font-bold text-xs sm:text-sm">
              {timeLeft.days > 0 && `${timeLeft.days}일 `}
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* 남은 수량 프로그레스 바 */}
      <div className="mb-2">
        <div className="flex justify-between text-white text-xs font-bold mb-1">
          <span>판매량: {soldQuantity}개</span>
          <span>남은 수량: {remainingQuantity}개</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {remainingQuantity <= 5 && remainingQuantity > 0 && (
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-center text-xs font-bold animate-pulse">
          ⚠️ 남은 수량 {remainingQuantity}개!
        </div>
      )}
    </div>
  );
};

export default FlashSaleTimer;

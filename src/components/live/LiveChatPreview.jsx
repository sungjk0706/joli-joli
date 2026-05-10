import React from 'react';

/**
 * LiveChatPreview - 라이브 화면 하단에 표시되는 실시간 채팅 미리보기
 */
const LiveChatPreview = ({ chatMessages = [] }) => {
  return (
    <div className="flex flex-col space-y-1 max-h-40 sm:max-h-48 overflow-hidden mask-gradient-top px-1 pointer-events-none mb-4 w-full max-w-[calc(100vw-100px)] sm:max-w-[calc(100vw-140px)] md:max-w-[calc(100vw-180px)]">
        {chatMessages.slice(-2).map((m, idx) => {
          if (m.type === 'system') {
            return (
              <div key={idx} className="flex gap-2 items-center animate-fade-in py-0.5">
                <div className="w-1.5 h-1.5 bg-brand-pink/60 rounded-full animate-pulse" />
                <span className="text-white/60 text-[13px] sm:text-[14px] font-medium drop-shadow-md italic">{m.text}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="flex gap-2 items-baseline animate-fade-in">
              <span className="text-white/90 font-black text-[14px] sm:text-[15px] md:text-[16px] whitespace-nowrap drop-shadow-md">{m.user}</span>
              <span className="text-white text-[16px] sm:text-[17px] md:text-[18px] font-bold drop-shadow-lg truncate">{m.text}</span>
            </div>
          );
        })}
    </div>
  );
};

export default LiveChatPreview;

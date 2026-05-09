import React, { useRef, useEffect } from 'react';
import { X, ChevronDown, Send } from 'lucide-react';

const ChatSection = ({
  messages, message, setMessage, onSend,
  isLandscape = false, isExpanded, setIsExpanded,
  isAdmin = false,
  leftAddon = null,
  productList = [],
  onProductClick = null
}) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isExpanded]);

  const displayMessages = (isExpanded || isLandscape) ? messages.slice(-50) : [];

  return (
    <div className={`flex flex-col transition-all duration-500 ease-in-out w-full h-full`}>
      
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4 scroll-smooth no-scrollbar" ref={scrollRef}>
        {displayMessages.map((m, idx) => (
          <div key={idx} className="flex flex-col animate-fade-in max-w-[85%]">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.isAdmin ? 'bg-red-500 text-white' : 'bg-white/20 text-white/90 uppercase'}`}>
                {m.isAdmin ? 'ADMIN' : 'User'}
              </span>
              <span className="text-white/70 font-bold text-xs">{m.user}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-none px-4 py-3 w-fit border border-white/5 shadow-sm">
              <p className="text-white font-medium text-[14px] leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 pb-10 flex gap-3 items-center bg-transparent">
        {leftAddon}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all font-bold text-sm shadow-inner"
          />
          <button onClick={onSend} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-gray-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveChatSheet = ({ 
  isOpen, 
  onClose, 
  messages, 
  message, 
  setMessage, 
  onSend, 
  isAdmin, 
  productList, 
  onProductClick,
  isDesktopInline = false
}) => {
  if (!isOpen && !isDesktopInline) return null;

  // Inline mode for Desktop sidebar
  if (isDesktopInline) {
    return (
      <div className="flex-1 overflow-hidden">
        <ChatSection 
          messages={messages} 
          message={message} 
          setMessage={setMessage} 
          onSend={onSend} 
          isExpanded={true} 
          setIsExpanded={() => {}} 
          isAdmin={isAdmin} 
          productList={productList} 
          onProductClick={onProductClick} 
        />
      </div>
    );
  }

  // Standard Bottom Sheet for Mobile
  return (
    <div className="fixed inset-0 z-[2500] flex flex-col justify-end">
      {/* Backdrop for closing */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div className="relative z-[2600] w-full max-h-[75dvh] bg-black/40 backdrop-blur-xl rounded-t-[3rem] border-t border-white/20 animate-slide-up flex flex-col overflow-hidden">
        {/* Handle for dragging feel */}
        <div className="w-full py-4 flex flex-col items-center" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/30 rounded-full mb-4" />
          <div className="flex items-center justify-between w-full px-8">
            <span className="text-white font-black text-xl tracking-tight">실시간 채팅</span>
            <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatSection 
            messages={messages} 
            message={message} 
            setMessage={setMessage} 
            onSend={onSend} 
            isExpanded={true} 
            setIsExpanded={() => {}} 
            isAdmin={isAdmin} 
            productList={productList} 
            onProductClick={onProductClick} 
          />
        </div>
      </div>
    </div>
  );
};

export { ChatSection, LiveChatSheet };

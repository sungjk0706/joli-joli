import React, { useRef, useEffect } from 'react';
import { X, ChevronDown, Send } from 'lucide-react';
import { cn } from '../../utils/cn';

const ChatSection = ({
  messages, message, setMessage, onSend,
  isLandscape = false, isExpanded, setIsExpanded,
  isAdmin = false,
  leftAddon = null,
  productList = [],
  onProductClick = null,
  scrollTrigger = 0
}) => {
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSend();
    // 전송 후 바로 다시 포커스를 주어 키보드 유지를 시도함
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length, isExpanded, scrollTrigger]);

  const displayMessages = (isExpanded || isLandscape) ? messages.slice(-50) : [];

  return (
    <div className={`flex flex-col transition-all duration-500 ease-in-out w-full h-full`}>
      
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 space-y-4 scroll-smooth no-scrollbar" ref={scrollRef}>
        {displayMessages.map((m, idx) => (
          <div key={idx} className="flex flex-col animate-fade-in max-w-[90%] mb-2">
            <div className="flex flex-col items-center gap-1.5">
              <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white/70 font-black text-[13px] sm:text-[14px] tracking-tight border border-white/10 shadow-sm w-fit">
                {m.user}
              </span>
              <div className="bg-black/60 backdrop-blur-lg rounded-2xl px-4 sm:px-5 py-2 sm:py-2.5 border border-white/10 shadow-lg w-fit max-w-full">
                <p className="text-white font-bold text-[14px] sm:text-[15px] leading-relaxed text-center">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>
      <div className="p-4 pb-8 flex gap-3 items-center bg-transparent">
        {leftAddon}
        <form 
          className="flex-1 relative" 
          autoComplete="off" 
          onSubmit={handleFormSubmit}
        >
          <input
            ref={inputRef}
            type="search"
            name="joli_chat_message_field"
            id="joli_chat_input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-full bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all font-bold text-sm shadow-xl appearance-none"
          />
          <button 
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 bg-white text-gray-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <Send size={18} sm:size={20} />
          </button>
        </form>
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
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const vh = window.innerHeight;
      const vvh = window.visualViewport.height;
      const offset = vh - vvh;
      setKeyboardHeight(Math.max(0, offset));
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize(); // Initial check

    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [isClosing, setIsClosing] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender && !isDesktopInline) return null;

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
          scrollTrigger={keyboardHeight}
        />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[7500] flex flex-col justify-end transform-gpu transition-all duration-500 ease-in-out",
        isClosing ? "pointer-events-none" : "pointer-events-auto"
      )}
      style={{ 
        bottom: `${keyboardHeight}px`, 
        willChange: 'bottom'
      }}
    >
      {/* Backdrop for closing */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose} 
      />
      
      {/* Bottom Sheet - Subtle Gradient for Stability */}
      <div 
        className={cn(
          "relative z-[2600] w-full max-h-[75dvh] bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col overflow-hidden transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)",
          isOpen && !isClosing ? "animate-slide-up opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        )}
      >
        {/* Floating Header */}
        <div className="w-full py-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-6 sm:px-8">
            <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tight drop-shadow-lg">실시간 채팅</span>
            <button onClick={onClose} className="w-10 h-10 sm:w-11 sm:h-11 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all shadow-lg border border-white/10">
              <X size={20} sm:size={22} />
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
            scrollTrigger={keyboardHeight}
          />
        </div>
      </div>
    </div>
  );
};

export { ChatSection, LiveChatSheet };

import React, { useEffect } from 'react';
import { X, ShoppingBag, Send, User, MessageCircle, MoreHorizontal, Megaphone } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GlassIconButton } from '../ui/Common';

const ChatSection = ({ 
  messages, 
  message, 
  setMessage, 
  onSend, 
  isExpanded, 
  setIsExpanded,
  isAdmin,
  productList,
  onProductClick
}) => {
  const scrollRef = React.useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const pinnedMessage = [...messages].reverse().find(m => (m.isAdmin || m.role === 'admin') && m.type !== 'system');

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Pinned Message Area */}
      {pinnedMessage && (
        <div className="mx-4 mt-2 mb-1 animate-in fade-in slide-in-from-top-2 duration-500 sticky top-0 z-[20]">
          <div className="bg-brand-pink/20 backdrop-blur-xl border border-brand-pink/30 rounded-xl p-3 shadow-lg flex items-start gap-3">
            <div className="bg-brand-pink text-white p-1.5 rounded-lg shadow-inner">
              <Megaphone size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-brand-pink tracking-widest uppercase">Admin Notice</span>
              </div>
              <p className="text-[13px] sm:text-[14px] text-white font-bold leading-snug truncate">
                {pinnedMessage.text || pinnedMessage.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => {
          // 공지로 고정된 메시지는 본문 리스트에서 제외 (중복 방지)
          if (msg === pinnedMessage) return null;

          if (msg.type === 'system') {
            return (
              <div key={msg.id || idx} className="flex justify-center my-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white/5 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5 shadow-sm">
                  <span className="text-[10px] sm:text-[11px] text-white/50 font-medium tracking-tight">
                    {msg.text}
                  </span>
                </div>
              </div>
            );
          }

          const isMsgAdmin = msg.isAdmin || msg.role === 'admin';
          const nickname = msg.user || msg.nickname || (isMsgAdmin ? '매니저' : '고객');
          const content = msg.text || msg.content;

          return (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col",
                isMsgAdmin ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:text-base shadow-lg transition-all",
                isMsgAdmin 
                  ? "bg-brand-pink-dark/90 text-brand-pink-contrast rounded-tr-none border border-white/20" 
                  : "bg-black/60 backdrop-blur-md text-white rounded-tl-none border border-white/10 shadow-xl"
              )}>
                <div className="flex items-center gap-1.5 mb-1 opacity-70">
                  {isMsgAdmin ? <User size={10} /> : <MessageCircle size={10} />}
                  <span className="font-bold text-[11px] sm:text-[12px]">{nickname}</span>
                </div>
                <p className="leading-relaxed break-words whitespace-pre-wrap font-medium">{content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-4 pb-8 flex flex-col gap-3 bg-transparent">
        <div className="flex gap-2 px-1">
          {['💖', '✨', '👏'].map(emoji => (
            <button
              key={emoji}
              onClick={() => onSend(emoji)}
              className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-lg active:scale-90 transition-all hover:bg-white/20 shadow-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); onSend(); }}
          className="flex gap-3 items-center"
          autoComplete="off"
        >
          <input
            type="search"
            name="joli_live_chat_input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            autoComplete="off"
            inputMode="text"
            spellCheck="false"
            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all shadow-inner text-sm sm:text-base [appearance:none] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          <GlassIconButton 
            type="submit"
            disabled={!message.trim()}
            className={cn(
              "w-11 h-11 transition-all",
              message.trim() ? "bg-black/60 text-white border-white/20" : "opacity-40"
            )}
          >
            <Send size={18} />
          </GlassIconButton>
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

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[7500] flex flex-col justify-end pointer-events-none transition-opacity duration-300",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto",
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose} 
      />
      
      {/* Bottom Sheet */}
      <div 
        className={cn(
          "relative z-[2600] w-full max-h-[85%] bg-transparent flex flex-col overflow-hidden transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto will-change-transform",
          isOpen && !isClosing ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="w-full py-3 flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-6">
            <span className="text-white font-black text-lg drop-shadow-lg">실시간 채팅</span>
            <GlassIconButton onClick={onClose} title="닫기">
              <X size={20} />
            </GlassIconButton>
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

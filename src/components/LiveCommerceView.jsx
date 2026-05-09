import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';
import { configService } from '../services';

// Modularized Components
import LiveVideoPlayer from './live/LiveVideoPlayer';
import LiveHeader from './live/LiveHeader';
import LiveInteractionSidebar from './live/LiveInteractionSidebar';
import LiveProductCard from './live/LiveProductCard';
import { LiveChatSheet } from './live/LiveChatSheet';
import LiveProductPushSheet from './live/LiveProductPushSheet';
import LiveOrderSheet from './live/LiveOrderSheet';
import ProductDetailView from './ProductDetailView';

const LiveCommerceView = ({ 
  allProducts = [], 
  liveProductIds = [], 
  selectedProduct,
  onBack, 
  isAdmin = false,
  onPushToLive = () => {},
  isMiniMode = false,
  onMiniModeChange = () => {},
  shortformVideoUrl = "/인스타.mp4",
  config
}) => {
  // State management
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { user: 'joli_joli', text: '반갑습니다! 졸리졸리 라이브에 오신 것을 환영해요 💖', isAdmin: true },
    { user: '마이럽둥이', text: '어머 옷이 너무 귀여워요! 😍' },
    { user: '둥이엄마', text: '재질이 어떤가요?' }
  ]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1284);
  const [isMuted, setIsMuted] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({ customer_name: '', phone: '', address: '', detail_address: '', zonecode: '', options: '', paymentMethod: 'bank_transfer', quantity: 1, selectedOption: '', depositName: '', requests: '' });
  const [loading, setLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [currentUsername] = useState(() => localStorage.getItem('joli_user_name') || `익명_${Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    localStorage.setItem('joli_user_name', currentUsername);
  }, [currentUsername]);
  
  // Gesture State
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  // Data fetching & Realtime
  const likeSyncTimer = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. 설정 가져오기 (좋아요 수)
      const { data: likeConfig } = await supabase.from('configs').select('value').eq('key', 'live_like_count').maybeSingle();
      if (likeConfig) setLikeCount(parseInt(likeConfig.value) || 1284);

      // 2. 채팅 내역 가져오기 (최신 50개)
      const { data: chats } = await supabase.from('live_chat').select('*').order('created_at', { ascending: true }).limit(50);
      
      // 3. 차단 유저 목록 가져오기
      const bannedConfig = await configService.getByKey('banned_users');
      const bannedList = bannedConfig?.value ? bannedConfig.value.split(',').filter(Boolean) : [];
      setBannedUsers(bannedList);

      if (chats && chats.length > 0) {
        setChatMessages(chats.map(c => ({ user: c.user, text: c.text, isAdmin: c.is_admin })));
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const orderChannel = supabase.channel('live-realtime')
      // 주문 알림 구독
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (p) => {
        const n = { id: Date.now(), text: `${p.new.customer_name?.slice(0,1)}*${p.new.customer_name?.slice(-1)}님이 주문 완료! 🎉` };
        setNotifications(prev => [...prev, n]);
        setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3500);
      })
      // 좋아요 브로드캐스트 수신
      .on('broadcast', { event: 'like' }, (p) => {
        setLikeCount(prev => prev + 1);
        const newHeart = { id: Date.now(), left: p.payload.left };
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000);
      })
      // 채팅 브로드캐스트 수신
      .on('broadcast', { event: 'chat' }, (p) => {
        setChatMessages(prev => [...prev, p.payload]);
      })
      // 실시간 차단 업데이트 수신 (설정이 바뀌면 실시간 반영)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configs', filter: 'key=eq.banned_users' }, (p) => {
        const list = p.new.value ? p.new.value.split(',').filter(Boolean) : [];
        setBannedUsers(list);
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(orderChannel); 
      if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
      
      // 컴포넌트 언마운트 시 전체화면 해제 (미니모드 아닐 때만)
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    };
  }, []);

  // 라이브 화면 진입 시 전체화면 시도
  useEffect(() => {
    if (!isMiniMode) {
      const docElm = document.documentElement;
      // 브라우저 정책상 실패할 수 있으나 최대한 시도
      try {
        if (docElm.requestFullscreen) docElm.requestFullscreen().catch(() => {});
        else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
      } catch (e) {}
    }
  }, [isMiniMode]);

  // Handlers
  const handleTouchStart = (e) => {
    if (isMiniMode) return;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (isMiniMode || !isSwiping) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) setTouchDeltaY(deltaY);
  };

  const handleTouchEnd = () => {
    if (isMiniMode) return;
    setIsSwiping(false);
    if (touchDeltaY > 150) {
      onMiniModeChange(true);
    }
    setTouchDeltaY(0);
  };

  const handleClick = () => {
    if (isSwiping || touchDeltaY > 0) return;
    if (isMiniMode) {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) docElm.requestFullscreen();
      else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
      onMiniModeChange(false);
    }
  };
  const handleSend = async () => {
    if (!message.trim()) return;
    
    // 차단 여부 확인
    if (bannedUsers.includes(currentUsername)) {
      const n = { id: Date.now(), text: "채팅 권한이 제한되었습니다. 고객센터에 문의하세요." };
      setNotifications(prev => [...prev, n]);
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3000);
      setMessage('');
      return;
    }

    const newMsg = { user: isAdmin ? 'joli_joli' : currentUsername, text: message, isAdmin: isAdmin };
    
    // 1. 로컬 상태 업데이트
    setChatMessages(prev => [...prev, newMsg]);
    
    // 2. 다른 사용자에게 브로드캐스트
    supabase.channel('live-realtime').send({
      type: 'broadcast',
      event: 'chat',
      payload: newMsg
    });

    // 3. DB 저장 (백그라운드)
    supabase.from('live_chat').insert([{
      user: isAdmin ? 'joli_joli' : currentUsername,
      text: message,
      is_admin: isAdmin
    }]).then(({ error }) => error && console.error('채팅 저장 실패:', error));

    setMessage('');
  };

  const handleLike = () => {
    setIsLiked(true);
    const newCount = likeCount + 1;
    setLikeCount(newCount);
    
    const newHeart = { id: Date.now(), left: Math.random() * 80 + 10 };
    setHearts(prev => [...prev, newHeart]);

    // 1. 실시간 하트 애니메이션 브로드캐스트 (즉시)
    supabase.channel('live-realtime').send({
      type: 'broadcast',
      event: 'like',
      payload: { left: newHeart.left }
    });

    // 2. DB 동기화 (Debounce - 5초 동안 입력이 없으면 최종 count 저장)
    if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
    likeSyncTimer.current = setTimeout(async () => {
      await supabase.from('configs').upsert({ key: 'live_like_count', value: String(newCount) }, { onConflict: 'key' });
    }, 5000);

    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000);
  };

  const handleOrderSubmit = async (e, f, p) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.placeOrderTransaction({
        customer_name: f.customer_name,
        phone: f.phone,
        address: f.address,
        detail_address: f.detail_address,
        zonecode: f.zonecode,
        product_id: p.id,
        product_name: p.name,
        price: p.price,
        options: f.options,
        payment_method: f.paymentMethod || 'bank_transfer',
        quantity: f.quantity || 1,
        selected_option: f.selectedOption || '',
        deposit_name: f.depositName || f.customer_name,
        requests: f.requests || ''
      });
      
      const n = { id: Date.now(), text: "주문이 정상적으로 접수되었습니다! ✨" };
      setNotifications(prev => [...prev, n]);
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3000);
      setFormData({ customer_name: '', phone: '', address: '', detail_address: '', zonecode: '', options: '', paymentMethod: 'bank_transfer', quantity: 1, selectedOption: '', depositName: '', requests: '' });
      setIsSheetOpen(false);
    } catch (error) {
      const n = { id: Date.now(), text: error.message || "주문 중 오류가 발생했습니다." };
      setNotifications(prev => [...prev, n]);
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3000);
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    return allProducts.filter(p => liveProductIds?.includes(String(p.id)));
  }, [allProducts, liveProductIds]);

  const filteredChatMessages = useMemo(() => {
    return chatMessages.filter(m => !bannedUsers.includes(m.user));
  }, [chatMessages, bannedUsers]);

  const activeProduct = selectedProduct || (displayProducts?.length > 0 ? displayProducts[0] : allProducts?.[0]);

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[100] bg-black overflow-hidden select-none shadow-2xl transition-shadow duration-500 flex flex-col lg:flex-row ${
        isMiniMode ? 'cursor-pointer active:scale-95 z-[5000] ring-1 ring-white/20' : ''
      }`} 
      style={{ 
        willChange: 'top, right, width, height, border-radius', 
        top: isMiniMode ? 'calc(100dvh - 230px)' : `${touchDeltaY}px`,
        right: isMiniMode ? '20px' : '0',
        width: isMiniMode ? '120px' : '100%',
        height: isMiniMode ? '210px' : '100dvh',
        borderRadius: isMiniMode ? '24px' : '0',
        transition: isSwiping ? 'none' : 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', 
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overscrollBehavior: 'none',
        touchAction: 'none'
      }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Video Area */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* 1. Video Player */}
        <LiveVideoPlayer 
          src={config?.shortformVideoUrl || shortformVideoUrl}
          isMuted={isMuted} 
          isMiniMode={isMiniMode} 
          onBack={onBack} 
          onMiniModeChange={onMiniModeChange} 
        />

        {/* 2. Full Mode UI Components */}
        {!isMiniMode && (
          <>
            {/* Hearts Animation */}
            <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
              {hearts.map(h => (
                <div key={h.id} className="absolute bottom-20 text-brand-pink-accent animate-heart-fly" style={{ left: `${h.left}%` }}>
                  <Heart fill="currentColor" size={32} />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-20" />

            {/* Header */}
            <LiveHeader 
              activeProduct={activeProduct} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
              onMiniModeChange={onMiniModeChange} 
            />

            {/* Interaction Overlay (Mobile only or Desktop floating) */}
            <div className="absolute bottom-0 left-0 right-0 z-[60] flex flex-col pointer-events-none pb-4 lg:pb-10">
              <div className="flex items-end justify-between px-4 w-full">
                <LiveProductCard 
                  activeProduct={activeProduct} 
                  chatMessages={filteredChatMessages} 
                  onOrderOpen={() => setIsSheetOpen(true)} 
                />
                <LiveInteractionSidebar 
                  isAdmin={isAdmin} 
                  onLike={handleLike} 
                  isLiked={isLiked} 
                  likeCount={likeCount} 
                  onChatExpand={() => setIsChatExpanded(true)} 
                  onDetailOpen={() => setIsDetailOpen(true)}
                  onProductSheetOpen={() => setIsProductSheetOpen(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Chat Sidebar */}
      {!isMiniMode && (
        <div className="hidden lg:flex lg:w-[380px] xl:w-[450px] h-full bg-zinc-900 border-l border-white/10 flex-col overflow-hidden relative">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-black text-xl tracking-tight">실시간 대화</h3>
          </div>
          <LiveChatSheet 
            isOpen={true} 
            isDesktopInline={true}
            onClose={() => {}} 
            messages={filteredChatMessages} 
            message={message} 
            setMessage={setMessage} 
            onSend={handleSend} 
            isAdmin={isAdmin} 
            productList={displayProducts} 
            onProductClick={(p) => { setIsDetailOpen(true); }} 
          />
        </div>
      )}

      {/* 3. Sheets & Modals (Mobile specific or Global) */}
      {!isMiniMode && (
        <>
          {isDetailOpen && (
             <div className="fixed inset-0 z-[3000] bg-white flex flex-col animate-slide-up-full overflow-hidden">
                <ProductDetailView 
                  product={activeProduct} 
                  onClose={() => setIsDetailOpen(false)} 
                  onAddToCart={() => {}} 
                  showAlert={() => {}} 
                  config={config} 
                  onBuyNow={() => { setIsSheetOpen(true); setIsDetailOpen(false); }}
                />
             </div>
          )}

          <LiveProductPushSheet 
            isOpen={isProductSheetOpen} 
            onClose={() => setIsProductSheetOpen(false)} 
            allProducts={allProducts} 
            onPushToLive={onPushToLive} 
          />

          <LiveOrderSheet 
            isOpen={isSheetOpen} 
            onClose={() => setIsSheetOpen(false)} 
            activeProduct={activeProduct} 
            formData={formData} 
            setFormData={setFormData} 
            onSubmitOrder={handleOrderSubmit} 
            loading={loading} 
            config={config} 
            showAlert={() => {}} 
          />

          {/* Mobile Chat Sheet */}
          <div className="lg:hidden">
            <LiveChatSheet 
              isOpen={isChatExpanded} 
              onClose={() => setIsChatExpanded(false)} 
              messages={filteredChatMessages} 
              message={message} 
              setMessage={setMessage} 
              onSend={handleSend} 
              isAdmin={isAdmin} 
              productList={displayProducts} 
              onProductClick={(p) => { setIsDetailOpen(true); setIsChatExpanded(false); }} 
            />
          </div>
        </>
      )}

      {/* Global Notifications */}
      <div className="fixed top-24 left-4 right-4 z-[10000] pointer-events-none flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold animate-slide-in flex items-center gap-2 self-start border border-white/10">
            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
            {n.text}
          </div>
        ))}
      </div>

      <style>{`
        .mask-gradient-top { mask-image: linear-gradient(to top, black 80%, transparent 100%); }
        .text-gradient-pink { background: linear-gradient(to right, #FF6B9D, #FF9B9B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes heartFly {
          0% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
          100% { transform: translateY(-400px) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .animate-heart-fly { animation: heartFly 1.5s ease-out forwards; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up-full { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default LiveCommerceView;

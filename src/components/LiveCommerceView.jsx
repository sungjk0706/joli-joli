import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Maximize2, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { GlassIconButton } from './ui/Common';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';
import { configService } from '../services';

// Modularized Components
import LiveVideoPlayer from './live/LiveVideoPlayer';
import LiveHeader from './live/LiveHeader';
import LiveInteractionSidebar from './live/LiveInteractionSidebar';
import LiveProductDisplay from './live/LiveProductDisplay';
import LiveChatPreview from './live/LiveChatPreview';
import { LiveChatSheet } from './live/LiveChatSheet';
import LiveProductPushSheet from './live/LiveProductPushSheet';
import LiveOrderSheet from './live/LiveOrderSheet';
import ProductDetailView from './ProductDetailView';
import LiveProductListView from './live/LiveProductListView';

const LiveCommerceView = ({ 
  allProducts = [], 
  liveProductIds = [], 
  selectedProduct,
  onBack, 
  isAdmin = false,
  onPushToLive = () => {},
  isMiniMode = false,
  onMiniModeChange = () => {},
  shortformVideoUrl: initialShortformVideoUrl = "/인스타.mp4",
  config,
  setSelectedProduct,
  showAlert
}) => {
  // State management
  const [currentShortformVideoUrl, setCurrentShortformVideoUrl] = useState(config?.shortformVideoUrl || initialShortformVideoUrl);
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
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [currentUsername] = useState(() => localStorage.getItem('joli_user_name') || `익명_${Math.floor(Math.random() * 10000)}`);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0); // 수평 드래그용
  const initialMiniPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('joli_user_name', currentUsername);
  }, [currentUsername]);

  // config prop 변경 시 상태 동기화
  useEffect(() => {
    if (config) {
      if (config.shortformVideoUrl) setCurrentShortformVideoUrl(config.shortformVideoUrl);
      if (config.liveGuideInfo) setGuideInfo(config.liveGuideInfo);
    }
  }, [config]);
  
  // Gesture State
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [miniPos, setMiniPos] = useState({ x: 0, y: 0 }); // 미니 플레이어 자유 이동 좌표
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 화면 크기 변화 대응 (안전한 값 확보)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        // 키보드 활성화 시 높이값 변화 무시 (레이아웃 튐 방지)
        const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
        setViewportSize(prev => ({
          width: window.innerWidth,
          height: isInputFocused ? prev.height : window.innerHeight
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    // 초기 실행
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data fetching & Realtime
  const likeSyncTimer = useRef(null);
  const popTimerRef = useRef(null);

  const [guideInfo, setGuideInfo] = useState('졸리졸리 라이브에 오신 것을 환영합니다! ✨\n하단을 눌러 상품을 확인하고 하트로 응원해주세요!');

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. 설정 가져오기 (좋아요 수 + 가이드 정보 + 숏폼 영상 URL)
      const { data: configs } = await supabase
        .from('configs')
        .select('key, value')
        .in('key', ['live_like_count', 'live_guide_info', 'shortform_video_url']);
      
      if (configs) {
        const likes = configs.find(c => c.key === 'live_like_count');
        if (likes) setLikeCount(parseInt(likes.value) || 1284);
        
        const guide = configs.find(c => c.key === 'live_guide_info');
        if (guide) setGuideInfo(guide.value);

        const video = configs.find(c => c.key === 'shortform_video_url');
        if (video) setCurrentShortformVideoUrl(video.value);
      }

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
      // 실시간 영상 URL 업데이트 수신
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configs', filter: 'key=eq.shortform_video_url' }, (p) => {
        setCurrentShortformVideoUrl(p.new.value);
      })
      // 실시간 가이드 정보 업데이트 수신
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configs', filter: 'key=eq.live_guide_info' }, (p) => {
        setGuideInfo(p.new.value);
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(orderChannel); 
      if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
    };
  }, []);

  // Automatic fullscreen request removed to prevent annoying Android system notifications



  // Handlers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    
    if (isMiniMode) {
      initialMiniPos.current = { ...miniPos };
    }
    
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const deltaY = e.touches[0].clientY - touchStartY.current;
    const deltaX = e.touches[0].clientX - touchStartX.current;

    if (isMiniMode) {
      // 미니 플레이어 자유 이동
      setMiniPos({
        x: initialMiniPos.current.x - deltaX, // 오른쪽 기준이므로 델타를 뺌
        y: initialMiniPos.current.y - deltaY  // 아래쪽 기준이므로 델타를 뺌
      });
    } else {
      // 전체 화면에서 아래로 끌어내리기
      if (deltaY > 0) setTouchDeltaY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    if (isMiniMode) {
      // 미니 모드에서는 별도 액션 없음 (위치 고정됨)
    } else {
      // 100px 이상 드래그하면 미니모드 전환
      if (touchDeltaY > 100) {
        onMiniModeChange(true);
      }
      setTouchDeltaY(0);
    }
  };

  const handleClick = () => {
    // 이제 클릭으로 전체화면 전환하지 않음 (이동 중 클릭 방지)
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
    // 1. 좋아요 숫자 무조건 증가
    const newCount = likeCount + 1;
    setLikeCount(newCount);
    
    // 2. 버튼 팝 애니메이션 상태 제어 (잠시 채워졌다가 비워짐)
    setIsLiked(true);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    popTimerRef.current = setTimeout(() => setIsLiked(false), 400);

    // 3. 플로팅 하트 애니메이션 (여러 개 생성으로 풍성하게)
    const randomLeft = Math.random() * 80 + 10;
    const newHearts = Array.from({ length: 2 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.max(10, Math.min(90, randomLeft + (i * 8 - 4)))
    }));
    
    setHearts(prev => [...prev, ...newHearts]);

    // 4. 실시간 하트 애니메이션 브로드캐스트 (즉시)
    supabase.channel('live-realtime').send({
      type: 'broadcast',
      event: 'like',
      payload: { left: randomLeft }
    });

    // 5. DB 동기화 (Debounce)
    if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
    likeSyncTimer.current = setTimeout(async () => {
      await supabase.from('configs').upsert({ key: 'live_like_count', value: String(newCount) }, { onConflict: 'key' });
    }, 5000);

    // 2초 뒤 하트 제거
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 2000);
  };

  const handleShowGuide = () => {
    if (showAlert) {
      showAlert('라이브 이용 가이드 💡', guideInfo, 'info');
    }
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

  const miniWidth = viewportSize.width < 640 ? 120 : 160;
  const miniHeight = viewportSize.width < 640 ? 200 : 260;
  const scaleX = miniWidth / viewportSize.width;
  const scaleY = miniHeight / viewportSize.height;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[5000] overflow-hidden select-none pointer-events-none",
        isMiniMode ? "pointer-events-none" : "pointer-events-auto"
      )}
      style={{ 
        overscrollBehavior: 'none',
        touchAction: 'none'
      }}
    >
      {/* 1. Motion Container (This moves and scales) */}
      <div 
        className={cn(
          "absolute bg-black overflow-hidden shadow-2xl border-0",
          isMiniMode ? "rounded-3xl ring-1 ring-white/20 pointer-events-auto" : "rounded-0"
        )}
        style={{
          willChange: 'transform, border-radius',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000,
          WebkitPerspective: 1000,
          width: isMiniMode ? viewportSize.width : '100%',
          height: isMiniMode ? viewportSize.height : '100%',
          transformOrigin: 'top left',
          transform: isMiniMode 
            ? `translate(calc(100vw - ${miniPos.x + (viewportSize.width < 640 ? 136 : 200)}px), calc(100dvh - ${miniPos.y + (viewportSize.width < 640 ? 220 : 340)}px)) scale(${scaleX}, ${scaleY})`
            : `translate(0, ${touchDeltaY}px) scale(1, 1)`,
          transition: isSwiping ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <LiveVideoPlayer 
          src={currentShortformVideoUrl}
          isMuted={isMuted} 
          isMiniMode={isMiniMode} 
          onBack={onBack} 
          onMiniModeChange={onMiniModeChange} 
        />
      </div>

      {/* 2. UI Components Layer - Always fixed at full screen, fades in/out */}
      <div className={cn(
        "fixed inset-0 z-[6000] overflow-hidden transition-opacity duration-500 ease-in-out pointer-events-none",
        isMiniMode ? "opacity-0" : "opacity-100 delay-500 pointer-events-auto"
      )}>
        {/* Hearts Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
            onBack={onBack}
            showAlert={showAlert}
            likeCount={likeCount}
          />

          {/* Interaction Overlay (Mobile only or Desktop floating) */}
          <div className="absolute bottom-0 left-0 right-0 z-[60] flex flex-col pointer-events-none pb-4 lg:pb-10">
            <div className="flex items-end justify-between px-4 w-full">
              <div className="flex-1 min-w-0 flex flex-col gap-2 pr-6 bg-transparent border-0 outline-none !border-none !outline-none !ring-0">
                {!isChatExpanded && <LiveChatPreview chatMessages={filteredChatMessages} />}
                <LiveProductDisplay 
                  products={displayProducts}
                  onOrderOpen={() => setIsSheetOpen(true)}
                  onProductClick={(product) => {
                    setSelectedProduct(product);
                    setIsDetailOpen(true);
                  }}
                />
              </div>
              <LiveInteractionSidebar 
                isAdmin={isAdmin} 
                onLike={handleLike} 
                isLiked={isLiked} 
                likeCount={likeCount} 
                onChatExpand={() => setIsChatExpanded(true)} 
                onDetailOpen={() => setIsProductListOpen(true)}
                onProductSheetOpen={() => setIsProductSheetOpen(true)}
                onShowGuide={handleShowGuide}
              />
            </div>
          </div>
      </div>

      {/* Desktop Chat Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:w-[380px] xl:w-[450px] h-full bg-zinc-900 border-l border-white/10 flex-col overflow-hidden relative transition-opacity duration-500",
        isMiniMode ? "opacity-0 pointer-events-none" : "opacity-100 delay-500"
      )}>
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
      
      {/* 3. Sheets & Modals (Mobile specific or Global) */}
      <div className={cn(
        "relative z-[7000] transition-opacity duration-300",
        isMiniMode ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {isDetailOpen && (
             <div className="fixed inset-0 z-[8000] bg-white flex flex-col animate-slide-up-full overflow-hidden">
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

          <LiveProductListView
            isOpen={isProductListOpen}
            onClose={() => setIsProductListOpen(false)}
            products={allProducts}
            liveProductIds={liveProductIds}
            onProductClick={(product) => {
              setSelectedProduct(product);
              setIsProductListOpen(false);
              setIsDetailOpen(true);
            }}
          />

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
      </div>

        {/* 4. Mini Mode UI Layer (Unscaled for better visibility) */}
        <div 
          className={cn(
            "fixed z-[9000] pointer-events-none transition-opacity duration-300",
            isMiniMode ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: miniWidth,
            height: miniHeight,
            transformOrigin: 'top left',
            transform: isMiniMode 
              ? `translate(calc(100vw - ${miniPos.x + (viewportSize.width < 640 ? 136 : 200)}px), calc(100dvh - ${miniPos.y + (viewportSize.width < 640 ? 220 : 340)}px))`
              : `translate(0, ${touchDeltaY}px)`,
            transition: isSwiping ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease-in-out',
          }}
        >
          {/* Top-left expand button */}
          <div className="absolute top-1.5 left-1.5">
            <GlassIconButton 
              onClick={(e) => { e.stopPropagation(); onMiniModeChange(false); }}
              className="w-8 h-8 sm:w-8 sm:h-8 bg-black/60"
            >
              <Maximize2 size={14} />
            </GlassIconButton>
          </div>

          {/* Top-right close button */}
          <div className="absolute top-1.5 right-1.5">
            <GlassIconButton 
              onClick={(e) => { e.stopPropagation(); onBack(); }}
              className="w-8 h-8 sm:w-8 sm:h-8 bg-black/60"
            >
              <X size={14} />
            </GlassIconButton>
          </div>

          {/* Bottom LIVE Indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-brand-pink/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-black text-white shadow-md border border-white/10 pointer-events-none">
             <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
             LIVE
          </div>
        </div>

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

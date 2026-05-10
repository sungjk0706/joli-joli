import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';
import { useLiveRealtime } from '../hooks/live/useLiveRealtime';
import { useLiveGestures } from '../hooks/live/useLiveGestures';
import { useDeviceType } from '../hooks/useDeviceType';
import { paymentService } from '../services/paymentService';

// Device-specific Live Commerce Views
const LiveCommercePhone = React.lazy(() => import('./live/LiveCommercePhone'));
const LiveCommerceTablet = React.lazy(() => import('./live/LiveCommerceTablet'));
const LiveCommerceDesktop = React.lazy(() => import('./live/LiveCommerceDesktop'));

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
  showAlert,
  onProductClick,
  isSheetOpen,
  setIsSheetOpen,
  isProductListOpen,
  setIsProductListOpen,
  onProductListOpen,
  onOrderOpen
}) => {
  // State management
  const [currentShortformVideoUrl, setCurrentShortformVideoUrl] = useState(config?.shortformVideoUrl || initialShortformVideoUrl);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { user: 'joli_joli', text: '반갑습니다! 졸리졸리 라이브에 오신 것을 환영해요 💖', isAdmin: true }
  ]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1284);
  const [viewerCount, setViewerCount] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [floatingItems, setFloatingItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({ customer_name: '', phone: '', address: '', detail_address: '', zonecode: '', options: '', paymentMethod: 'bank_transfer', quantity: 1, selectedOption: '', depositName: '', requests: '' });
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [currentUsername] = useState(() => localStorage.getItem('joli_user_name') || `익명_${Math.floor(Math.random() * 10000)}`);
  const [miniPos, setMiniPos] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [guideInfo, setGuideInfo] = useState('졸리졸리 라이브에 오신 것을 환영합니다! ✨\n하단을 눌러 상품을 확인하고 하트로 응원해주세요!');
  const containerRef = useRef(null);
  const popTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('joli_user_name', currentUsername);
  }, [currentUsername]);

  // Realtime Hook
  const { broadcastLike, broadcastChat, syncLikesToDb } = useLiveRealtime({
    isAdmin,
    currentUsername,
    setChatMessages,
    setLikeCount,
    setFloatingItems,
    setNotifications,
    setCurrentShortformVideoUrl,
    setGuideInfo,
    setBannedUsers,
    setViewerCount,
    likeCount
  });

  // Gestures Hook
  const { touchDeltaY, isSwiping, handleTouchStart, handleTouchMove, handleTouchEnd } = useLiveGestures({
    isMiniMode,
    onMiniModeChange,
    miniPos,
    setMiniPos,
    viewportSize,
    onSwipeUp: () => setIsProductListOpen(true),
  });

  // Sheet History Management
  const lastSheetOpenRef = useRef(false);
  useEffect(() => {
    const handlePopState = (e) => {
      if (isChatExpanded) setIsChatExpanded(false);
      if (isProductListOpen) setIsProductListOpen(false);
      if (isSheetOpen) setIsSheetOpen(false);
      if (isProductSheetOpen) setIsProductSheetOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    const anySheetOpen = isChatExpanded || isProductListOpen || isSheetOpen || isProductSheetOpen;
    if (anySheetOpen && !lastSheetOpenRef.current) {
      window.history.pushState({ sheetOpen: true }, '');
    } else if (!anySheetOpen && lastSheetOpenRef.current) {
      if (window.history.state?.sheetOpen) window.history.back();
    }
    lastSheetOpenRef.current = anySheetOpen;
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isChatExpanded, isProductListOpen, isSheetOpen, isProductSheetOpen]);

  // Viewport Size Management + Mini Mode Position Recalculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const oldWidth = viewportSize.width;
        const oldHeight = viewportSize.height;
        
        setViewportSize({
          width: newWidth,
          height: newHeight
        });
        
        // Recalculate miniPos when viewport changes to keep mini player in same relative position
        if (isMiniMode && oldWidth > 0 && oldHeight > 0) {
          const widthRatio = newWidth / oldWidth;
          const heightRatio = newHeight / oldHeight;
          
          setMiniPos(prev => ({
            x: Math.max(0, Math.min(prev.x * widthRatio, newWidth - 200)),
            y: Math.max(0, Math.min(prev.y * heightRatio, newHeight - 300))
          }));
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMiniMode, viewportSize.width, viewportSize.height]);

  // Handlers
  const handleSend = async (customMsg) => {
    const msgToSend = typeof customMsg === 'string' ? customMsg : message;
    if (!msgToSend.trim()) return;
    if (bannedUsers.includes(currentUsername)) {
      const n = { id: Date.now(), text: "채팅 권한이 제한되었습니다. 고객센터에 문의하세요." };
      setNotifications(prev => [...prev, n]);
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3000);
      setMessage('');
      return;
    }
    const newMsg = { user: isAdmin ? 'joli_joli' : currentUsername, text: msgToSend, isAdmin: isAdmin };
    setChatMessages(prev => [...prev, newMsg].slice(-100));
    broadcastChat(newMsg);
    supabase.from('live_chat').insert([{
      user: isAdmin ? 'joli_joli' : currentUsername,
      text: msgToSend,
      is_admin: isAdmin
    }]).then(({ error }) => error && console.error('채팅 저장 실패:', error));
    if (typeof customMsg !== 'string') setMessage('');
  };

  const handleLike = () => {
    const newCount = likeCount + 1;
    setLikeCount(newCount);
    setIsLiked(true);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    popTimerRef.current = setTimeout(() => setIsLiked(false), 400);
    const randomLeft = Math.random() * 30 + 10;
    const newItems = Array.from({ length: 2 }, (_, i) => ({
      id: `heart-${Date.now()}-${i}`,
      left: Math.max(5, Math.min(60, randomLeft + (Math.random() * 10 - 5))),
      type: 'heart'
    }));
    setFloatingItems(prev => [...prev, ...newItems]);
    broadcastLike(randomLeft);
    syncLikesToDb(newCount);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(h => !newItems.find(nh => nh.id === h.id)));
    }, 2000);
  };

  const handleReaction = (type, customContent) => {
    const emojiMap = { sparkle: '✨', boom: '💥' };
    const emoji = type === 'custom' ? customContent : (emojiMap[type] || '✨');
    const randomLeft = Math.random() * 60 + 20;
    const newItem = {
      id: `react-${Date.now()}`,
      left: randomLeft,
      type: 'emoji',
      content: emoji
    };
    setFloatingItems(prev => [...prev, newItem]);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(i => i.id !== newItem.id));
    }, 2000);
    // 채팅으로도 전송 (선택 사항)
    // handleSend(emoji);
  };

  const handleOrderSubmit = async (e, f, p) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (f.paymentMethod !== 'bank_transfer') {
        const portoneId = config?.portoneConfig?.merchantId;
        if (!portoneId) throw new Error('카드 결제 설정이 완료되지 않았습니다.');
        paymentService.init(portoneId);
        await paymentService.requestPayment({
          pg: f.paymentMethod === 'kakaopay' ? 'kakaopay' : (config?.portoneConfig?.pg || 'kcp'),
          pay_method: f.paymentMethod === 'tosspay' ? 'trans' : 'card',
          name: p.name,
          amount: (p.price * (f.quantity || 1)),
          buyer_name: f.customer_name || f.name,
          buyer_tel: f.phone,
          buyer_addr: f.address + ' ' + (f.detail_address || ''),
          buyer_postcode: f.zonecode
        });
      }
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
      setNotifications(prev => [...prev, { id: Date.now(), text: "주문이 정상적으로 접수되었습니다! ✨" }]);
      setFormData({ customer_name: '', phone: '', address: '', detail_address: '', zonecode: '', options: '', paymentMethod: 'bank_transfer', quantity: 1, selectedOption: '', depositName: '', requests: '' });
      setIsSheetOpen(false);
    } catch (error) {
      setNotifications(prev => [...prev, { id: Date.now(), text: error.message || "주문 중 오류 발생" }]);
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || !Array.isArray(liveProductIds)) return [];
    
    return allProducts.filter(p => 
      liveProductIds.some(item => (typeof item === 'object' ? item.id : item) === String(p.id))
    ).map(p => {
      const meta = liveProductIds.find(item => (typeof item === 'object' ? item.id : item) === String(p.id));
      return {
        ...p,
        liveEmoji: typeof meta === 'object' ? meta.emoji : '✨',
        liveTag: typeof meta === 'object' ? meta.tag : ''
      };
    });
  }, [allProducts, liveProductIds]);

  const filteredChatMessages = useMemo(() => {
    return chatMessages.filter(m => !bannedUsers.includes(m.user));
  }, [chatMessages, bannedUsers]);

  const activeProductCandidate = selectedProduct || (displayProducts?.length > 0 ? displayProducts[0] : allProducts?.[0]);
  const activeProduct = useMemo(() => {
    if (!activeProductCandidate) return null;
    // 이미 displayProducts에 포함되어 있다면 메타데이터가 있음
    const metaProd = displayProducts.find(p => String(p.id) === String(activeProductCandidate.id));
    return metaProd || activeProductCandidate;
  }, [activeProductCandidate, displayProducts]);
  const miniWidth = viewportSize.width < 640 ? 120 : 160;
  const miniHeight = viewportSize.width < 640 ? 200 : 260;

  // Get device type for conditional rendering
  const { isPhone, isTablet, isDesktop } = useDeviceType();

  // Shared props for all device-specific components
  const sharedProps = {
    // Mini mode
    isMiniMode, miniPos, miniWidth, miniHeight, viewportSize,
    onMiniModeChange, onBack,
    // Video
    currentShortformVideoUrl, isMuted, setIsMuted,
    // Touch gestures
    touchDeltaY, isSwiping, handleTouchStart, handleTouchMove, handleTouchEnd,
    // Chat
    chatMessages, filteredChatMessages, message, setMessage, handleSend,
    isChatExpanded, setIsChatExpanded, currentUsername, isAdmin, bannedUsers,
    // Products
    displayProducts, allProducts, liveProductIds, activeProduct, selectedProduct,
    onProductClick, onPushToLive,
    // UI states
    isProductListOpen, setIsProductListOpen,
    isProductSheetOpen, setIsProductSheetOpen,
    isSheetOpen, setIsSheetOpen,
    showControlPanel, setShowControlPanel,
    // Interaction
    floatingItems, isLiked, likeCount, handleLike, handleReaction,
    onProductListOpen, showAlert, viewerCount,
    // Form & Order
    formData, setFormData, handleOrderSubmit, loading, config, guideInfo,
    // Notifications
    notifications,
    // Admin
    setCurrentShortformVideoUrl, setGuideInfo,
  };

  return (
    <React.Suspense fallback={<div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center text-white/50 text-xs">Loading Live...</div>}>
      <div 
        ref={containerRef}
        className="fixed inset-0 z-[9999] overflow-hidden select-none pointer-events-none"
        style={{ overscrollBehavior: 'none', touchAction: 'none' }}
      >
        {isPhone && <LiveCommercePhone {...sharedProps} />}
        {isTablet && <LiveCommerceTablet {...sharedProps} />}
        {isDesktop && <LiveCommerceDesktop {...sharedProps} />}
        
        <style>{`
          @keyframes heartFly { 0% { transform: translateY(0) scale(1) rotate(0); opacity: 1; } 100% { transform: translateY(-400px) scale(1.5) rotate(20deg); opacity: 0; } }
          .animate-heart-fly { animation: heartFly 1.5s ease-out forwards; }
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          .pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }
        `}</style>
      </div>
    </React.Suspense>
  );
};

export default LiveCommerceView;

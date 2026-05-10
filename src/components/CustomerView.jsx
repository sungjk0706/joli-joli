import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';
import { orderService, notificationService, configService, productService, cartService, dopamineService, couponService } from '../services';
import LiveCommerceView from './LiveCommerceView';
import HeroSection from './customer/HeroSection';
import OrderCompleteView from './customer/OrderCompleteView';
import CustomerOrderHistory from './customer/CustomerOrderHistory';
import CartView from './CartView';
import ProductDetailView from './ProductDetailView';
import RaffleCard from './RaffleCard';
import { useProducts, useConfigs, useCategories, useAlert } from '../hooks';
import { SweetAlert } from './ui/Common';
import { Package, X, Instagram, Trophy } from 'lucide-react';

const CustomerView = ({ isAdminMode = false, onExitAdminLive }) => {
  const { products, loading, error, productsRef } = useProducts();
  const { config } = useConfigs();
  const { categories } = useCategories();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(isAdminMode);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveProductIds, setLiveProductIds] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [raffles, setRaffles] = useState([]);
  const { alert, showAlert, hideAlert } = useAlert();
  
  
  const [formData, setFormData] = useState({ 
    name: localStorage.getItem('SAVED_CUSTOMER_NAME') || '', 
    phone: localStorage.getItem('SAVED_CUSTOMER_PHONE') || '', 
    address: localStorage.getItem('SAVED_CUSTOMER_ADDRESS') || '',
    quantity: 1,
    depositName: localStorage.getItem('SAVED_CUSTOMER_NAME') || '',
    requests: '',
    selectedOption: '',
    paymentMethod: 'bank_transfer'
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMiniMode, setIsMiniMode] = useState(false);

  useEffect(() => {
    if (isAdminMode) {
      setIsLiveMode(true);
      setIsMiniMode(false);
    }
    
    // 실시간 송출 상품 목록 초기화 및 구독
    const fetchLiveProductIds = async () => {
      const { data } = await supabase.from('configs').select('value').eq('key', 'live_featured_product_ids').maybeSingle();
      if (data) setLiveProductIds(JSON.parse(data.value));
    };
    
    fetchLiveProductIds();
    
    const channel = supabase.channel('config-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configs', filter: `key=eq.live_featured_product_ids` }, (payload) => {
        setLiveProductIds(JSON.parse(payload.new.value));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminMode]);

  const handleMiniModeChange = useCallback((mini) => {
    setIsMiniMode(mini);
  }, []);

  // 추첨 로드
  useEffect(() => {
    const loadRaffles = async () => {
      try {
        const data = await dopamineService.getRaffles(true); // 활성화된 추첨만
        setRaffles(data);
      } catch (error) {
        console.error('추첨 로드 실패:', error);
      }
    };
    loadRaffles();
  }, []);

  const handleEnterRaffle = async (raffleId, customerPhone, customerName) => {
    try {
      await dopamineService.enterRaffle(raffleId, customerPhone, customerName);
      // 추첨 상태 갱신
      const data = await dopamineService.getRaffles(true);
      setRaffles(data);
    } catch (error) {
      throw error;
    }
  };


  // 장바구니 카운트 로드
  useEffect(() => {
    const loadCartCount = async () => {
      const phone = localStorage.getItem('SAVED_CUSTOMER_PHONE');
      if (phone) {
        try {
          const count = await cartService.getCartCount(phone);
          setCartCount(count);
        } catch (error) {
          console.error('장바구니 카운트 로드 실패:', error);
        }
      }
    };
    loadCartCount();

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      loadCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    // 브라우저 뒤로가기 감지 및 처리
    const handlePopState = (e) => {
      if (isAdminMode) return;
      
      if (e.state && e.state.live) {
        setIsLiveMode(true);
      } else {
        setIsLiveMode(false);
        setIsMiniMode(false);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAdminMode]);

  const handleLiveBack = useCallback((targetTab) => {
    
    if (isAdminMode) {
      onExitAdminLive(targetTab);
    } else {
      // 브라우저 히스토리 뒤로가기 실행 (popstate 리스너에서 setIsLiveMode(false) 처리됨)
      window.history.back();
    }
  }, [isAdminMode, onExitAdminLive]);

  const handleCopyBankInfo = useCallback(() => {
    const totalPrice = selectedProduct.price * formData.quantity;
    const text = `입금정보: ${config.bankInfo.bank} ${config.bankInfo.account} (예금주: ${config.bankInfo.holder || '관리자'})\n입금금액: ${totalPrice.toLocaleString()}원\n입금자명: ${formData.depositName}`;
    navigator.clipboard.writeText(text);
    showAlert('복사 완료! ✨', '입금 정보가 복사되었습니다!', 'success');
  }, [selectedProduct, formData, config, showAlert]);

  const handleSubmitOrder = useCallback(async (e) => {
    e.preventDefault();
    try {
      const result = await orderService.placeOrderTransaction({
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        address: formData.address.trim(),
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: formData.quantity,
        deposit_name: formData.depositName.trim() || formData.name.trim(),
        requests: formData.requests.trim(),
        selected_option: formData.selectedOption,
        payment_method: formData.paymentMethod,
      });

      // 쿠폰 사용 처리 (쿠폰이 적용된 경우)
      const couponCode = localStorage.getItem('APPLIED_COUPON_CODE');
      const discountAmount = localStorage.getItem('APPLIED_COUPON_DISCOUNT');
      if (couponCode && discountAmount && parseInt(discountAmount) > 0 && result?.order_id) {
        try {
          const coupon = await couponService.getByCode(couponCode);
          if (coupon) {
            await couponService.useCoupon(coupon.id, result.order_id, formData.phone, parseInt(discountAmount));
          }
        } catch (couponError) {
          console.error('쿠폰 사용 오류:', couponError);
        }
        localStorage.removeItem('APPLIED_COUPON_CODE');
        localStorage.removeItem('APPLIED_COUPON_DISCOUNT');
      }

      setOrderComplete(true);
      notificationService.sendOrderNotification({ ...formData, product_name: selectedProduct.name, price: selectedProduct.price }, config);
    } catch (err) {
      showAlert('주문 불가 😥', err.message, 'error');
    }
  }, [selectedProduct, formData, config, showAlert]);

  const handleSubmitLiveOrder = useCallback(async (e, liveFormData, liveProduct) => {
    e.preventDefault();

    if (!liveFormData.name.trim()) return showAlert('입력 오류', '받는 분 성함을 입력해주세요.', 'error');
    if (!liveFormData.phone.trim()) return showAlert('입력 오류', '연락처를 입력해주세요.', 'error');
    if (!liveFormData.address.trim()) return showAlert('입력 오류', '배송지 주소를 입력해주세요.', 'error');

    try {
      await orderService.placeOrderTransaction({
        customer_name: liveFormData.name.trim(),
        customer_phone: liveFormData.phone.trim(),
        address: liveFormData.address.trim(),
        product_id: liveProduct.id,
        product_name: liveProduct.name,
        price: liveProduct.price,
        quantity: liveFormData.quantity,
        deposit_name: liveFormData.depositName.trim() || liveFormData.name.trim(),
        requests: liveFormData.requests.trim(),
        selected_option: liveFormData.selectedOption,
        payment_method: liveFormData.paymentMethod || 'bank_transfer',
      });

      localStorage.setItem('SAVED_CUSTOMER_NAME', liveFormData.name.trim());
      localStorage.setItem('SAVED_CUSTOMER_PHONE', liveFormData.phone.trim());
      localStorage.setItem('SAVED_CUSTOMER_ADDRESS', liveFormData.address.trim());

      setOrderComplete(true);
      notificationService.sendOrderNotification({ ...liveFormData, product_name: liveProduct.name, price: liveProduct.price }, config);
    } catch (err) {
      showAlert('주문 불가 😥', err.message, 'error');
    }
  }, [showAlert, config]);


  const handlePushToLive = useCallback(async (products) => {
    const productsArray = Array.isArray(products) ? products : [products];
    try {
      const currentIds = liveProductIds;
      const newIds = [...new Set([...currentIds, ...productsArray.map(p => String(p.id))])];

      const { error } = await supabase.from('configs').upsert({
        key: 'live_featured_product_ids',
        value: JSON.stringify(newIds)
      }, { onConflict: 'key' });

      if (error) throw error;

      setLiveProductIds(newIds);
      showAlert('송출 완료 🚀', `${productsArray.length}개의 상품이 방송 목록에 추가되었습니다.`, 'success');
    } catch (error) {
      console.error('Push error:', error);
      showAlert('오류', error.message, 'error');
    }
  }, [liveProductIds, showAlert]);

  const handleRemoveFromLive = useCallback(async (productId) => {
    if (!isAdminMode) return;
    try {
      const newIds = liveProductIds.filter(id => id !== String(productId));
      const { error } = await supabase.from('configs').upsert({
        key: 'live_featured_product_ids',
        value: JSON.stringify(newIds)
      }, { onConflict: 'key' });

      if (error) throw error;
      setLiveProductIds(newIds);
    } catch (e) {
      console.error('Remove from live error:', e);
      showAlert('오류', '송출 중단 처리 중 오류가 발생했습니다.', 'error');
    }
  }, [isAdminMode, liveProductIds, showAlert]);

  const handleAddToCart = useCallback(async (product, quantity = 1, selectedOption = '') => {
    const customerPhone = localStorage.getItem('SAVED_CUSTOMER_PHONE');
    if (!customerPhone) {
      showAlert('로그인 필요', '장바구니에 추가하려면 먼저 연락처를 입력해주세요.', 'info');
      return;
    }

    try {
      await cartService.addToCart(customerPhone, product.id, quantity, selectedOption);
      window.dispatchEvent(new Event('cartUpdated'));
      showAlert('장바구니 추가 ✨', `${product.name}이 장바구니에 추가되었습니다.`, 'success');
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      showAlert('오류', '장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
  }, [showAlert]);

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 relative px-0 sm:px-4">
      {/* Main Content (Hero Section) - visible when not in full live mode */}
      {(!isLiveMode || isMiniMode) && (
        <div className={cn("relative z-10", !isMiniMode && "animate-fade-in")}>
          <HeroSection 
            onEnterLive={() => {
              setIsLiveMode(true);
              setIsMiniMode(false);
              
              // 히스토리 상태 추가
              if (!isAdminMode) {
                window.history.pushState({ view: 'customer', live: true }, '');
              }
            }}
            onShowHistory={() => setShowOrderHistory(true)}
            onShowCart={() => setShowCart(true)}
            instaUrl={config.instaUrl}
            cartCount={cartCount}
          />
          
          {/* 추첨 이벤트 섹션 */}
          {raffles.length > 0 && !isLiveMode && (
            <div className="px-4 sm:px-6 mb-10 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-brand-pink rounded-full shadow-[0_0_12px_rgba(255,107,156,0.3)]"></div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Special Events</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {raffles.map(raffle => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onEnter={handleEnterRaffle}
                    showAlert={showAlert}
                    customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
                    customerName={localStorage.getItem('SAVED_CUSTOMER_NAME')}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}


      {/* LiveCommerceView - rendered whenever live mode is active, handles its own full/mini display */}
      {isLiveMode && (
        <LiveCommerceView
          allProducts={products}
          config={config}
          onBack={handleLiveBack}
          onSubmitOrder={handleSubmitLiveOrder}
          loading={loading}
          isAdmin={isAdminMode}
          onPushToLive={handlePushToLive}
          onRemoveFromLive={handleRemoveFromLive}
          liveProductIds={liveProductIds}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          isMiniMode={isMiniMode}
          onMiniModeChange={handleMiniModeChange}
          onProductClick={(product) => setDetailProduct(product)}
          showAlert={showAlert}
        />
      )}

      {/* Modals & Overlays - These also benefit from the global animations/styles */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="boutique-glass rounded-[2.5rem] w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/50">
            <div className="sticky top-0 boutique-glass border-b border-black/5 p-4 sm:p-6 flex items-center justify-between">
              <h3 className="boutique-title text-2xl text-[var(--brand-text)]">주문 내역</h3>
              <button
                onClick={() => setShowOrderHistory(false)}
                className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-full flex items-center justify-center hover:scale-110 transition-all"
              >
                <X size={18} sm:size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin">
              <CustomerOrderHistory showAlert={showAlert} onReorder={(productData) => {
                const product = products.find(p => p.id === productData.productId);
                if (product) {
                  setSelectedProduct(product);
                  setFormData(prev => ({
                    ...prev,
                    quantity: productData.quantity || 1,
                    selectedOption: productData.selectedOption || ''
                  }));
                  setIsSheetOpen(true);
                  setShowOrderHistory(false);
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <CartView
          customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
          showAlert={showAlert}
          onCheckout={(cartItems) => {
            setShowCart(false);
            if (cartItems.length > 0) {
              const firstItem = cartItems[0];
              const product = products.find(p => p.id === firstItem.product_id);
              if (product) {
                setSelectedProduct(product);
                setIsSheetOpen(true);
                showAlert('장바구니', '현재는 단일 상품 주문만 지원합니다. 선택된 상품으로 주문을 진행합니다.', 'info');
              }
            }
          }}
          onClose={() => setShowCart(false)}
        />
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-[10000]">
          <ProductDetailView
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onAddToCart={handleAddToCart}
            showAlert={showAlert}
            config={config}
            customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
            onBuyNow={(product) => {
              setSelectedProduct(product);
              setIsSheetOpen(true);
              setDetailProduct(null);
            }}
          />
        </div>
      )}

      <SweetAlert isOpen={alert.show} onClose={hideAlert} title={alert.title} message={alert.message} type={alert.type} showCancel={alert.showCancel} onConfirm={alert.onConfirm} />
    </div>
  );
};

export default CustomerView;

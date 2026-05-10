import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { orderService, notificationService, cartService, dopamineService, couponService } from '../services';
import LiveCommerceView from './LiveCommerceView';
import OrderCompleteView from './customer/OrderCompleteView';
import { useAlert, useDeviceType } from '../hooks';
import { useProductsQuery, useConfigsQuery } from '../hooks/queries';
import { useLiveStore } from '../stores/liveStore';
import { useCustomerNavigation } from '../hooks/useCustomerNavigation';
const CustomerViewPhone = React.lazy(() => import('./customer/phone/CustomerViewPhone'));
const CustomerViewTablet = React.lazy(() => import('./customer/tablet/CustomerViewTablet'));
const CustomerViewDesktop = React.lazy(() => import('./customer/desktop/CustomerViewDesktop'));

const CustomerView = ({ isAdminMode = false, onExitAdminLive, isPreview = false }) => {
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProductsQuery();
  const { data: config = {} } = useConfigsQuery();
  const { alert, showAlert, hideAlert } = useAlert();
  const { isPhone, isTablet, isDesktop } = useDeviceType();
  
  const {
    isLiveMode, setIsLiveMode,
    showCart, setShowCart,
    showOrderHistory, setShowOrderHistory,
    detailProduct, setDetailProduct,
    isSheetOpen, setIsSheetOpen,
    showProductList, setShowProductList,
    isMiniMode, setIsMiniMode,
    selectedCategory,
    openCart, openOrderHistory, openProductDetail, openOrderSheet, openProductList,
    closeCart, closeOrderHistory, closeProductDetail, closeOrderSheet, closeProductList
  } = useCustomerNavigation(isAdminMode);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [liveProductIds, setLiveProductIds] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [raffles, setRaffles] = useState([]);
  
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
  
  // 라이브 모드 상태를 전역 스토어에 동기화 (관리자 버튼 노출 제어용)
  const setLiveStatus = useLiveStore(state => state.setLiveStatus);
  const setMiniMode = useLiveStore(state => state.setMiniMode);

  useEffect(() => {
    setLiveStatus(isLiveMode);
  }, [isLiveMode, setLiveStatus]);

  useEffect(() => {
    setMiniMode(isMiniMode);
  }, [isMiniMode, setMiniMode]);

  useEffect(() => {
    if (isAdminMode || isPreview) {
      setIsLiveMode(true);
      setIsMiniMode(false);
    }
    
    if (!supabase) return;
    
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
      if (supabase) supabase.removeChannel(channel);
    };
  }, [isAdminMode, isPreview, setIsLiveMode, setIsMiniMode]);

  useEffect(() => {
    const loadRaffles = async () => {
      try {
        const data = await dopamineService.getRaffles(true);
        setRaffles(data);
      } catch (error) {
        console.error('추첨 로드 실패:', error);
      }
    };
    loadRaffles();
  }, []);

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

    const handleCartUpdate = () => loadCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLiveBack = useCallback((targetTab) => {
    if (isAdminMode) {
      onExitAdminLive(targetTab);
    } else {
      window.history.back();
    }
  }, [isAdminMode, onExitAdminLive]);

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
    if (!liveFormData.name.trim() || !liveFormData.phone.trim() || !liveFormData.address.trim()) {
      return showAlert('입력 오류', '모든 필수 항목을 입력해주세요.', 'error');
    }
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

  const handlePushToLive = useCallback(async (pushedProducts) => {
    try {
      // pushedProducts is already structured as [{id, emoji, tag}, ...]
      const { error } = await supabase.from('configs').upsert({ 
        key: 'live_featured_product_ids', 
        value: JSON.stringify(pushedProducts) 
      }, { onConflict: 'key' });
      
      if (error) throw error;
      setLiveProductIds(pushedProducts);
      showAlert('송출 완료 🚀', `${pushedProducts.length}개의 상품이 방송 목록에 추가되었습니다.`, 'success');
    } catch (error) {
      showAlert('오류', error.message, 'error');
    }
  }, [showAlert]);

  const handleRemoveFromLive = useCallback(async (productId) => {
    if (!isAdminMode) return;
    try {
      const newIds = liveProductIds.filter(item => (typeof item === 'object' ? item.id : item) !== String(productId));
      const { error } = await supabase.from('configs').upsert({ key: 'live_featured_product_ids', value: JSON.stringify(newIds) }, { onConflict: 'key' });
      if (error) throw error;
      setLiveProductIds(newIds);
    } catch (e) {
      showAlert('오류', '송출 중단 처리 중 오류가 발생했습니다.', 'error');
    }
  }, [isAdminMode, liveProductIds, showAlert]);

  const handleAddToCart = useCallback(async (product, quantity = 1, selectedOption = '') => {
    const phone = localStorage.getItem('SAVED_CUSTOMER_PHONE');
    if (!phone) return showAlert('로그인 필요', '연락처를 먼저 입력해주세요.', 'info');
    try {
      await cartService.addToCart(phone, product.id, quantity, selectedOption);
      window.dispatchEvent(new Event('cartUpdated'));
      showAlert('장바구니 추가 ✨', `${product.name}이 장바구니에 추가되었습니다.`, 'success');
    } catch (error) {
      showAlert('오류', '장바구니 추가 중 오류 발생', 'error');
    }
  }, [showAlert]);

  if (orderComplete) return <OrderCompleteView onBack={() => setOrderComplete(false)} config={config} />;

  // 공통 props: 기기별 컴포넌트에 전달되는 공유 상태/핸들러 묶음
  const sharedProps = {
    config,
    products,
    raffles,
    cartCount,
    showCart,
    showOrderHistory,
    detailProduct,
    alert,
    openCart,
    closeCart,
    openOrderHistory,
    closeOrderHistory,
    openProductDetail,
    closeProductDetail,
    openOrderSheet,
    hideAlert,
    showAlert,
    handleAddToCart,
    setSelectedProduct,
    setFormData,
    formData,
    isLiveMode,
    setIsLiveMode,
    setIsMiniMode,
    isAdminMode,
  };

  return (
    <>
      {/* ── 라이브 커머스 뷰 (기기 공통, 라이브 진입 시 전체화면 오버레이) ── */}
      {isLiveMode && (
        <LiveCommerceView
          allProducts={products} config={config} onBack={handleLiveBack} onSubmitOrder={handleSubmitLiveOrder} loading={productsLoading}
          isAdmin={isAdminMode} onPushToLive={handlePushToLive} onRemoveFromLive={handleRemoveFromLive} liveProductIds={liveProductIds}
          isSheetOpen={isSheetOpen} setIsSheetOpen={setIsSheetOpen} onOrderOpen={openOrderSheet}
          isProductListOpen={showProductList} setIsProductListOpen={setShowProductList} onProductListOpen={openProductList}
          selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} isMiniMode={isMiniMode} onMiniModeChange={setIsMiniMode}
          onProductClick={openProductDetail} showAlert={showAlert}
        />
      )}

      {/* ── 기기별 메인 화면 (라이브 아닐 때 또는 미니모드) ── */}
      {(!isLiveMode || isMiniMode) && (
        <React.Suspense fallback={null}>
          {isPhone && <CustomerViewPhone {...sharedProps} />}
          {isTablet && <CustomerViewTablet {...sharedProps} />}
          {isDesktop && <CustomerViewDesktop {...sharedProps} />}
        </React.Suspense>
      )}
    </>
  );
};

export default CustomerView;

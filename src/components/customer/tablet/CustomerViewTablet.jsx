import React from 'react';
import { Camera, ShoppingBag, History, Instagram, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import RaffleCard from '../../RaffleCard';
import CartView from '../../CartView';
import ProductDetailView from '../../ProductDetailView';
import CustomerOrderHistory from '../CustomerOrderHistory';
import Footer from '../Footer';
import { SweetAlert } from '../../ui/Common';
import { dopamineService } from '../../../services';

/**
 * CustomerViewTablet
 * 태블릿 전용 고객 화면.
 * - 2열 레이아웃: 좌측 히어로 패널 + 우측 콘텐츠 영역
 * - 좌측 사이드 스티키 네비게이션
 * - 상품/이벤트 2열 그리드
 */
const CustomerViewTablet = ({
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
}) => {
  return (
    <div className="relative w-full min-h-screen bg-brand-pink-light">
      {/* ── 2-Column Layout ────────────────────────────────────── */}
      <div className="flex min-h-screen">
        {/* 좌측: 스티키 히어로 패널 */}
        <aside className="sticky top-0 h-screen w-[280px] flex-shrink-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl border-r border-white/40 p-8">
          {/* 리플 + 로고 */}
          <div className="relative flex items-center justify-center mb-8 pointer-events-none">
            <div className="absolute w-28 h-28 bg-brand-pink-dark/25 rounded-full animate-ripple" style={{ animationDelay: '0s' }} />
            <div className="absolute w-28 h-28 bg-brand-pink-dark/15 rounded-full animate-ripple" style={{ animationDelay: '1s' }} />
            <img
              src="/joli-joli-Logo.png"
              alt="Joli-Joli Logo"
              className="relative z-10 w-32 h-auto animate-logo-rocking will-change-transform select-none"
            />
          </div>

          <p className="text-[10px] font-bold text-brand-pink-dark tracking-widest uppercase mb-8 opacity-70 text-center">
            {config?.shopSubtitle || 'Live Premium Kids'}
          </p>

          {/* 네비게이션 버튼들 */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => { setIsLiveMode(true); setIsMiniMode(false); if (!isAdminMode) window.history.pushState({ live: true }, ''); }}
              className="w-full flex items-center gap-3 bg-brand-pink-dark text-white font-black text-sm py-4 px-5 rounded-2xl shadow-lg shadow-brand-pink/20 active:scale-95 transition-all animate-pulse-subtle"
            >
              <Camera size={20} />
              LIVE 쇼핑하기
            </button>

            <button
              onClick={() => window.location.href = config?.instaUrl || '#'}
              className="w-full flex items-center gap-3 bg-gray-900 text-white font-bold text-sm py-4 px-5 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              <Instagram size={18} />
              인스타 구경가기
            </button>

            <button
              onClick={openCart}
              className="relative w-full flex items-center gap-3 bg-white text-brand-pink-dark border-2 border-brand-pink/20 font-bold text-sm py-4 px-5 rounded-2xl shadow-sm active:scale-95 transition-all"
            >
              <ShoppingBag size={18} />
              장바구니
              {cartCount > 0 && (
                <span className="ml-auto bg-brand-pink-dark text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={openOrderHistory}
              className="w-full flex items-center gap-3 bg-white/60 text-gray-600 border-2 border-gray-100 font-bold text-sm py-4 px-5 rounded-2xl shadow-sm active:scale-95 transition-all"
            >
              <History size={18} />
              주문 내역
            </button>
          </div>
        </aside>

        {/* 우측: 메인 콘텐츠 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 pb-12">
            {/* 이벤트 래플 */}
            {raffles.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 bg-brand-pink rounded-full" />
                  <h2 className="text-lg font-black text-gray-900">Special Events</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {raffles.map(raffle => (
                    <RaffleCard
                      key={raffle.id}
                      raffle={raffle}
                      onEnter={dopamineService.enterRaffle}
                      showAlert={showAlert}
                      customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
                      customerName={localStorage.getItem('SAVED_CUSTOMER_NAME')}
                    />
                  ))}
                </div>
              </div>
            )}

            <Footer config={config} />
          </div>
        </main>
      </div>

      {/* ── 주문 내역 슬라이드 패널 ──────────────────────────────── */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeOrderHistory} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-8 pt-8 pb-5 border-b border-gray-100">
              <h3 className="text-2xl font-black text-gray-900">주문 내역</h3>
              <button onClick={closeOrderHistory} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-88px)] p-6">
              <CustomerOrderHistory
                showAlert={showAlert}
                onReorder={(p) => {
                  const item = products.find(x => x.id === p.productId);
                  if (item) {
                    setSelectedProduct(item);
                    setFormData(v => ({ ...v, quantity: p.quantity, selectedOption: p.selectedOption }));
                    openOrderSheet();
                    closeOrderHistory();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 장바구니 ────────────────────────────────────────────── */}
      {showCart && (
        <CartView
          customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
          showAlert={showAlert}
          onCheckout={(items) => {
            closeCart();
            if (items.length > 0) {
              const p = products.find(x => x.id === items[0].product_id);
              if (p) { setSelectedProduct(p); openOrderSheet(); }
            }
          }}
          onClose={closeCart}
        />
      )}

      {/* ── 상품 상세 ───────────────────────────────────────────── */}
      {detailProduct && (
        <div className="fixed inset-0 z-[10000]">
          <ProductDetailView
            product={detailProduct}
            onClose={closeProductDetail}
            onAddToCart={handleAddToCart}
            showAlert={showAlert}
            config={config}
            customerPhone={localStorage.getItem('SAVED_CUSTOMER_PHONE')}
            onBuyNow={(p) => { setSelectedProduct(p); openOrderSheet(); closeProductDetail(); }}
          />
        </div>
      )}

      <SweetAlert
        isOpen={alert.show}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
      />
    </div>
  );
};

export default CustomerViewTablet;

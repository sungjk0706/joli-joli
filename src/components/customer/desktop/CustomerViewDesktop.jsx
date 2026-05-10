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
 * CustomerViewDesktop
 * PC/노트북 전용 고객 화면.
 * - 중앙 집중형 레이아웃 (max-w-7xl)
 * - 상단 헤더 네비게이션 바
 * - 히어로: 로고 크게 + 버튼 가로 배치
 * - 이벤트: 3열 그리드
 * - 모달: 센터 다이얼로그
 */
const CustomerViewDesktop = ({
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
      {/* ── 상단 헤더 네비게이션 ────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* 로고 */}
          <img src="/joli-joli-Logo.png" alt="Joli-Joli" className="h-9 w-auto select-none" />

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = config?.instaUrl || '#'}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-all shadow-sm"
            >
              <Instagram size={16} />
              인스타
            </button>

            <button
              onClick={openOrderHistory}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 border-2 border-gray-100 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
            >
              <History size={16} />
              주문 내역
            </button>

            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-white text-brand-pink-dark border-2 border-brand-pink/20 font-bold text-sm rounded-xl hover:bg-brand-pink-light/30 transition-all"
            >
              <ShoppingBag size={16} />
              장바구니
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-pink-dark text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setIsLiveMode(true); setIsMiniMode(false); if (!isAdminMode) window.history.pushState({ live: true }, ''); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-pink-dark text-white font-black text-sm rounded-xl hover:bg-brand-pink transition-all shadow-lg shadow-brand-pink/20 animate-pulse-subtle"
            >
              <Camera size={16} />
              LIVE 쇼핑
            </button>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col items-center text-center animate-fade-in">
        {/* 리플 + 로고 */}
        <div className="relative flex items-center justify-center mb-10 pointer-events-none">
          <div className="absolute w-48 h-48 bg-brand-pink-dark/25 rounded-full animate-ripple" style={{ animationDelay: '0s' }} />
          <div className="absolute w-48 h-48 bg-brand-pink-dark/15 rounded-full animate-ripple" style={{ animationDelay: '1s' }} />
          <div className="absolute w-48 h-48 bg-brand-pink-dark/08 rounded-full animate-ripple" style={{ animationDelay: '2s' }} />
          <img
            src="/joli-joli-Logo.png"
            alt="Joli-Joli Logo"
            className="relative z-10 w-72 h-auto animate-logo-rocking will-change-transform select-none"
          />
        </div>

        <p className="text-[12px] font-bold text-brand-pink-dark tracking-widest uppercase mb-10 opacity-70">
          {config?.shopSubtitle || 'Live Premium Kids Collection'}
        </p>

        {/* 가로 배치 버튼 그룹 */}
        <div className="flex flex-row gap-4 justify-center flex-wrap">
          <button
            onClick={() => { setIsLiveMode(true); setIsMiniMode(false); if (!isAdminMode) window.history.pushState({ live: true }, ''); }}
            className="flex items-center gap-3 px-10 py-5 bg-brand-pink-dark text-white font-black text-base rounded-2xl shadow-xl shadow-brand-pink/20 hover:scale-105 hover:bg-brand-pink transition-all animate-pulse-subtle"
          >
            <Camera size={22} />
            LIVE 쇼핑하기
          </button>

          <button
            onClick={() => window.location.href = config?.instaUrl || '#'}
            className="flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-black text-base rounded-2xl shadow-lg hover:bg-gray-700 hover:scale-105 transition-all"
          >
            <Instagram size={20} />
            인스타 구경가기
          </button>

          <button
            onClick={openCart}
            className="relative flex items-center gap-3 px-10 py-5 bg-white text-brand-pink-dark border-2 border-brand-pink/20 font-black text-base rounded-2xl shadow-lg hover:bg-brand-pink-light/30 hover:scale-105 transition-all"
          >
            <ShoppingBag size={20} />
            장바구니
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-pink-dark text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={openOrderHistory}
            className="flex items-center gap-3 px-10 py-5 bg-white/80 text-gray-600 border-2 border-gray-100 font-black text-base rounded-2xl shadow-sm hover:bg-white hover:scale-105 transition-all"
          >
            <History size={20} />
            주문 내역
          </button>
        </div>
      </section>

      {/* ── 이벤트/래플 섹션 ────────────────────────────────────── */}
      {raffles.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-9 bg-brand-pink rounded-full shadow-lg" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Special Events</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
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
        </section>
      )}

      {/* ── 푸터 ────────────────────────────────────────────────── */}
      <Footer config={config} />

      {/* ── 주문 내역 모달 (센터 다이얼로그) ────────────────────── */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeOrderHistory} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-up border border-white/50">
            <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-gray-100">
              <h3 className="text-2xl font-black text-gray-900">주문 내역</h3>
              <button onClick={closeOrderHistory} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-96px)] p-8">
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

export default CustomerViewDesktop;

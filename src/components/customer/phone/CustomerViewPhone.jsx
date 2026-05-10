import React from 'react';
import { cn } from '../../../utils/cn';
import { Camera, ShoppingBag, History, Instagram, X, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import RaffleCard from '../../RaffleCard';
import CartView from '../../CartView';
import ProductDetailView from '../../ProductDetailView';
import CustomerOrderHistory from '../CustomerOrderHistory';
import Footer from '../Footer';
import { SweetAlert } from '../../ui/Common';
import { dopamineService } from '../../../services';

/**
 * CustomerViewPhone
 * 스마트폰 전용 고객 화면 - 현대화된 프리미엄 버전.
 */
const CustomerViewPhone = ({
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
  openProductDetail,
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
    <div className="relative w-full min-h-screen bg-brand-pink-light/30 flex flex-col overflow-x-hidden pb-48">
      {/* ── 상단 상태 바 영역 (추가 여백 확보) ────────────────────── */}
      <div className="h-14 w-full" />

      {/* ── 프리미엄 히어로 섹션 ──────────────────────────────────── */}
      <div className="relative px-6 pt-10 pb-12 overflow-hidden">
        {/* 장식용 배경 요소 */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* 리플 애니메이션 + 로고 (강화됨) */}
          <div className="relative flex items-center justify-center mb-12 pointer-events-none">
            <div className="absolute w-24 h-24 bg-brand-pink-dark/40 rounded-full animate-ripple" style={{ animationDelay: '0s' }} />
            <div className="absolute w-24 h-24 bg-brand-pink-dark/20 rounded-full animate-ripple" style={{ animationDelay: '2s' }} />
            <img
              src="/joli-joli-Logo.png"
              alt="Joli-Joli Logo"
              className="relative z-10 w-44 h-auto animate-logo-rocking will-change-transform select-none"
            />
          </div>

          {/* 메인 버튼 그룹 (PC 버전 디자인 및 색상 이식) */}
          <div className="w-full max-w-[320px] space-y-4">
            {/* 1. 라이브 방송 입장 (PC Pink 색상 + Subtle Pulse) */}
            <button
              onClick={() => { setIsLiveMode(true); setIsMiniMode(false); if (!isAdminMode) window.history.pushState({ live: true }, ''); }}
              className="w-full h-16 flex items-center justify-center gap-3 bg-brand-pink-dark text-white font-black text-lg rounded-[2rem] shadow-xl shadow-brand-pink/20 animate-pulse-subtle active:scale-95 transition-all"
            >
              <Camera size={22} />
              LIVE 쇼핑하기
            </button>

            {/* 하단 2버튼 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 2. 장바구니 (PC White/Pink Border) */}
              <button
                onClick={openCart}
                className="relative h-14 flex items-center justify-center gap-2 bg-white text-brand-pink-dark border-2 border-brand-pink/20 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all"
              >
                <ShoppingBag size={20} />
                장바구니
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-pink-dark text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* 3. 주문내역 (PC White/Gray Border) */}
              <button
                onClick={openOrderHistory}
                className="h-14 flex items-center justify-center gap-2 bg-white/80 text-gray-600 border-2 border-gray-100 font-black text-sm rounded-2xl shadow-sm active:scale-95 transition-all"
              >
                <History size={20} />
                주문내역
              </button>
            </div>

            {/* 4. 인스타그램 (PC Black 색상) */}
            <button
              onClick={() => { window.location.href = config?.instaUrl || '#'; }}
              className="w-full h-14 flex items-center justify-center gap-3 bg-gray-900 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              <Instagram size={20} />
              인스타 구경가기
            </button>
          </div>
        </div>
      </div>

      {/* ── 스페셜 이벤트 (래플) ─────────────────────────────────── */}
      {raffles.length > 0 && (
        <section className="px-6 mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-brand-pink-dark rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">오늘의 래플 이벤트</h2>
            </div>
            <Sparkles size={18} className="text-brand-pink-dark animate-pulse" />
          </div>
          <div className="space-y-4">
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

      {/* ── 상품 갤러리 (NEW ARRIVALS) ───────────────────────────── */}
      {/* ── 상품 갤러리 ─────────────────────────────────────────── */}
      <section className="px-6 mb-12">
        {/* 2열 상품 그리드 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8">
          {products.filter(p => p.stock > 0).slice(0, 4).map(product => (
            <div 
              key={product.id} 
              className="group flex flex-col space-y-3 active:scale-[0.98] transition-all"
              onClick={() => openProductDetail(product)}
            >
              <div className="relative aspect-[3/4] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-brand-pink/5">
                {product.images?.[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-gray-200" />
                  </div>
                )}
                {/* 퀵 뱃지 */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-gray-900 shadow-sm border border-white/50 uppercase">
                    신상
                  </span>
                </div>
              </div>
              <div className="px-1 space-y-1">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-brand-pink-dark">
                    {product.price?.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 인스타그램 배너 삭제됨 (히어로 버튼 그룹으로 통합) ────────── */}

      {/* ── 푸터 ────────────────────────────────────────────────── */}
      <Footer config={config} />

      {/* 하단 네비게이션 삭제됨 */}

      {/* ── 모달 및 바텀시트 ─────────────────────────────────────── */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-[11000] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeOrderHistory} />
          <div className="relative bg-white rounded-t-[3rem] max-h-[85vh] overflow-hidden animate-slide-up shadow-2xl">
            {/* 드래그 핸들 이미지 */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-100 rounded-full" />
            <div className="flex items-center justify-between px-8 pt-10 pb-6 border-b border-gray-50">
              <h3 className="text-xl font-black text-gray-900">주문 내역</h3>
              <button onClick={closeOrderHistory} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center active:scale-90 transition-all">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-96px)] p-6">
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

export default CustomerViewPhone;


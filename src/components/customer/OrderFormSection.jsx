import React, { useRef } from 'react';
import { Users, CreditCard, Smartphone, Tag, Check } from 'lucide-react';
import { Button, Input, Textarea, Card, Badge } from '../ui/Common';
import LazyImage from '../ui/LazyImage';
import { couponService } from '../../services';

const OrderFormSection = React.memo(({ 
  selectedProduct, 
  formData, 
  setFormData, 
  onSubmit, 
  loading,
  config,
  showAlert
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      showAlert('주소 검색 오류', '주소 검색 서비스가 로드되지 않았습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.', 'error');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.address;
        setFormData({ ...formData, address: fullAddress });
      }
    }).open();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert('쿠폰 입력', '쿠폰 코드를 입력해주세요.', 'info');
      return;
    }

    setValidatingCoupon(true);
    try {
      const purchaseAmount = selectedProduct.price * formData.quantity;
      const validation = await couponService.validateCoupon(couponCode, purchaseAmount, formData.phone);

      if (validation.valid) {
        const discount = await couponService.calculateDiscount(validation.coupon, purchaseAmount);
        setAppliedCoupon(validation.coupon);
        setDiscountAmount(discount);
        showAlert('쿠폰 적용 ✨', `${discount.toLocaleString()}원 할인되었습니다!`, 'success');
      } else {
        showAlert('쿠폰 오류', validation.reason, 'error');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
      showAlert('오류', '쿠폰 검증 중 오류가 발생했습니다.', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('APPLIED_COUPON_CODE');
    localStorage.removeItem('APPLIED_COUPON_DISCOUNT');
  };

  const finalPrice = (selectedProduct.price * formData.quantity) - discountAmount;

  if (!selectedProduct) return null;

  return (
    <section id="order-form" className="pb-12 sm:pb-16 animate-fade-in">
      <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center gap-3 text-brand-contrast">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
          <Users size={18} sm:size={22} />
        </div>
        주문자 정보 입력
      </h3>
      <Card variant="glass" className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-white/40 border-white/60 shadow-xl">
        {/* 미니 카트 요약 - 터치 시 이미지 확대 */}
        <div 
          onClick={() => setIsZoomed(true)}
          className="bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-white/80 flex items-center gap-4 sm:gap-5 relative overflow-hidden group cursor-pointer active:scale-95 transition-all shadow-sm"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white overflow-hidden shadow-sm flex-shrink-0 border border-brand-pink/5">
            {selectedProduct.image_url && <LazyImage src={selectedProduct.image_url} alt="" className="rounded-2xl" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-brand-contrast text-base sm:text-lg truncate mb-1">{selectedProduct.name}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="glass" className="bg-brand-pink/5 text-brand-pink-dark text-xs">수량 {formData.quantity}개</Badge>
              {formData.selectedOption && <Badge variant="pink">옵션: {formData.selectedOption}</Badge>}
            </div>
          </div>
          <div className="absolute right-4 sm:right-6 text-brand-pink/20 group-hover:text-brand-pink transition-all group-hover:scale-125">
            🔍
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Input label="받는 분 성함" placeholder="예: 홍길동" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="연락처" placeholder="010-0000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-brand-contrast/50 ml-3 uppercase tracking-widest">배송지 주소</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input readOnly placeholder="주소 검색을 눌러주세요" value={formData.address} className="bg-white/40 border-white/80 flex-1" />
              <Button variant="secondary" className="px-6 sm:px-8 rounded-2xl font-black text-base sm:text-lg shadow-lg whitespace-nowrap" onClick={handleAddressSearch}>검색</Button>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-brand-contrast/50 ml-3 uppercase tracking-widest">결제 수단</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                className={`p-3 sm:p-5 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
                  formData.paymentMethod === 'bank_transfer' 
                    ? 'border-brand-pink bg-brand-pink/10 text-brand-pink shadow-brand-pink/20' 
                    : 'border-white/60 bg-white/20 text-brand-contrast/40 hover:border-brand-pink/30 hover:text-brand-pink'
                }`}
              >
                <CreditCard size={18} sm:size={22} />
                <span>무통장</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'kakaopay' })}
                className={`p-3 sm:p-5 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
                  formData.paymentMethod === 'kakaopay' 
                    ? 'border-[#FEE500] bg-[#FEE500]/10 text-[#3c1e1e]' 
                    : 'border-white/60 bg-white/20 text-brand-contrast/40 hover:border-[#FEE500]/50 hover:text-[#3c1e1e]'
                }`}
              >
                <Smartphone size={18} sm:size={22} />
                <span>카카오페이</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'tosspay' })}
                className={`p-3 sm:p-5 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
                  formData.paymentMethod === 'tosspay' 
                    ? 'border-[#06C675] bg-[#06C675]/10 text-[#06C675]' 
                    : 'border-white/60 bg-white/20 text-brand-contrast/40 hover:border-[#06C675]/50 hover:text-[#06C675]'
                }`}
              >
                <Smartphone size={18} sm:size={22} />
                <span>토스</span>
              </button>
            </div>
          </div>
          {formData.paymentMethod === 'bank_transfer' && (
            <Input label="입금자명" placeholder="입금하실 분 성함" value={formData.depositName} onChange={e => setFormData({...formData, depositName: e.target.value})} />
          )}
          
          {/* 쿠폰 적용 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-400 ml-1">쿠폰 코드</label>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                <Tag size={16} sm:size={18} className="text-green-600" />
                <div className="flex-1">
                  <p className="font-black text-green-700 text-sm sm:text-base">{appliedCoupon.code}</p>
                  <p className="text-xs sm:text-sm text-green-600">{discountAmount.toLocaleString()}원 할인</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center hover:bg-green-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="쿠폰 코드 입력"
                  className="flex-1 px-3 sm:px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-bold text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="px-3 sm:px-4 py-2 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink-dark disabled:opacity-50 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  {validatingCoupon ? '확인 중...' : '적용'}
                </button>
              </div>
            )}
          </div>

          <Textarea label="기타 요청사항" placeholder="배송 메시지나 요청사항을 적어주세요" value={formData.requests} onChange={e => setFormData({...formData, requests: e.target.value})} />

          <Button variant="primary" className="w-full py-5 sm:py-6 text-lg sm:text-xl shadow-xl mt-6" type="submit" onClick={onSubmit} disabled={loading}>
            {loading ? '처리 중...' : `${finalPrice.toLocaleString()}원 주문하기`}
          </Button>

          {discountAmount > 0 && (
            <div className="text-center bg-green-50/50 py-2 sm:py-3 rounded-2xl border border-green-100 animate-pulse-subtle">
              <p className="text-xs sm:text-sm font-bold text-brand-contrast/40">
                원가 {(Number(selectedProduct.price || 0) * formData.quantity).toLocaleString()}원
                <span className="mx-2 text-brand-pink/20">|</span>
                <span className="text-green-600 font-black">할인 -{discountAmount.toLocaleString()}원</span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* 이미지 확대 오버레이 (Lightbox + Zoom) */}
      {isZoomed && (
        <ZoomableImage 
          src={selectedProduct.image_url} 
          name={selectedProduct.name} 
          onClose={() => setIsZoomed(false)} 
        />
      )}
    </section>
  );
});

// 확대/축소 및 드래그 기능이 포함된 별도 컴포넌트
const ZoomableImage = ({ src, name, onClose }) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [lastTouchTime, setLastTouchTime] = React.useState(0);
  const imageRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTouchTime < 300) { // 더블 탭 감지
        setScale(prev => (prev > 1 ? 1 : 2.5));
        setPosition({ x: 0, y: 0 });
      }
      setLastTouchTime(now);
    }
  };

  const handleTouchMove = (e) => {
    if (scale > 1 && e.touches.length === 1) {
      // 드래그 로직 (단순화)
      // 실제 구현 시 이전 좌표와의 차이를 계산하여 업데이트
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center overflow-hidden animate-fade-in"
      onClick={(e) => { if (scale === 1) onClose(); }}
    >
      <div className="absolute top-10 right-10 z-[2001] text-white p-2 bg-white/10 rounded-full" onClick={onClose}>
        <X size={24} />
      </div>

      <div 
        className="w-full h-full flex items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <img 
          ref={imageRef}
          src={src} 
          alt={name} 
          className="max-w-full max-h-[80vh] transition-transform duration-300 ease-out shadow-2xl"
          style={{ 
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            touchAction: 'none'
          }}
        />
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
        <p className="text-white font-black text-xl drop-shadow-lg">{name}</p>
        <p className="mt-2 text-white/50 text-xs">더블 탭: 확대/축소 | 한 번 탭: 닫기</p>
      </div>
    </div>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

OrderFormSection.displayName = 'OrderFormSection';

export default OrderFormSection;

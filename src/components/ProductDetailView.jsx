import React, { useState, useEffect, useRef } from 'react';
import { X, Package, Heart, Share2, ChevronLeft, Minus, Plus, Star, ZoomIn, Sparkles, Flame, Truck, Shield, Zap, Gift } from 'lucide-react';
import { Button, Stepper, Badge } from './ui/Common';
import LazyImage from './ui/LazyImage';
import ProductReviews from './ProductReviews';
import FlashSaleTimer from './FlashSaleTimer';

const ProductDetailView = ({ 
  product, 
  onClose, 
  onAddToCart, 
  showAlert, 
  config, 
  initialQuantity = 1, 
  initialOption = '', 
  customerPhone 
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showReviews, setShowReviews] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const imageContainerRef = useRef(null);

  const images = product?.image_url ? [product.image_url] : [];
  const price = product?.price || 0;
  const stock = product?.stock || 0;
  const options = Array.isArray(product?.options) ? product.options : (product?.options ? String(product.options).split(',').map(o => o.trim()) : []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsZoomed(true);
      const touchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      setZoomPosition(touchCenter);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && isZoomed) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newZoomLevel = Math.min(Math.max(distance / 100, 1), 3);
      setZoomLevel(newZoomLevel);
      
      const touchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      setZoomPosition(touchCenter);
    }
  };

  const handleTouchEnd = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleAddToCartClick = async () => {
    if (stock <= 0) {
      showAlert('품절', '현재 품절된 상품입니다.', 'error');
      return;
    }
    
    if (!customerPhone) {
      showAlert('로그인 필요', '장바구니에 추가하려면 먼저 연락처를 입력해주세요.', 'info');
      return;
    }

    try {
      await onAddToCart(product, quantity, selectedOption);
      showAlert('장바구니 추가 ✨', `${product.name}이 장바구니에 추가되었습니다.`, 'success');
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      showAlert('오류', '장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: product.name, 
          text: `${product.name} - ${Number(price).toLocaleString()}원`, 
          url: window.location.href 
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showAlert('링크 복사', '상품 링크가 클립보드에 복사되었습니다.', 'success');
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[5000] flex items-center justify-center animate-fade-in safe-bottom p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] h-[85vh] sm:h-[90vh] flex flex-col animate-slide-up shadow-2xl border border-white/20 relative overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gray-50/50 pointer-events-none" />


        {/* Header */}
        <div className="relative z-10 flex justify-between items-center p-4 sm:p-6">
          <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 glass border border-white/30 rounded-full flex items-center justify-center text-gray-900 hover:scale-110 active:scale-90 transition-all shadow-xl">
            <X size={18} sm:size={20} />
          </button>
          <div className="flex gap-2 sm:gap-3">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`w-10 h-10 sm:w-12 sm:h-12 glass border border-white/30 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl ${isLiked ? 'text-brand-pink-accent' : 'text-gray-900'}`}
            >
              <Heart size={18} sm:size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare} className="w-10 h-10 sm:w-12 sm:h-12 glass border border-white/30 rounded-full flex items-center justify-center text-gray-900 hover:scale-110 active:scale-90 transition-all shadow-xl">
              <Share2 size={16} sm:size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 pb-4 sm:pb-6 no-scrollbar">
          {/* Image Gallery */}
          <div 
            ref={imageContainerRef}
            className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2.5rem] overflow-hidden shadow-inner mb-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
              transition: isZoomed ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            {images.length > 0 ? (
              <LazyImage src={images[currentImageIndex]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <Package size={64} />
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-brand-pink-dark w-6' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            )}
            <button className="absolute top-4 right-4 w-10 h-10 glass border border-white/30 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* 도파밍 뱃지 */}
            {(product.is_limited || product.flash_sale_enabled) && (
              <div className="flex gap-2 mb-3 sm:mb-4 animate-slide-up">
                {product.is_limited && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-lg">
                    <Gift size={12} sm:size={14} />
                    <span>한정판</span>
                  </div>
                )}
                {product.flash_sale_enabled && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-lg animate-pulse">
                    <Zap size={12} sm:size={14} />
                    <span>선참순</span>
                  </div>
                )}
              </div>
            )}

            {/* 선참순 타이머 */}
            {product.flash_sale_enabled && product.flash_sale_end_time && (
              <div className="animate-slide-up">
                <FlashSaleTimer
                  endTime={product.flash_sale_end_time}
                  soldQuantity={product.flash_sale_sold_quantity || 0}
                  totalQuantity={product.flash_sale_quantity || 0}
                />
              </div>
            )}

            {/* Title & Price */}
            <div className="animate-slide-up">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight flex-1">{product.name}</h1>
                {stock > 0 && stock <= 5 && (
                  <Badge variant="neon" className="animate-pulse text-[10px] sm:text-xs">HOT</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-gradient-pink">{Number(price).toLocaleString()}원</p>
                {stock <= 10 && stock > 0 && (
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-brand-pink-dark font-bold animate-pulse">
                    <Flame size={10} sm:size={12} />
                    <span>{stock}개 남음</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-slide-up delay-100">
              <div className="glass rounded-2xl p-2 sm:p-3 text-center hover-lift">
                <Truck size={16} sm:size={20} className="mx-auto mb-1 text-brand-pink-dark" />
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-600">빠른배송</p>
              </div>
              <div className="glass rounded-2xl p-2 sm:p-3 text-center hover-lift">
                <Shield size={16} sm:size={20} className="mx-auto mb-1 text-brand-purple-dark" />
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-600">안전결제</p>
              </div>
              <div className="glass rounded-2xl p-2 sm:p-3 text-center hover-lift">
                <Sparkles size={16} sm:size={20} className="mx-auto mb-1 text-brand-blue-dark" />
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-600">프리미엄</p>
              </div>
            </div>

            {/* Options */}
            {options && options.length > 0 && (
              <div className="animate-slide-up delay-200">
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">옵션 선택</label>
                <div className="flex flex-wrap gap-2">
                  {options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(option)}
                      className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover-lift ${
                        selectedOption === option
                          ? 'gradient-primary text-white shadow-lg shadow-brand-pink/30'
                          : 'glass border-2 border-white/30 text-gray-600 hover:border-brand-pink-dark'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="animate-slide-up delay-300">
              <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">수량</label>
              <Stepper value={quantity} onChange={setQuantity} min={1} />
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 sm:gap-3 animate-slide-up delay-400">
              <Badge variant={stock > 0 ? 'pink' : 'gray'} className="text-[10px] sm:text-xs">
                {stock > 0 ? '재고 있음' : '품절'}
              </Badge>
              {stock > 0 && stock <= 5 && (
                <span className="text-[10px] sm:text-xs text-brand-pink-dark font-bold animate-pulse">⚡ 재고 부족! ({stock}개 남음)</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="glass rounded-2xl p-3 sm:p-5 animate-slide-up delay-500">
                <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">상품 설명</label>
                <p className="text-gray-600 font-medium leading-relaxed text-xs sm:text-sm">{product.description}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="animate-slide-up delay-600">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="w-full glass rounded-2xl p-3 sm:p-4 flex items-center justify-between hover-lift"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star size={14} sm:size={18} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-gray-900 block text-sm sm:text-base">상품 리뷰</span>
                    <span className="text-[10px] sm:text-xs text-gray-400">고객들의 솔직한 후기</span>
                  </div>
                </div>
                <ChevronLeft size={16} sm:size={20} className={`transition-transform text-gray-400 ${showReviews ? 'rotate-180' : ''}`} />
              </button>
              {showReviews && <ProductReviews productId={product.id} showAlert={showAlert} customerPhone={customerPhone} />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-4 sm:p-6 bg-white/20 backdrop-blur-md border-t border-white/30">
          <Button
            variant="primary"
            size="xl"
            className="w-full shadow-2xl shadow-brand-pink/40 text-sm sm:text-base"
            onClick={handleAddToCartClick}
            disabled={stock <= 0}
          >
            {stock <= 0 ? '품절된 상품입니다' : '🛍️ 장바구니에 담기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;

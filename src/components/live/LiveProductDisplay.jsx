import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../ui/ProductCard';

/**
 * LiveProductDisplay - 수동 스와이프 + 물 흐르듯 부드러운 슬라이드 + 흔들림 방지
 */
const LiveProductDisplay = ({ products = [], onOrderOpen, onProductClick }) => {
  const CARD_WIDTH = 220;
  const GAP = 12;
  const TOTAL_WIDTH = CARD_WIDTH + GAP;

  // 무한 루프를 위한 복제 ([마지막, ...원본, 처음])
  const displayProducts = products.length > 1 
    ? [products[products.length - 1], ...products, products[0]] 
    : products;

  const [currentIndex, setCurrentIndex] = useState(products.length > 1 ? 1 : 0);
  const [transitionStyle, setTransitionStyle] = useState('transform 8000ms linear');
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const timerRef = useRef(null);
  const isTransitioning = useRef(false);
  const touchStartX = useRef(0);
  const touchMoveX = useRef(0);
  const isDragging = useRef(false);

  // 자동 슬라이드
  useEffect(() => {
    if (products.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (!isTransitioning.current) {
        setTransitionStyle('transform 8000ms linear');
        setCurrentIndex(prev => prev + 1);
      }
    }, 8000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [products.length, isPaused]);

  // 무한 루프 점프 처리
  useEffect(() => {
    if (products.length <= 1) return;
    const total = displayProducts.length;
    
    if (currentIndex === total - 1 || currentIndex === 0) {
      isTransitioning.current = true;
      const timer = setTimeout(() => {
        setTransitionStyle('none');
        setCurrentIndex(currentIndex === 0 ? total - 2 : 1);
        isTransitioning.current = false;
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayProducts.length, products.length]);

  // 터치 이벤트 (영상 흔들림 방지 포함)
  const handleTouchStart = (e) => {
    // 이벤트 전파 방지로 영상 플레이어 영향 차단
    e.stopPropagation();
    if (isTransitioning.current) return;
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
    setTransitionStyle('none');
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    setDragOffset(0);
    setTransitionStyle('transform 600ms cubic-bezier(0.25, 1, 0.5, 1)');
    
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentIndex(prev => prev + 1);
      else setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(currentIndex);
    }
    
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (!products || products.length === 0) return null;

  const activeIndicatorIndex = products.length > 1 
    ? (currentIndex === 0 ? products.length - 1 : (currentIndex === displayProducts.length - 1 ? 0 : currentIndex - 1))
    : 0;

  return (
    <div 
      id="live-product-card-container" 
      className="flex flex-col gap-2 pointer-events-auto w-full animate-fade-in select-none"
      style={{ touchAction: 'pan-x' }} // 수직 흔들림 방지
    >
      <div 
        className="relative w-full overflow-hidden rounded-xl shadow-2xl border-0 ring-0 outline-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
      >
        <div 
          className="flex border-0 outline-none" 
          style={{ 
            transform: `translateX(calc(-${currentIndex * 220}px + ${dragOffset}px))`,
            transition: transitionStyle,
            gap: '0', // index 슬라이딩을 위해 내부 gap은 0으로 하고 카드 내부 패딩으로 조절
            border: 'none',
            outline: 'none'
          }}
        >
          {displayProducts.map((prod, idx) => (
            <div key={`${prod.id}-${idx}`} className="w-[220px] flex-shrink-0 px-1.5 py-1">
              <ProductCard 
                product={prod} 
                variant="live" 
                onClick={() => onProductClick ? onProductClick(prod) : onOrderOpen()}
                onActionClick={() => onProductClick ? onProductClick(prod) : onOrderOpen()}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 (하단) */}
      {products.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-0.5">
          {products.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 rounded-full transition-all duration-500 ${i === activeIndicatorIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}


    </div>
  );
};

export default LiveProductDisplay;

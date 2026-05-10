import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../ui/ProductCard';

/**
 * LiveProductDisplay - requestAnimationFrame 기반의 끊김 없는 무한 흐름 티커
 */
const LiveProductDisplay = ({ products = [], onOrderOpen, onProductClick }) => {
  const CARD_WIDTH = 220; // 카드 너비
  const GAP = 0; // 카드 간격 (이미 ProductCard 내부 패딩으로 조절됨)
  const ITEM_WIDTH = CARD_WIDTH + GAP;
  
  // 무한 루프를 위해 최소 2세트 이상의 아이템 복제
  const displayProducts = products.length > 1 ? [...products, ...products, ...products] : products;
  const TOTAL_SET_WIDTH = products.length * ITEM_WIDTH;

  const [activeIndicatorIndex, setActiveIndicatorIndex] = useState(0);
  
  const containerRef = useRef(null);
  const scrollPosRef = useRef(0);
  const requestRef = useRef();
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const SPEED = 0.5; // 프레임당 이동 픽셀 (속도 조절 가능)

  const animate = (time) => {
    if (lastTimeRef.current !== undefined && !isDraggingRef.current && products.length > 1) {
      // 자동 흐름 계산
      scrollPosRef.current -= SPEED;
      
      // 심리스 루프 처리 (첫 번째 세트가 다 지나가면 즉시 좌표 보정)
      if (scrollPosRef.current <= -TOTAL_SET_WIDTH) {
        scrollPosRef.current += TOTAL_SET_WIDTH;
      }
      
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${scrollPosRef.current}px)`;
      }

      // 인디케이터 업데이트 (매 프레임할 필요는 없으나 로직상 현재 위치 계산)
      const absPos = Math.abs(scrollPosRef.current) % TOTAL_SET_WIDTH;
      const index = Math.floor((absPos + ITEM_WIDTH / 2) / ITEM_WIDTH) % products.length;
      setActiveIndicatorIndex(index);
    }
    
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (products.length > 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [products.length]);

  // 터치 핸들러
  const handleTouchStart = (e) => {
    e.stopPropagation();
    if (products.length <= 1) return;
    
    isDraggingRef.current = true;
    // 터치 시작 지점과 현재 스크롤 위치의 관계 기록
    startXRef.current = e.touches[0].clientX - scrollPosRef.current;
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    
    const currentX = e.touches[0].clientX;
    scrollPosRef.current = currentX - startXRef.current;
    
    // 드래그 시에도 루프 경계 처리
    if (scrollPosRef.current <= -TOTAL_SET_WIDTH * 2) {
        scrollPosRef.current += TOTAL_SET_WIDTH;
        startXRef.current += TOTAL_SET_WIDTH;
    } else if (scrollPosRef.current > 0) {
        scrollPosRef.current -= TOTAL_SET_WIDTH;
        startXRef.current -= TOTAL_SET_WIDTH;
    }

    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${scrollPosRef.current}px)`;
    }

    // 드래그 중에도 인디케이터 갱신
    const absPos = Math.abs(scrollPosRef.current) % TOTAL_SET_WIDTH;
    const index = Math.floor((absPos + ITEM_WIDTH / 2) / ITEM_WIDTH) % products.length;
    setActiveIndicatorIndex(index);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    isDraggingRef.current = false;
  };

  if (!products || products.length === 0) return null;

  return (
    <div 
      className="flex flex-col gap-2 pointer-events-auto w-full animate-fade-in select-none"
      style={{ touchAction: 'pan-y' }} // 수평 드래그 허용, 수직 스크롤 방지
    >
      <div 
        className="relative w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={containerRef}
          className="flex will-change-transform" 
          style={{ 
            transform: `translateX(${scrollPosRef.current}px)`,
            gap: '0'
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

      {/* 인디케이터 */}
      {products.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-0.5">
          {products.map((_, i) => (
            <div 
              key={i} 
              className={`h-0.5 rounded-full transition-all duration-300 ${i === activeIndicatorIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveProductDisplay;

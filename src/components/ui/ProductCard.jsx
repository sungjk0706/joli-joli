import React from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { cn } from '../../utils/cn';
import LazyImage from './LazyImage';

/**
 * ProductCard - Joli-Joli 통합 프리미엄 상품 카드
 * @param {Object} product - 상품 데이터
 * @param {'default' | 'live' | 'compact'} variant - 카드 스타일 변형
 * @param {Function} onClick - 카드 클릭 핸들러 (상세보기 등)
 * @param {Function} onActionClick - 액션 버튼 클릭 핸들러 (장바구니 담기 등)
 * @param {string} className - 추가 스타일 클래스
 */
const ProductCard = ({ 
  product, 
  variant = 'default', 
  onClick, 
  onActionClick, 
  className 
}) => {
  if (!product) return null;

  // 1. 라이브 화면용 카드 (작고 가로형 느낌)
  if (variant === 'live') {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "group relative flex items-center gap-3 p-2 bg-white/95 backdrop-blur-sm rounded-xl cursor-pointer active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg border-0 outline-none",
          className
        )}
      >
        {/* 이미지 섹션 */}
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 shadow-inner border-0">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
              <ShoppingBag size={20} />
            </div>
          )}
        </div>

        {/* 정보 섹션 */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-[11px] font-black leading-tight truncate mb-0.5">
            {product.name}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-brand-pink-dark text-[13px] font-black tabular-nums">
              {Number(product.price || 0).toLocaleString()}원
            </p>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">joli</span>
          </div>
        </div>

        {/* 액션 아이콘 */}
        <div 
          onClick={(e) => {
            if (onActionClick) {
              e.stopPropagation();
              onActionClick(product);
            }
          }}
          className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-pink-light hover:text-brand-pink-dark transition-colors border-0"
        >
          <ShoppingCart size={15} />
        </div>
      </div>
    );
  }

  // 2. 가로 리스트형 카드 (모바일 상품 목록 등)
  if (variant === 'list-item') {
    return (
      <div 
        onClick={onClick}
        className={cn(
          "group relative flex items-center gap-4 p-4 bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-all active:scale-[0.98] duration-300",
          className
        )}
      >
        {/* 상품 이미지 */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={24} /></div>
          )}
          
          {/* 방송 중 표시 (Prop으로 전달받거나 데이터에서 확인) */}
          {product.isOnAir && (
            <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-black px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm z-10">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              ON AIR
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-900 font-bold text-base truncate mb-1 group-hover:text-brand-pink-dark transition-colors">{product.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-brand-pink font-black text-lg tabular-nums">{Number(product.price || 0).toLocaleString()}원</span>
          </div>
        </div>

        {/* 액션 아이콘 */}
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
          product.isOnAir ? "bg-brand-pink text-white shadow-lg" : "bg-gray-50 text-gray-400"
        )}>
          {product.isOnAir ? <ShoppingBag size={18} /> : <ShoppingCart size={18} />}
        </div>
      </div>
    );
  }

  // 3. 기본 격자형 카드 (쇼핑몰 메인 리스트용)
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex flex-col bg-white rounded-[2rem] p-3 sm:p-4 cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-brand-pink/10 border-0 outline-none",
        className
      )}
    >
      {/* 이미지 섹션 */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3 sm:mb-4 border-0">
        {product.image_url ? (
          <LazyImage 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <ShoppingBag size={40} />
          </div>
        )}
        
        {/* 품절 표시 */}
        {product.is_out_of_stock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1 bg-gray-900/80 text-white text-[10px] font-black rounded-full tracking-widest">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* 정보 섹션 */}
      <div className="flex-1 space-y-1 sm:space-y-1.5 px-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1 group-hover:text-brand-pink-dark transition-colors">
            {product.name}
          </h4>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-1">
          <p className="text-brand-pink-dark font-black text-base sm:text-xl tabular-nums">
            {Number(product.price || 0).toLocaleString()}원
          </p>
          
          <button
            onClick={(e) => {
              if (onActionClick) {
                e.stopPropagation();
                onActionClick(product);
              }
            }}
            disabled={product.is_out_of_stock}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-pink text-white flex items-center justify-center hover:bg-brand-pink-dark transition-all duration-300 shadow-lg shadow-brand-pink/20 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none border-0"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* 브랜드 뱃지 (Subtle) */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <span className="px-2 py-0.5 bg-white/80 backdrop-blur-md rounded-md text-[8px] font-black text-gray-400 border border-gray-100/50 uppercase tracking-widest shadow-sm">
          Boutique
        </span>
      </div>
    </div>
  );
};

export default ProductCard;

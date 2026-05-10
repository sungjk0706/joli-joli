import React from 'react';
import { X, ShoppingBag, ChevronRight, Radio } from 'lucide-react';
import ProductCard from '../ui/ProductCard';

/**
 * LiveProductListView
 * 매장 전체 상품 목록을 보여주며, 방송 중인 상품은 별도 표시(ON AIR)를 해주는 프리미엄 시트
 */
const LiveProductListView = ({ 
  isOpen, 
  onClose, 
  products = [], 
  liveProductIds = [], // 방송 중인 상품 ID 목록
  onProductClick 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[7800] flex flex-col justify-end">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* 바텀 시트 */}
      <div className="relative z-[2600] w-full max-h-[75dvh] bg-white/95 backdrop-blur-2xl rounded-t-[3rem] border-t border-white/20 animate-slide-up flex flex-col overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
        
        {/* 헤더 */}
        <div className="w-full pt-4 pb-2 flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full mb-4" onClick={onClose} />
          <div className="flex items-center justify-between w-full px-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="text-gray-900 font-black text-2xl tracking-tight">Our Collection</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Joli Joli Boutique</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-4 no-scrollbar">
          {products.length > 0 ? (
            products.map((product, index) => {
              const isOnAir = liveProductIds.includes(String(product.id));
              
              return (
                <ProductCard
                  key={product.id}
                  product={{ ...product, isOnAir }}
                  variant="list-item"
                  onClick={() => onProductClick(product)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-fade-in"
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-lg">등록된 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveProductListView;

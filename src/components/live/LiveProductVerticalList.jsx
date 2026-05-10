import React from 'react';
import ProductCard from '../ui/ProductCard';
import { ShoppingBag } from 'lucide-react';

const LiveProductVerticalList = ({ products = [], onProductClick }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-900/80 backdrop-blur-xl border-l border-white/5">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <ShoppingBag size={20} className="text-brand-pink" />
        <h3 className="text-white font-black text-lg tracking-tight">전시 상품</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {products.map((prod) => (
          <div key={prod.id} className="w-full">
            <ProductCard 
              product={prod} 
              variant="live" 
              onClick={() => onProductClick(prod)}
              onActionClick={() => onProductClick(prod)}
            />
          </div>
        ))}
        <div className="h-20" /> {/* Bottom spacing */}
      </div>
    </div>
  );
};

export default LiveProductVerticalList;

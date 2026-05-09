import React from 'react';

const LiveProductCard = ({ activeProduct, chatMessages, onOrderOpen }) => {
  return (
    <div className="flex-1 flex flex-col gap-3 pointer-events-auto max-w-[70%]">
      <div className="flex items-center gap-2">
        <span className="text-[#FFD700] text-[16px] font-black drop-shadow-lg">
          {activeProduct?.name || '상품 로딩 중...'}
        </span>
      </div>
      <div className="flex flex-col space-y-1 max-h-32 overflow-hidden mask-gradient-top">
         {chatMessages.slice(-4).map((m, idx) => (
           <div key={idx} className="flex gap-2 items-center">
             <span className="text-white/70 font-bold text-[13px] whitespace-nowrap">{m.user}</span>
             <span className="text-white text-[14px] font-bold drop-shadow-md">{m.text}</span>
           </div>
         ))}
      </div>
      <div 
        onClick={() => activeProduct?.stock > 0 && onOrderOpen()}
        className="bg-white rounded-lg p-1 flex items-center gap-2 w-full max-w-[280px] shadow-2xl pointer-events-auto active:scale-95 transition-all cursor-pointer"
      >
        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative">
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-1 py-0.5 rounded-br-md z-10">특가</div>
          {activeProduct?.image_url ? (
            <img src={activeProduct.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-gray-900 text-[11px] font-bold line-clamp-2 leading-tight">{activeProduct?.name || '불러오는 중...'}</p>
          <p className="text-red-600 text-[12px] font-black mt-0.5">{activeProduct?.price ? Number(activeProduct.price).toLocaleString() + '원' : '0원'}</p>
        </div>
        <div className="w-10 h-10 border-l border-gray-100 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-gray-900 text-[14px] font-black">🛒</span>
        </div>
      </div>
    </div>
  );
};

export default LiveProductCard;

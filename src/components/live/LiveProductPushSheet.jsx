import React, { useState } from 'react';
import { X, Radio, Check } from 'lucide-react';

const LiveProductPushSheet = ({ 
  isOpen, 
  onClose, 
  allProducts, 
  onPushToLive 
}) => {
  const [selectedIdsForPush, setSelectedIdsForPush] = useState([]);
  const [metadata, setMetadata] = useState({}); // { productId: { emoji: '', tag: '' } }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[7200] flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-xl glass-gradient rounded-t-[3rem] animate-slide-up border border-white/40" onClick={e => e.stopPropagation()} style={{ height: '75vh' }}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
            <h3 className="font-black text-2xl flex items-center gap-2 text-gradient-pink"><Radio size={24} /> 방송 상품 송출</h3>
            <button onClick={onClose} className="w-11 h-11 glass rounded-full flex items-center justify-center text-gray-900"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pb-10">
            {allProducts?.length > 0 ? (
              allProducts.map(prod => {
                const isSelected = selectedIdsForPush.includes(prod.id);
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => setSelectedIdsForPush(prev => isSelected ? prev.filter(id => id !== prod.id) : [...prev, prod.id])} 
                    className={`p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 cursor-pointer ${isSelected ? 'border-brand-pink bg-brand-pink/5 shadow-md' : 'border-gray-50 bg-gray-50/50'}`}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200">
                      {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black truncate ${isSelected ? 'text-brand-pink' : 'text-gray-900'}`}>{prod.name}</p>
                      <p className="text-gray-400 font-bold text-xs">{Number(prod.price).toLocaleString()}원</p>
                      
                      {isSelected && (
                        <div className="mt-3 flex gap-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                          <input 
                            type="text" 
                            placeholder="이모지 (예: ✨)" 
                            value={metadata[prod.id]?.emoji || ''}
                            onChange={(e) => setMetadata(prev => ({ ...prev, [prod.id]: { ...prev[prod.id], emoji: e.target.value } }))}
                            className="w-16 px-3 py-2 bg-white rounded-xl border border-brand-pink/20 text-sm focus:outline-none focus:border-brand-pink"
                          />
                          <input 
                            type="text" 
                            placeholder="강조 문구 (예: 오늘만 특가!)" 
                            value={metadata[prod.id]?.tag || ''}
                            onChange={(e) => setMetadata(prev => ({ ...prev, [prod.id]: { ...prev[prod.id], tag: e.target.value } }))}
                            className="flex-1 px-3 py-2 bg-white rounded-xl border border-brand-pink/20 text-sm focus:outline-none focus:border-brand-pink"
                          />
                        </div>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-brand-pink bg-brand-pink' : 'border-gray-200'}`}>
                      {isSelected && <Check size={14} className="text-brand-pink-contrast" />}
                    </div>
                  </div>
                );
              })
            ) : (<div className="text-center py-20 text-gray-400">등록된 상품이 없습니다.</div>)}
          </div>
          <div className="pt-4 border-t border-gray-100 flex-shrink-0">
            <button 
              onClick={() => { 
                const pushedData = allProducts
                  .filter(p => selectedIdsForPush.includes(p.id))
                  .map(p => ({
                    id: String(p.id),
                    emoji: metadata[p.id]?.emoji || '✨',
                    tag: metadata[p.id]?.tag || ''
                  }));
                onPushToLive(pushedData); 
                setSelectedIdsForPush([]); 
                setMetadata({});
                onClose(); 
              }} 
              disabled={selectedIdsForPush.length === 0} 
              className="w-full py-5 bg-brand-pink text-brand-pink-contrast rounded-[2rem] font-black text-lg shadow-xl disabled:opacity-50"
            >
              {selectedIdsForPush.length}개 상품 즉시 송출하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveProductPushSheet;

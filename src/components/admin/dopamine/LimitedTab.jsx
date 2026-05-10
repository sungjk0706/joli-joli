import React from 'react';
import { Gift } from 'lucide-react';

const LimitedTab = ({ 
  products, 
  limitedProducts, 
  selectedLimitedProduct, 
  limitedSettings, 
  setLimitedSettings,
  onSelectProduct,
  onSaveSettings,
  onToggleLimited 
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl admin-title">한정판 관리</h2>
      <p className="admin-text-secondary text-sm sm:text-base">한정된 수량만 판매하는 상품을 관리합니다.</p>
      
      {/* 상품 선택 및 설정 폼 */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-sm">
        <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">한정판 설정</h3>
        <form onSubmit={onSaveSettings} className="space-y-3 sm:space-y-4">
          <div>
            <label className="admin-label block mb-2 ml-1">상품 선택</label>
            <select
              value={selectedLimitedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === parseInt(e.target.value));
                if (product) onSelectProduct(product);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-purple-500 [&>option]:text-gray-900 [&>option]:bg-white"
              required
            >
              <option value="">상품 선택</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          {selectedLimitedProduct && (
            <>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 sm:gap-2 font-bold text-gray-300 text-xs sm:text-sm">
                  <Gift size={14} sm:size={16} className="text-purple-500" />
                  한정판 활성화
                </label>
                <button
                  type="button"
                  onClick={() => setLimitedSettings({ ...limitedSettings, enabled: !limitedSettings.enabled })}
                  className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors ${limitedSettings.enabled ? 'bg-purple-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all ${limitedSettings.enabled ? 'right-0.5 sm:right-1 bg-white' : 'left-0.5 sm:left-1 bg-white'}`} />
                </button>
              </div>

              {limitedSettings.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="admin-label block mb-1">한정 수량 설정</label>
                    <input
                      type="number"
                      value={limitedSettings.quantity}
                      onChange={e => setLimitedSettings({ ...limitedSettings, quantity: e.target.value })}
                      placeholder="한정판 수량"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-2 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-brand-pink-contrast py-3 sm:py-4 rounded-xl font-black text-sm sm:text-lg hover:scale-105 transition-all"
              >
                설정 저장
              </button>
            </>
          )}
        </form>
      </div>
      
      {/* 한정판 상품 목록 */}
      {limitedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100">
          <Gift size={36} sm:size={48} className="mx-auto text-gray-200 mb-3 sm:mb-4" />
          <p className="admin-text-base text-sm sm:text-base">한정판 상품이 없습니다.</p>
          <p className="admin-text-secondary text-[10px] sm:text-sm mt-1 sm:mt-2">위에서 상품을 선택하고 한정판을 설정해주세요.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {limitedProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-purple-500/20 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <h3 className="admin-title text-sm sm:text-lg">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-sm">
                    <span className="text-purple-600 font-black">
                      <Gift size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                      한정 수량: {product.limited_quantity}
                    </span>
                    <span className="admin-text-base">
                      현재 재고: {product.stock}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onToggleLimited(product)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-base transition-all ${
                    product.is_limited 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-brand-pink-contrast' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {product.is_limited ? '한정판' : '일반'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LimitedTab;

import React from 'react';
import { Zap, Clock } from 'lucide-react';

const FlashSaleTab = ({ 
  products, 
  flashSaleProducts, 
  selectedFlashProduct, 
  flashSettings, 
  setFlashSettings,
  onSelectProduct,
  onSaveSettings,
  onToggleFlashSale 
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl admin-title">선참순 판매 관리</h2>
      <p className="admin-text-secondary text-sm sm:text-base">특정 기간 동안 한정 수량만큼만 판매하는 기능입니다.</p>
      
      {/* 상품 선택 및 설정 폼 */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-sm">
        <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">선참순 설정</h3>
        <form onSubmit={onSaveSettings} className="space-y-3 sm:space-y-4">
          <div>
            <label className="admin-label block mb-2 ml-1">상품 선택</label>
            <select
              value={selectedFlashProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === parseInt(e.target.value));
                if (product) onSelectProduct(product);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-orange-500 [&>option]:text-gray-900 [&>option]:bg-white"
              required
            >
              <option value="">상품 선택</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          {selectedFlashProduct && (
            <>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 sm:gap-2 font-bold text-gray-300 text-sm sm:text-base">
                  <Zap size={16} sm:size={18} className="text-orange-500" />
                  선참순 판매 활성화
                </label>
                <button
                  type="button"
                  onClick={() => setFlashSettings({ ...flashSettings, enabled: !flashSettings.enabled })}
                  className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors ${flashSettings.enabled ? 'bg-orange-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 sm:top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all ${flashSettings.enabled ? 'right-0.5 sm:right-1 bg-white' : 'left-0.5 sm:left-1 bg-white'}`} />
                </button>
              </div>

              {flashSettings.enabled && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="admin-label block mb-1">시작 시간</label>
                      <input
                        type="datetime-local"
                        value={flashSettings.startTime}
                        onChange={e => setFlashSettings({ ...flashSettings, startTime: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-2 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="admin-label block mb-1">종료 시간</label>
                      <input
                        type="datetime-local"
                        value={flashSettings.endTime}
                        onChange={e => setFlashSettings({ ...flashSettings, endTime: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-2 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label block mb-1">선참순 수량</label>
                    <input
                      type="number"
                      value={flashSettings.quantity}
                      onChange={e => setFlashSettings({ ...flashSettings, quantity: e.target.value })}
                      placeholder="선참순으로 판매할 수량"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-2 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-brand-pink-contrast py-3 sm:py-4 rounded-xl font-black text-sm sm:text-lg hover:scale-105 transition-all"
              >
                설정 저장
              </button>
            </>
          )}
        </form>
      </div>
      
      {/* 선참순 상품 목록 */}
      {flashSaleProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100">
          <Zap size={36} sm:size={48} className="mx-auto text-gray-200 mb-3 sm:mb-4" />
          <p className="admin-text-base text-sm sm:text-base">선참순 판매 중인 상품이 없습니다.</p>
          <p className="admin-text-secondary text-[10px] sm:text-sm mt-1 sm:mt-2">위에서 상품을 선택하고 선참순 판매를 설정해주세요.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {flashSaleProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-orange-500/20 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <h3 className="admin-title text-sm sm:text-lg">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-sm">
                    <span className="text-orange-600 font-black">
                      <Clock size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                      {new Date(product.flash_sale_start_time).toLocaleDateString('ko-KR')} ~ {new Date(product.flash_sale_end_time).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="admin-text-base">
                      판매량: {product.flash_sale_sold_quantity || 0} / {product.flash_sale_quantity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onToggleFlashSale(product)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-base transition-all ${
                    product.flash_sale_enabled 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-brand-pink-contrast' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {product.flash_sale_enabled ? '활성화' : '비활성화'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashSaleTab;

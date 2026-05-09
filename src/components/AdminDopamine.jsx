import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { dopamineService, productService, couponService } from '../services';
import { Clock, Users, Trophy, Zap, Gift, Plus, Trash2, CheckCircle, XCircle, Tag, MessageSquare, Trash, Check, Edit2, X, Send } from 'lucide-react';

const AdminDopamine = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState('flash'); // flash | limited | raffle | coupons
  const [products, setProducts] = useState([]);
  
  // 선참순 상태
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [selectedFlashProduct, setSelectedFlashProduct] = useState(null);
  const [flashSettings, setFlashSettings] = useState({
    enabled: false,
    startTime: '',
    endTime: '',
    quantity: ''
  });
  
  // 한정판 상태
  const [limitedProducts, setLimitedProducts] = useState([]);
  const [selectedLimitedProduct, setSelectedLimitedProduct] = useState(null);
  const [limitedSettings, setLimitedSettings] = useState({
    enabled: false,
    quantity: ''
  });
  
  // 추첨 상태
  const [raffles, setRaffles] = useState([]);
  const [newRaffle, setNewRaffle] = useState({
    productId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    winnerCount: '1'
  });

  // 쿠폰 상태
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
    loadRaffles();
    loadCoupons();
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
      
      // 선참순 상품 필터링
      const flash = data.filter(p => p.flash_sale_enabled);
      setFlashSaleProducts(flash);
      
      // 한정판 상품 필터링
      const limited = data.filter(p => p.is_limited);
      setLimitedProducts(limited);
    } catch (error) {
      console.error('상품 로드 실패:', error);
    }
  };

  const loadRaffles = async () => {
    try {
      const data = await dopamineService.getRaffles();
      setRaffles(data);
    } catch (error) {
      console.error('추첨 로드 실패:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      console.error('쿠폰 로드 실패:', error);
    }
  };

  const handleSelectFlashProduct = (product) => {
    setSelectedFlashProduct(product);
    setFlashSettings({
      enabled: product.flash_sale_enabled || false,
      startTime: product.flash_sale_start_time ? product.flash_sale_start_time.slice(0, 16) : '',
      endTime: product.flash_sale_end_time ? product.flash_sale_end_time.slice(0, 16) : '',
      quantity: product.flash_sale_quantity || ''
    });
  };

  const handleSaveFlashSettings = async (e) => {
    e.preventDefault();
    if (!selectedFlashProduct) return;
    try {
      await dopamineService.updateFlashSaleSettings(selectedFlashProduct.id, {
        enabled: flashSettings.enabled,
        startTime: flashSettings.startTime,
        endTime: flashSettings.endTime,
        quantity: parseInt(flashSettings.quantity)
      });
      showAlert('설정 저장 완료', '선참순 판매 설정이 저장되었습니다.', 'success');
      loadProducts();
      setSelectedFlashProduct(null);
    } catch (error) {
      showAlert('설정 저장 실패', error.message, 'error');
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...couponFormData,
        discount_value: parseInt(couponFormData.discount_value),
        min_purchase: couponFormData.min_purchase ? parseInt(couponFormData.min_purchase) : 0,
        max_discount: couponFormData.max_discount ? parseInt(couponFormData.max_discount) : null,
        usage_limit: couponFormData.usage_limit ? parseInt(couponFormData.usage_limit) : null,
      };

      if (editingCoupon) {
        await couponService.update(editingCoupon.id, data);
        showAlert('수정 완료', '쿠폰이 수정되었습니다.', 'success');
      } else {
        await couponService.create(data);
        showAlert('생성 완료', '새 쿠폰이 생성되었습니다.', 'success');
      }

      setShowCouponForm(false);
      setEditingCoupon(null);
      resetCouponForm();
      loadCoupons();
    } catch (error) {
      showAlert('오류', error.message, 'error');
    }
  };

  const resetCouponForm = () => {
    setCouponFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : '',
      is_active: coupon.is_active,
    });
    setShowCouponForm(true);
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await couponService.update(coupon.id, { is_active: !coupon.is_active });
      loadCoupons();
    } catch (error) {
      showAlert('오류', '상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('이 쿠폰을 정말 삭제하시겠습니까?')) return;
    try {
      await couponService.delete(id);
      showAlert('삭제 완료', '쿠폰이 삭제되었습니다.', 'success');
      loadCoupons();
    } catch (error) {
      showAlert('오류', '삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 선참순 설정 토글
  const handleToggleFlashSale = async (product) => {
    try {
      const newEnabled = !product.flash_sale_enabled;
      await dopamineService.updateFlashSaleSettings(product.id, {
        enabled: newEnabled,
        startTime: product.flash_sale_start_time,
        endTime: product.flash_sale_end_time,
        quantity: product.flash_sale_quantity || 10
      });
      showAlert('설정 변경 완료', newEnabled ? '선참순 판매가 활성화되었습니다.' : '선참순 판매가 비활성화되었습니다.', 'success');
      loadProducts();
    } catch (error) {
      showAlert('설정 변경 실패', error.message, 'error');
    }
  };

  // 한정판 상품 선택
  const handleSelectLimitedProduct = (product) => {
    setSelectedLimitedProduct(product);
    setLimitedSettings({
      enabled: product.is_limited || false,
      quantity: product.limited_quantity || ''
    });
  };

  // 한정판 설정 저장
  const handleSaveLimitedSettings = async (e) => {
    e.preventDefault();
    if (!selectedLimitedProduct) return;
    
    try {
      await dopamineService.updateLimitedSettings(selectedLimitedProduct.id, limitedSettings.enabled, parseInt(limitedSettings.quantity));
      showAlert('설정 저장 완료', '한정판 설정이 저장되었습니다.', 'success');
      loadProducts();
      setSelectedLimitedProduct(null);
    } catch (error) {
      showAlert('설정 저장 실패', error.message, 'error');
    }
  };

  // 한정판 설정 토글
  const handleToggleLimited = async (product) => {
    try {
      const newLimited = !product.is_limited;
      await dopamineService.updateLimitedSettings(product.id, newLimited, product.limited_quantity || 100);
      showAlert('설정 변경 완료', newLimited ? '한정판으로 설정되었습니다.' : '한정판이 해제되었습니다.', 'success');
      loadProducts();
    } catch (error) {
      showAlert('설정 변경 실패', error.message, 'error');
    }
  };

  // 추첨 생성
  const handleCreateRaffle = async (e) => {
    e.preventDefault();
    try {
      await dopamineService.createRaffle({
        productId: parseInt(newRaffle.productId),
        title: newRaffle.title,
        description: newRaffle.description,
        startTime: new Date(newRaffle.startTime).toISOString(),
        endTime: new Date(newRaffle.endTime).toISOString(),
        maxParticipants: newRaffle.maxParticipants ? parseInt(newRaffle.maxParticipants) : null,
        winnerCount: parseInt(newRaffle.winnerCount)
      });
      showAlert('추첨 생성 완료', '새로운 추첨 이벤트가 생성되었습니다.', 'success');
      setNewRaffle({
        productId: '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        maxParticipants: '',
        winnerCount: '1'
      });
      loadRaffles();
    } catch (error) {
      showAlert('추첨 생성 실패', error.message, 'error');
    }
  };

  // 추첨 당첨자 선정
  const handleSelectWinners = async (raffleId) => {
    try {
      const winners = await dopamineService.selectRaffleWinners(raffleId);
      showAlert('당첨자 선정 완료', `${winners.length}명의 당첨자가 선정되었습니다.`, 'success');
      loadRaffles();
    } catch (error) {
      showAlert('당첨자 선정 실패', error.message, 'error');
    }
  };

  // 추첨 삭제
  const handleDeleteRaffle = async (raffleId) => {
    try {
      await dopamineService.deleteRaffle(raffleId);
      showAlert('추첨 삭제 완료', '추첨 이벤트가 삭제되었습니다.', 'success');
      loadRaffles();
    } catch (error) {
      showAlert('추첨 삭제 실패', error.message, 'error');
    }
  };

  // 추첨 활성/비활성 토글
  const handleToggleRaffleActive = async (raffle) => {
    try {
      await dopamineService.toggleRaffleActive(raffle.id, !raffle.is_active);
      showAlert('상태 변경 완료', !raffle.is_active ? '추첨이 활성화되었습니다.' : '추첨이 비활성화되었습니다.', 'success');
      loadRaffles();
    } catch (error) {
      showAlert('상태 변경 실패', error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-1 sm:gap-2 bg-gray-100/50 rounded-2xl p-1.5 sm:p-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('flash')}
          className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-black text-[10px] sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'flash' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-brand-pink-contrast shadow-lg' 
              : 'text-gray-400 hover:bg-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Zap size={14} sm:size={18} />
            <span>선참순</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('limited')}
          className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-black text-[10px] sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'limited' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-brand-pink-contrast shadow-lg' 
              : 'admin-label hover:bg-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Gift size={14} sm:size={18} />
            <span>한정판</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('raffle')}
          className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-black text-[10px] sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'raffle' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 shadow-lg' 
              : 'text-gray-400 hover:bg-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Trophy size={14} sm:size={18} />
            <span>추첨</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-black text-[10px] sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'coupons' 
              ? 'bg-brand-pink text-brand-pink-contrast shadow-lg' 
              : 'text-gray-400 hover:bg-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Tag size={14} sm:size={18} />
            <span>쿠폰</span>
          </div>
        </button>
      </div>

      {/* 선참순 판매 탭 */}
      {activeTab === 'flash' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl admin-title">선참순 판매 관리</h2>
          <p className="admin-text-secondary text-sm sm:text-base">특정 기간 동안 한정 수량만큼만 판매하는 기능입니다.</p>
          
          {/* 상품 선택 및 설정 폼 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-sm">
            <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">선참순 설정</h3>
            <form onSubmit={handleSaveFlashSettings} className="space-y-3 sm:space-y-4">
              <div>
                <label className="admin-label block mb-2 ml-1">상품 선택</label>
                <select
                  value={selectedFlashProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    if (product) handleSelectFlashProduct(product);
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
                      onClick={() => handleToggleFlashSale(product)}
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
      )}

      {/* 한정판 탭 */}
      {activeTab === 'limited' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl admin-title">한정판 관리</h2>
          <p className="admin-text-secondary text-sm sm:text-base">한정된 수량만 판매하는 상품을 관리합니다.</p>
          
          {/* 상품 선택 및 설정 폼 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-sm">
            <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">한정판 설정</h3>
            <form onSubmit={handleSaveLimitedSettings} className="space-y-3 sm:space-y-4">
              <div>
                <label className="admin-label block mb-2 ml-1">상품 선택</label>
                <select
                  value={selectedLimitedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    if (product) handleSelectLimitedProduct(product);
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
                      onClick={() => handleToggleLimited(product)}
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
      )}

      {/* 추첨 이벤트 탭 */}
      {activeTab === 'raffle' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl admin-title">추첨 이벤트 관리</h2>
          <p className="admin-text-secondary text-sm sm:text-base">랜덤 추첨으로 당첨자를 선정하는 이벤트를 관리합니다.</p>
          
          {/* 추첨 생성 폼 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-sm">
            <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">새 추첨 이벤트 생성</h3>
            <form onSubmit={handleCreateRaffle} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="admin-label block mb-2 ml-1">상품 선택</label>
                  <select
                    value={newRaffle.productId}
                    onChange={(e) => setNewRaffle({ ...newRaffle, productId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 [&>option]:text-gray-900 [&>option]:bg-white"
                    required
                  >
                    <option value="">상품 선택</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-label block mb-2 ml-1">이벤트 제목</label>
                  <input
                    type="text"
                    value={newRaffle.title}
                    onChange={(e) => setNewRaffle({ ...newRaffle, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="예: 신상품 런칭 추첨 이벤트"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="admin-label block mb-2 ml-1">설명</label>
                  <textarea
                    value={newRaffle.description}
                    onChange={(e) => setNewRaffle({ ...newRaffle, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="이벤트 설명을 입력하세요"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="admin-label block mb-2 ml-1">시작 시간</label>
                  <input
                    type="datetime-local"
                    value={newRaffle.startTime}
                    onChange={(e) => setNewRaffle({ ...newRaffle, startTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label block mb-2 ml-1">종료 시간</label>
                  <input
                    type="datetime-local"
                    value={newRaffle.endTime}
                    onChange={(e) => setNewRaffle({ ...newRaffle, endTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label block mb-2 ml-1">최대 참여자 (선택)</label>
                  <input
                    type="number"
                    value={newRaffle.maxParticipants}
                    onChange={(e) => setNewRaffle({ ...newRaffle, maxParticipants: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                    placeholder="제한 없으면 비워두세요"
                  />
                </div>
                <div>
                  <label className="admin-label block mb-2 ml-1">당첨자 수</label>
                  <input
                    type="number"
                    value={newRaffle.winnerCount}
                    onChange={(e) => setNewRaffle({ ...newRaffle, winnerCount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Trophy size={18} sm:size={22} />
                  <span>추첨 이벤트 생성</span>
                </div>
              </button>
            </form>
          </div>

          {/* 추첨 목록 */}
          {raffles.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100">
              <Trophy size={36} sm:size={48} className="mx-auto text-gray-200 mb-3 sm:mb-4" />
              <p className="admin-text-base text-sm sm:text-base">추첨 이벤트가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {raffles.map(raffle => (
                <div key={raffle.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-blue-500/20 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h3 className="font-black text-gray-900 text-sm sm:text-lg">{raffle.title}</h3>
                        {raffle.is_active && !raffle.is_completed && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] sm:text-xs font-bold">진행중</span>
                        )}
                        {raffle.is_completed && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] sm:text-xs font-bold">완료</span>
                        )}
                        {!raffle.is_active && !raffle.is_completed && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-500/20 text-gray-400 rounded-lg text-[10px] sm:text-xs font-bold">비활성</span>
                        )}
                      </div>
                      <p className="admin-text-secondary text-[10px] sm:text-sm mt-1">{raffle.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-sm">
                        <span className="text-blue-600 font-bold">
                          <Clock size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                          {new Date(raffle.start_time).toLocaleDateString('ko-KR')} ~ {new Date(raffle.end_time).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="text-gray-700 font-bold">
                          <Users size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                          당첨자: {raffle.winner_count}명
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      {!raffle.is_completed && (
                        <button
                          onClick={() => handleToggleRaffleActive(raffle)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm transition-all ${
                            raffle.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {raffle.is_active ? '활성' : '비활성'}
                        </button>
                      )}
                      {!raffle.is_completed && (
                        <button
                          onClick={() => handleSelectWinners(raffle.id)}
                          className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 text-brand-pink-contrast"
                        >
                          당첨자 선정
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRaffle(raffle.id)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 size={14} sm:size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 쿠폰 관리 탭 */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl admin-title">쿠폰 관리</h2>
            <button
              onClick={() => {
                resetCouponForm();
                setEditingCoupon(null);
                setShowCouponForm(true);
              }}
              className="px-4 py-2 bg-brand-pink text-brand-pink-contrast rounded-xl font-black flex items-center gap-2 hover:bg-brand-pink-dark transition-colors shadow-lg"
            >
              <Plus size={18} />
              새 쿠폰
            </button>
          </div>

          {showCouponForm && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-brand-pink/20">
              <h3 className="font-black text-lg mb-4 text-brand-pink-dark">
                {editingCoupon ? '쿠폰 수정' : '새 쿠폰 생성'}
              </h3>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label block mb-2 ml-1">쿠폰 코드</label>
                    <input
                      type="text"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm"
                      placeholder="예: WELCOME2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="admin-label block mb-2 ml-1">할인 유형</label>
                    <select
                      value={couponFormData.discount_type}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discount_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm"
                    >
                      <option value="percentage">퍼센트 (%)</option>
                      <option value="fixed">고정 금액 (원)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label block mb-2 ml-1">
                      {couponFormData.discount_type === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}
                    </label>
                    <input
                      type="number"
                      value={couponFormData.discount_value}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discount_value: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm"
                      placeholder={couponFormData.discount_type === 'percentage' ? '예: 10' : '예: 5000'}
                      required
                    />
                  </div>
                  <div>
                    <label className="admin-label block mb-2 ml-1">최소 구매 금액 (원)</label>
                    <input
                      type="number"
                      value={couponFormData.min_purchase}
                      onChange={(e) => setCouponFormData({ ...couponFormData, min_purchase: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm"
                      placeholder="예: 10000"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-brand-pink text-brand-pink-contrast rounded-xl font-black hover:bg-brand-pink-dark transition-colors shadow-lg">
                    {editingCoupon ? '수정하기' : '쿠폰 만들기'}
                  </button>
                  <button type="button" onClick={() => setShowCouponForm(false)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {coupons.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <Tag size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="admin-text-secondary">등록된 쿠폰이 없습니다.</p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${coupon.is_active ? 'border-gray-50' : 'border-gray-100 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-brand-pink/10 text-brand-pink rounded-lg font-black text-xs uppercase tracking-wider">{coupon.code}</span>
                        <span className={`text-[10px] font-bold ${coupon.is_active ? 'text-green-500' : 'text-gray-400'}`}>{coupon.is_active ? '활성화' : '중단됨'}</span>
                      </div>
                      <p className="font-black text-gray-900">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% 할인` : `${coupon.discount_value.toLocaleString()}원 할인`}
                      </p>
                      <p className="text-[10px] admin-text-secondary mt-1">
                        최소 {coupon.min_purchase.toLocaleString()}원 구매 시 | 총 {coupon.usage_limit || '무제한'}회 중 {coupon.used_count}회 사용
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleCoupon(coupon)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${coupon.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleEditCoupon(coupon)} className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteCoupon(coupon.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDopamine;

import React, { useState, useEffect } from 'react';
import { dopamineService, productService, couponService } from '../services';
import { Trophy, Zap, Gift, Tag } from 'lucide-react';
import FlashSaleTab from './admin/dopamine/FlashSaleTab';
import LimitedTab from './admin/dopamine/LimitedTab';
import RaffleTab from './admin/dopamine/RaffleTab';
import CouponTab from './admin/dopamine/CouponTab';

const AdminDopamine = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState(() => window.history.state?.dopamineTab || 'flash'); // flash | limited | raffle | coupons
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

    const handlePopState = (e) => {
      setActiveTab(e.state?.dopamineTab || 'flash');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.pushState({ ...window.history.state, dopamineTab: tab }, '');
  };

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
          onClick={() => handleTabChange('flash')}
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
          onClick={() => handleTabChange('limited')}
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
          onClick={() => handleTabChange('raffle')}
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
          onClick={() => handleTabChange('coupons')}
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

      {/* 탭 콘텐츠 */}
      <div className="animate-fade-in">
        {activeTab === 'flash' && (
          <FlashSaleTab 
            products={products}
            flashSaleProducts={flashSaleProducts}
            selectedFlashProduct={selectedFlashProduct}
            flashSettings={flashSettings}
            setFlashSettings={setFlashSettings}
            onSelectProduct={handleSelectFlashProduct}
            onSaveSettings={handleSaveFlashSettings}
            onToggleFlashSale={handleToggleFlashSale}
          />
        )}
        
        {activeTab === 'limited' && (
          <LimitedTab 
            products={products}
            limitedProducts={limitedProducts}
            selectedLimitedProduct={selectedLimitedProduct}
            limitedSettings={limitedSettings}
            setLimitedSettings={setLimitedSettings}
            onSelectProduct={handleSelectLimitedProduct}
            onSaveSettings={handleSaveLimitedSettings}
            onToggleLimited={handleToggleLimited}
          />
        )}
        
        {activeTab === 'raffle' && (
          <RaffleTab 
            products={products}
            raffles={raffles}
            newRaffle={newRaffle}
            setNewRaffle={setNewRaffle}
            onCreateRaffle={handleCreateRaffle}
            onSelectWinners={handleSelectWinners}
            onDeleteRaffle={handleDeleteRaffle}
            onToggleActive={handleToggleRaffleActive}
          />
        )}
        
        {activeTab === 'coupons' && (
          <CouponTab 
            coupons={coupons}
            showCouponForm={showCouponForm}
            setShowCouponForm={setShowCouponForm}
            editingCoupon={editingCoupon}
            setEditingCoupon={setEditingCoupon}
            couponFormData={couponFormData}
            setCouponFormData={setCouponFormData}
            onSubmit={handleCouponSubmit}
            onEdit={handleEditCoupon}
            onToggle={handleToggleCoupon}
            onDelete={handleDeleteCoupon}
            onResetForm={resetCouponForm}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDopamine;

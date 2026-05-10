import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { productService, categoryService, orderService, configService } from '../services';
import AdminGuideModal from './AdminGuideModal';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminSettings from './AdminSettings';
import AdminStats from './AdminStats';
import AdminChat from './AdminChat';
import AdminDopamine from './AdminDopamine';
import AdminStorage from './AdminStorage';
import AdminDB from './AdminDB';
import AdminLoginSection from './admin/AdminLoginSection';
import AdminHeader from './admin/AdminHeader';
import AdminTabs from './admin/AdminTabs';
import { useRealtimeOrders, useProducts, useCategories, useConfigs, useAlert } from '../hooks';
import { SweetAlert } from './ui/Common';
import { hashPassword, verifyPassword, DEFAULT_PASSWORD_HASH } from '../utils/crypto';
import { Volume2, VolumeX, Settings, Bell, X, ShoppingBag } from 'lucide-react';

import BrandBackground from './ui/BrandBackground';

const AdminView = ({ onBack, onEnterLiveControl, activeTab, setActiveTab }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('ADMIN_LOGGED_IN') === 'true');
  const { alert, showAlert, hideAlert, showConfirm } = useAlert();

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const mainRef = useRef(null);

  const adminSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const prevOrdersCount = useRef(0);
  const [newOrderNotification, setNewOrderNotification] = useState(null);

  const { orders, loading: ordersLoading } = useRealtimeOrders();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { config, loading: configLoading, refetch: refetchConfigs } = useConfigs();

  const [shopName, setShopName] = useState('');
  const [shopSubtitle, setShopSubtitle] = useState('');
  const [shopNotice, setShopNotice] = useState('');
  const [instaUrl, setInstaUrl] = useState('');
  const [bankInfo, setBankInfo] = useState({ bank: '', account: '', holder: '' });
  const [telegram, setTelegram] = useState({ token: '', chatId: '' });
  const [isOrderingActive, setIsOrderingActive] = useState(true);
  const [shortformVideoUrl, setShortformVideoUrl] = useState('');
  const [liveGuideInfo, setLiveGuideInfo] = useState('');

  // 주문 알림 로직
  useEffect(() => {
    if (!isLoggedIn) return;

    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0]; // 최신 주문
      setNewOrderNotification(newOrder);

      // 소리 알림
      if (adminSound.current) {
        adminSound.current.currentTime = 0;
        adminSound.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // 5초 후 알림 자동 닫기
      setTimeout(() => {
        setNewOrderNotification(null);
      }, 5000);
    }

    prevOrdersCount.current = orders.length;
  }, [orders, isLoggedIn]);

  const closeNotification = () => {
    setNewOrderNotification(null);
  };

  // 상품 관련 상태
  const [newProduct, setNewProduct] = useState({ name: '', price: '', options: '', category_id: '', description: '', stock: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!configLoading && config) {
      setShopName(config.shopName || '');
      setShopSubtitle(config.shopSubtitle || '');
      setShopNotice(config.shopNotice || '');
      setInstaUrl(config.instaUrl || '');
      setBankInfo(config.bankInfo || { bank: '', account: '', holder: '' });
      setTelegram(config.telegramConfig || { token: '', chatId: '' });
      setShortformVideoUrl(config.shortformVideoUrl || '/인스타.mp4');
      setLiveGuideInfo(config.liveGuideInfo || '졸리졸리 라이브에 오신 것을 환영합니다! ✨\n하단을 눌러 상품을 확인하고 하트로 응원해주세요!');
      setIsOrderingActive(config.isOrderingActive !== false);
    }
  }, [config, configLoading]);

  // 주문 토글 기능 (복구)
  const handleToggleOrdering = async () => {
    const newState = !isOrderingActive;
    setIsOrderingActive(newState);
    try {
      await configService.upsert('is_ordering_active', newState.toString());
      await refetchConfigs();
      window.dispatchEvent(new Event('configUpdated'));
      showAlert(newState ? '주문 시작' : '주문 마감', newState ? '지금부터 주문을 받을 수 있습니다.' : '주문 접수가 중단되었습니다.', newState ? 'success' : 'info');
    } catch (error) {
      setIsOrderingActive(!newState);
      showAlert('설정 변경 실패', error.message, 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const isValid = await verifyPassword(password, localStorage.getItem('ADMIN_PASSWORD_HASH') || DEFAULT_PASSWORD_HASH);
    if (isValid) {
      setIsLoggedIn(true);
      localStorage.setItem('ADMIN_LOGGED_IN', 'true');
      showAlert('로그인 성공! 👋', '관리자 모드에 오신 것을 환영합니다.', 'success');
    } else {
      showAlert('비밀번호 오류 🔒', '비밀번호가 일치하지 않습니다.', 'error');
    }
  };

  const handleLogout = () => {
    showConfirm('로그아웃 🚪', '정말 로그아웃 하시겠습니까?', () => {
      localStorage.removeItem('ADMIN_LOGGED_IN');
      setIsLoggedIn(false);
      onBack();
    });
  };

  const handlePushToLive = async (product) => {
    try {
      await configService.upsert('live_featured_product_id', product.id);
      showAlert('송출 완료', `[${product.name}] 상품이 모든 시청자 화면에 고정되었습니다.`, 'success');
    } catch (error) {
      showAlert('송출 오류', error.message, 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isLoggedIn) return;
    try {
      await orderService.updateStatus(orderId, newStatus);
      if (newStatus === '입금완료') showAlert('입금 확인', '입금 처리가 완료되었습니다.', 'success');
    } catch (e) {
      console.error('상태 업데이트 실패:', e);
      showAlert('오류', '상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleUpdateTracking = async (orderId, trackingNumber, carrier) => {
    try {
      await orderService.updateTrackingNumber(orderId, trackingNumber, carrier);
      showAlert('송장 번호 저장', '배송 정보가 저장되었습니다.', 'success');
    } catch (e) {
      console.error('Tracking update error:', e);
      showAlert('오류', '송장 번호 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) return showAlert('파일 개수 초과', '최대 5장까지만 선택 가능합니다.', 'info');
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, options: product.options || '', category_id: product.category_id || '', description: product.description || '', stock: product.stock || '' });
    setCurrentImages(product.image_urls || [product.image_url] || []);
    setImageFiles([]);
    setImagePreviews([]);
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let image_urls = editingProduct ? currentImages : [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const publicUrl = await productService.uploadImage(file);
          image_urls.push(publicUrl);
        }
      }
      const productData = { 
        name: newProduct.name, 
        price: newProduct.price, 
        options: newProduct.options || '', 
        category_id: newProduct.category_id, 
        description: newProduct.description || '', 
        stock: parseInt(newProduct.stock) || 0,
        image_url: image_urls[0], 
        image_urls: image_urls 
      };
      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
        setEditingProduct(null);
        showAlert('수정 완료', '상품 정보가 성공적으로 변경되었습니다.', 'success');
      } else {
        if (imageFiles.length === 0) {
          showAlert('사진 누락', '상품 사진을 최소 1장 이상 선택해 주세요.', 'info');
          setUploading(false);
          return;
        }
        await productService.create(productData);
        showAlert('등록 완료! 🎉', '새로운 상품이 성공적으로 등록되었습니다.', 'success');
      }
      setNewProduct({ name: '', price: '', options: '', category_id: '', description: '', stock: '' });
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      showAlert(editingProduct ? '수정 실패' : '등록 실패', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStock = async (product) => {
    try {
      await productService.toggleStock(product.id, product.is_out_of_stock);
    } catch (error) {
      console.error('재고 상태 변경 실패:', error);
    }
  };

  const handleDeleteOrder = async (id) => {
    showConfirm('주문 삭제 🗑️', '이 주문 내역을 정말 삭제하시겠습니까?', () => {
      orderService.delete(id).catch(error => console.error('주문 삭제 실패:', error));
    }, 'error');
  };

  const handleDeleteProduct = async (id) => {
    showConfirm('상품 삭제 🗑️', '이 상품을 정말 삭제하시겠습니까?', () => {
      productService.delete(id).catch(error => console.error('상품 삭제 실패:', error));
    }, 'error');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await categoryService.create(newCategoryName);
      setNewCategoryName('');
      showAlert('분류 추가 완료! 🎉', '새로운 분류가 등록되었습니다.', 'success');
    } catch (error) {
      showAlert('분류 추가 실패', error.message, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    showConfirm('분류 삭제 🗑️', '정말 삭제하시겠습니까?', () => {
      categoryService.delete(id).catch(error => showAlert('삭제 실패', error.message, 'error'));
    }, 'error');
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      await configService.upsertMultiple([
        { key: 'shop_name', value: shopName },
        { key: 'shop_subtitle', value: shopSubtitle },
        { key: 'shop_notice', value: shopNotice },
        { key: 'insta_url', value: instaUrl },
        { key: 'bank_info', value: JSON.stringify(bankInfo) },
        { key: 'telegram_config', value: JSON.stringify(telegram) },
        { key: 'shortform_video_url', value: shortformVideoUrl },
        { key: 'live_guide_info', value: liveGuideInfo },
      ]);
      await refetchConfigs();
      window.dispatchEvent(new Event('configUpdated'));
      showAlert('저장 완료', '상점 설정이 저장되었습니다.', 'success');
    } catch (error) {
      showAlert('저장 실패', error.message, 'error');
    }
  };

  if (!isLoggedIn) {
    return <AdminLoginSection password={password} setPassword={setPassword} onLogin={handleLogin} onBack={onBack} />;
  }

  return (
    <BrandBackground className="flex flex-col h-screen overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        <AdminHeader
          onShowGuide={() => setShowGuide(true)}
          onBack={onBack}
          onLogout={handleLogout}
          isOrderingActive={isOrderingActive}
          onToggleOrdering={handleToggleOrdering}
        />

        {/* Order Toggle - Modern Card */}
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <button 
            onClick={handleToggleOrdering}
            className={`w-full h-14 sm:h-16 rounded-2xl flex items-center justify-between px-4 sm:px-6 font-black text-base sm:text-xl shadow-2xl active:scale-95 transition-all duration-300 ${
              isOrderingActive 
                ? 'gradient-primary text-brand-pink-contrast shadow-brand-pink/40' 
                : 'glass border-2 border-dashed border-gray-300 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isOrderingActive ? 'bg-white animate-pulse shadow-lg shadow-white/50' : 'bg-gray-300'}`} />
              <span className="text-sm sm:text-base md:text-lg">{isOrderingActive ? '현재 라방 주문 받는 중' : '지금은 주문 마감 상태'}</span>
            </div>
            <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative transition-colors ${isOrderingActive ? 'bg-white/30' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 sm:top-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all shadow-lg ${isOrderingActive ? 'right-0.5 sm:right-1 bg-white' : 'left-0.5 sm:left-1 bg-gray-400'}`} />
            </div>
          </button>
        </div>

        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin p-2 sm:p-6 pb-24 max-w-6xl mx-auto w-full relative">
          <div className="sticky top-0 z-30 -mx-2 sm:-mx-6 px-2 sm:px-6 pt-1 mb-8 sm:mb-10 bg-[#fdf2f8]/40 backdrop-blur-xl border-b border-brand-pink/5">
            <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="animate-fade-in">
            {activeTab === 'orders' && (
              <AdminOrders
                orders={orders}
                loading={ordersLoading}
                onUpdateStatus={handleUpdateStatus}
                onDeleteOrder={handleDeleteOrder}
                isOrderingActive={isOrderingActive}
                onToggleOrdering={handleToggleOrdering}
                onEnterLiveControl={onEnterLiveControl}
                onUpdateTracking={handleUpdateTracking}
              />
            )}
            {activeTab === 'products' && (
              <AdminProducts 
                products={products} categories={categories} newProduct={newProduct} setNewProduct={setNewProduct} 
                imageFiles={imageFiles} imagePreviews={imagePreviews} currentImages={currentImages} 
                editingProduct={editingProduct} setEditingProduct={setEditingProduct} uploading={uploading} 
                onFileChange={handleFileChange} onRemoveCurrentImage={(url) => setCurrentImages(currentImages.filter(img => img !== url))} 
                onRemoveNewImage={(idx) => { const nf = [...imageFiles]; nf.splice(idx,1); setImageFiles(nf); const np = [...imagePreviews]; np.splice(idx,1); setImagePreviews(np); }} 
                onAddProduct={handleAddProduct} onToggleStock={handleToggleStock} onDeleteProduct={handleDeleteProduct} 
                onStartEditing={startEditing} onPushToLive={handlePushToLive} setImageFiles={setImageFiles} setImagePreviews={setImagePreviews} 
                newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory}
              />
            )}
            {activeTab === 'chat' && (
              <AdminChat 
                showAlert={showAlert} 
                onSaveSettings={handleSaveSettings}
              />
            )}
            { activeTab === 'dopamine' && <AdminDopamine showAlert={showAlert} />}
            { activeTab === 'db' && <AdminDB showAlert={showAlert} products={products} config={config} />}
            { activeTab === 'stats' && <AdminStats />}
            {activeTab === 'settings' && <AdminSettings shopName={shopName} setShopName={setShopName} shopSubtitle={shopSubtitle} setShopSubtitle={setShopSubtitle} shopNotice={shopNotice} setShopNotice={setShopNotice} instaUrl={instaUrl} setInstaUrl={setInstaUrl} bankInfo={bankInfo} setBankInfo={setBankInfo} telegram={telegram} setTelegram={setTelegram} shortformVideoUrl={shortformVideoUrl} setShortformVideoUrl={setShortformVideoUrl} liveGuideInfo={liveGuideInfo} setLiveGuideInfo={setLiveGuideInfo} onSaveSettings={handleSaveSettings} />}
          </div>
        </main>
      </div>
      
      {showGuide && <AdminGuideModal onClose={() => setShowGuide(false)} />}
      <SweetAlert
        isOpen={alert.show}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
      />

      {/* Modern Order Notification */}
      {newOrderNotification && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 animate-slide-in">
          <div className="glass-gradient rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 max-w-xs sm:max-w-sm overflow-hidden animate-glow">
            <div className="gradient-primary px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-pink-contrast/10 rounded-full flex items-center justify-center">
                  <Bell className="text-brand-pink-contrast animate-bounce" size={16} sm:size={20} />
                </div>
                <span className="text-brand-pink-contrast font-black text-xs sm:text-sm">새 주문 도착! 🎉</span>
              </div>
              <button onClick={closeNotification} className="text-brand-pink-contrast/80 hover:text-brand-pink-contrast transition-colors hover:scale-110">
                <X size={16} sm:size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="text-brand-pink-dark" size={20} sm:size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 text-sm sm:text-base">
                    {newOrderNotification.customer_name}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    {newOrderNotification.product_name || '상품'} × {newOrderNotification.quantity}개
                  </p>
                  <p className="text-gradient-pink font-black text-base sm:text-lg mt-2">
                    {(newOrderNotification.price * newOrderNotification.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </BrandBackground>
  );
};

export default AdminView;

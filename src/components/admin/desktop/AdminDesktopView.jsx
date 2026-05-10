import React from 'react';
import AdminHeader from '../AdminHeader';
import AdminTabs from '../AdminTabs';
import AdminOrders from '../../AdminOrders';
import AdminProducts from '../../AdminProducts';
import AdminLiveSettings from '../AdminLiveSettings';
import AdminChat from '../../AdminChat';
import AdminDopamine from '../../AdminDopamine';
import AdminSystemSettings from '../../AdminSystemSettings';
import AdminSettings from '../../AdminSettings';
import AdminStats from '../../AdminStats';
import CustomerView from '../../CustomerView';
import AdminGuideModal from '../../AdminGuideModal';
import { SweetAlert } from '../../ui/Common';
import { Bell, X, ShoppingBag, Radio } from 'lucide-react';
import BrandBackground from '../../ui/BrandBackground';
import { cn } from '../../../utils/cn';

const AdminDesktopView = ({ logic, activeTab, setActiveTab, onBack, onEnterLiveControl }) => {
  const {
    isLoggedIn, handleLogout,
    orders, ordersLoading, products, categories, config,
    showGuide, setShowGuide, mainRef, alert, showAlert, hideAlert,
    isOrderingActive, handleToggleOrdering,
    newOrderNotification, closeNotification,
    newProduct, setNewProduct, imageFiles, setImageFiles, imagePreviews, setImagePreviews,
    currentImages, editingProduct, setEditingProduct, uploading,
    handleFileChange, startEditing, handleAddProduct, handleDeleteProduct, handleToggleStock, handlePushToLive,
    newCategoryName, setNewCategoryName, handleAddCategory, handleDeleteCategory,
    handleUpdateStatus, handleUpdateTracking, handleDeleteOrder,
    shortformVideoUrl, setShortformVideoUrl, liveGuideInfo, setLiveGuideInfo, handleSaveSettings,
    telegram, setTelegram, newPassword, setNewPassword,
    shopName, setShopName, shopSubtitle, setShopSubtitle, shopNotice, setShopNotice,
    instaUrl, setInstaUrl, bankInfo, setBankInfo, portoneConfig, setPortoneConfig,
    businessInfo, setBusinessInfo,
    viewerCount
  } = logic;

  return (
    <BrandBackground className="flex flex-col h-screen overflow-hidden">
      {/* PC 전용: 배경에 은은한 그리드 효과 추가하여 전문적인 느낌 강조 */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* 고정 상단 헤더 */}
        <AdminHeader onShowGuide={() => setShowGuide(true)} onBack={onBack} onLogout={handleLogout} isOrderingActive={isOrderingActive} onToggleOrdering={handleToggleOrdering} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 상단 상태 바 (PC 최적화: 슬림하고 정보 집약적) */}
          <div className="px-8 py-3 bg-white/40 backdrop-blur-md border-b border-white/40 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", isOrderingActive ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                <span className="text-sm font-black text-gray-900">
                  시스템 상태: {isOrderingActive ? "실시간 주문 수신 중" : "주문 마감됨"}
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span>등록 상품: <b className="text-gray-900">{products.length}</b></span>
                <span>누적 주문: <b className="text-gray-900">{orders.length}</b></span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleToggleOrdering}
                className={cn(
                  "px-6 py-2 rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-2",
                  isOrderingActive ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-brand-pink text-white shadow-brand-pink/20"
                )}
              >
                {isOrderingActive ? "주문 마감하기" : "주문 받기 시작"}
              </button>
              <button 
                onClick={onEnterLiveControl}
                className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-black transition-all"
              >
                <Radio size={14} /> 실시간 리모컨 모드
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 좌측 탭 내비게이션 (PC 전용 사이드 바 스타일로 변경 고려 가능하나 일단 상단 탭 유지) */}
            <main ref={mainRef} className="flex-1 overflow-y-auto p-8 pb-24 scrollbar-thin">
              <div className="max-w-7xl mx-auto">
                <div className="sticky top-0 z-30 mb-8 bg-[#fdf2f8]/60 backdrop-blur-xl border-b border-brand-pink/5 px-2 py-1 rounded-2xl">
                  <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                
                <div className="animate-fade-in">
                  {activeTab === 'stats' && (
                    <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                      <AdminStats viewerCount={viewerCount} />
                    </div>
                  )}
                  {activeTab === 'orders' && (
                    <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                      <AdminOrders orders={orders} loading={ordersLoading} onUpdateStatus={handleUpdateStatus} onDeleteOrder={handleDeleteOrder} isOrderingActive={isOrderingActive} onToggleOrdering={handleToggleOrdering} onEnterLiveControl={onEnterLiveControl} onUpdateTracking={handleUpdateTracking} />
                    </div>
                  )}
                  {activeTab === 'products' && (
                    <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                      <AdminProducts products={products} categories={categories} newProduct={newProduct} setNewProduct={setNewProduct} imageFiles={imageFiles} imagePreviews={imagePreviews} currentImages={currentImages} editingProduct={editingProduct} setEditingProduct={setEditingProduct} uploading={uploading} onFileChange={handleFileChange} onRemoveCurrentImage={(url) => setCurrentImages(currentImages.filter(img => img !== url))} onRemoveNewImage={(idx) => { const nf = [...imageFiles]; nf.splice(idx,1); setImageFiles(nf); const np = [...imagePreviews]; np.splice(idx,1); setImagePreviews(np); }} onAddProduct={handleAddProduct} onToggleStock={handleToggleStock} onDeleteProduct={handleDeleteProduct} onStartEditing={startEditing} onPushToLive={handlePushToLive} setImageFiles={setImageFiles} setImagePreviews={setImagePreviews} newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />
                    </div>
                  )}
                  {activeTab === 'live' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                        <AdminLiveSettings shortformVideoUrl={shortformVideoUrl} setShortformVideoUrl={setShortformVideoUrl} liveGuideInfo={liveGuideInfo} setLiveGuideInfo={setLiveGuideInfo} onSaveSettings={handleSaveSettings} />
                      </div>
                      <div className="space-y-8">
                        <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                          <AdminChat showAlert={showAlert} onSaveSettings={handleSaveSettings} />
                        </div>
                        <div className="boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                          <AdminDopamine showAlert={showAlert} />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'system' && (
                    <div className="max-w-4xl mx-auto boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                      <AdminSystemSettings telegram={telegram} setTelegram={setTelegram} newPassword={newPassword} setNewPassword={setNewPassword} onSaveSettings={handleSaveSettings} products={products} config={config} showAlert={showAlert} />
                    </div>
                  )}
                  {activeTab === 'shop' && (
                    <div className="max-w-4xl mx-auto boutique-glass rounded-[2.5rem] p-8 border border-white/60 shadow-2xl">
                      <AdminSettings shopName={shopName} setShopName={setShopName} shopSubtitle={shopSubtitle} setShopSubtitle={setShopSubtitle} shopNotice={shopNotice} setShopNotice={setShopNotice} instaUrl={instaUrl} setInstaUrl={setInstaUrl} bankInfo={bankInfo} setBankInfo={setBankInfo} portoneConfig={portoneConfig} setPortoneConfig={setPortoneConfig} businessInfo={businessInfo} setBusinessInfo={setBusinessInfo} onSaveSettings={handleSaveSettings} />
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* PC 전용: 라이브 설정 프리뷰 (시청자용 뷰 실시간 모니터링) */}
            <aside className="hidden 2xl:flex w-[400px] border-l border-white/40 bg-white/20 backdrop-blur-2xl flex-col overflow-hidden relative shadow-2xl">
              <div className="p-6 border-b border-white/40 flex items-center justify-between bg-zinc-900/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-zinc-900 tracking-tight">LIVE MONITORING</span>
                </div>
                <div className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-zinc-500 border border-white/60">
                  Viewer Mode
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                {/* 실제 시청자 화면을 축소하여 렌더링 */}
                <div className="absolute inset-0 origin-top-left overflow-hidden">
                   <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-zinc-100 animate-pulse">Preview Loading...</div>}>
                     <CustomerView isPreview={true} />
                   </React.Suspense>
                </div>
              </div>
              <div className="p-4 bg-zinc-900 text-white text-center">
                <p className="text-[10px] font-bold opacity-60">시청자에게 보이는 실시간 화면입니다.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showGuide && <AdminGuideModal onClose={() => setShowGuide(false)} />}
      <SweetAlert isOpen={alert.show} onClose={hideAlert} title={alert.title} message={alert.message} type={alert.type} showCancel={alert.showCancel} onConfirm={alert.onConfirm} />
      
      {/* PC 전용 주문 알림: 더 깔끔하고 고급스러운 디자인 */}
      {newOrderNotification && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-in">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white overflow-hidden w-96">
            <div className="bg-brand-pink px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-white animate-bounce" size={18} />
                <span className="text-white font-black text-sm">NEW ORDER</span>
              </div>
              <button onClick={closeNotification} className="text-white/80 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-brand-pink/10 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="text-brand-pink" size={28} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">{newOrderNotification.customer_name}님</p>
                <p className="text-gray-500 font-bold text-sm mt-0.5">{newOrderNotification.product_name || '상품'} 주문 완료</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </BrandBackground>
  );
};

export default AdminDesktopView;

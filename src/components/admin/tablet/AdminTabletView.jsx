import React from 'react';
import AdminHeader from '../AdminHeader';
import AdminOrders from '../../AdminOrders';
import AdminProducts from '../../AdminProducts';
import AdminLiveSettings from '../AdminLiveSettings';
import AdminChat from '../../AdminChat';
import AdminDopamine from '../../AdminDopamine';
import AdminSystemSettings from '../../AdminSystemSettings';
import AdminSettings from '../../AdminSettings';
import AdminStats from '../../AdminStats';
import AdminGuideModal from '../../AdminGuideModal';
import { SweetAlert } from '../../ui/Common';
import { Bell, X, ShoppingBag, Radio, LayoutDashboard, Package, ShoppingCart, Video, HardDrive, Settings } from 'lucide-react';
import BrandBackground from '../../ui/BrandBackground';
import { cn } from '../../../utils/cn';

/**
 * AdminTabletView
 * 태블릿(768~1023px) 전용 관리자 화면.
 * - 좌측 아이콘 사이드바 + 우측 콘텐츠 영역 (2-panel)
 * - 사이드바는 아이콘+라벨 형태 (접힘 없음)
 * - 콘텐츠 영역은 단일 열 (PC의 xl 그리드 없음)
 * - 주문 알림은 상단 토스트 방식
 */
const AdminTabletView = ({ logic, activeTab, setActiveTab, onBack, onEnterLiveControl }) => {
  const {
    isLoggedIn, handleLogout,
    orders, ordersLoading, products, categories, config,
    showGuide, setShowGuide, mainRef, alert, showAlert, hideAlert,
    isOrderingActive, handleToggleOrdering,
    newOrderNotification, closeNotification,
    newProduct, setNewProduct, imageFiles, setImageFiles, imagePreviews, setImagePreviews,
    currentImages, setCurrentImages, editingProduct, setEditingProduct, uploading,
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

  const sidebarItems = [
    { id: 'stats', label: '통계', icon: LayoutDashboard },
    { id: 'orders', label: '주문', icon: ShoppingCart },
    { id: 'products', label: '상품', icon: Package },
    { id: 'live', label: '라방', icon: Video },
    { id: 'system', label: '시스템', icon: HardDrive },
    { id: 'shop', label: '상점', icon: Settings },
  ];

  return (
    <BrandBackground className="flex flex-col h-screen overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        {/* 상단 헤더 */}
        <AdminHeader
          onShowGuide={() => setShowGuide(true)}
          onBack={onBack}
          onLogout={handleLogout}
          isOrderingActive={isOrderingActive}
          onToggleOrdering={handleToggleOrdering}
        />

        {/* 상태 바 */}
        <div className="px-4 py-2 bg-white/40 backdrop-blur-md border-b border-white/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", isOrderingActive ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
            <span className="text-xs font-black text-gray-800">
              {isOrderingActive ? "주문 수신 중" : "주문 마감"}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">주문 {orders.length}건 · 상품 {products.length}개</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleOrdering}
              className={cn(
                "px-4 py-1.5 rounded-xl font-black text-[11px] transition-all",
                isOrderingActive ? "bg-red-50 text-red-600 border border-red-100" : "bg-brand-pink text-white"
              )}
            >
              {isOrderingActive ? "주문 마감" : "주문 시작"}
            </button>
            <button
              onClick={onEnterLiveControl}
              className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl font-black text-[11px] flex items-center gap-1.5"
            >
              <Radio size={12} /> 리모컨
            </button>
          </div>
        </div>

        {/* 메인: 좌측 사이드바 + 우측 콘텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측 사이드바 */}
          <nav className="w-20 flex-shrink-0 bg-white/30 backdrop-blur-xl border-r border-white/40 flex flex-col items-center py-4 gap-1 overflow-y-auto">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-16 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all duration-200",
                  activeTab === item.id
                    ? "bg-brand-pink text-white shadow-md"
                    : "text-gray-400 hover:bg-white/60 hover:text-gray-700"
                )}
              >
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="text-[9px] font-black leading-none">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* 우측 콘텐츠 */}
          <main ref={mainRef} className="flex-1 overflow-y-auto p-5 pb-20 scrollbar-thin">
            <div className="animate-fade-in">
              {activeTab === 'stats' && (
                <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                  <AdminStats viewerCount={viewerCount} />
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
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
                </div>
              )}
              {activeTab === 'products' && (
                <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                  <AdminProducts
                    products={products}
                    categories={categories}
                    newProduct={newProduct}
                    setNewProduct={setNewProduct}
                    imageFiles={imageFiles}
                    imagePreviews={imagePreviews}
                    currentImages={currentImages}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    uploading={uploading}
                    onFileChange={handleFileChange}
                    onRemoveCurrentImage={(url) => setCurrentImages(currentImages.filter(img => img !== url))}
                    onRemoveNewImage={(idx) => {
                      const nf = [...imageFiles]; nf.splice(idx, 1); setImageFiles(nf);
                      const np = [...imagePreviews]; np.splice(idx, 1); setImagePreviews(np);
                    }}
                    onAddProduct={handleAddProduct}
                    onToggleStock={handleToggleStock}
                    onDeleteProduct={handleDeleteProduct}
                    onStartEditing={startEditing}
                    onPushToLive={handlePushToLive}
                    setImageFiles={setImageFiles}
                    setImagePreviews={setImagePreviews}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                </div>
              )}
              {activeTab === 'live' && (
                <div className="space-y-5">
                  <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                    <AdminLiveSettings
                      shortformVideoUrl={shortformVideoUrl}
                      setShortformVideoUrl={setShortformVideoUrl}
                      liveGuideInfo={liveGuideInfo}
                      setLiveGuideInfo={setLiveGuideInfo}
                      onSaveSettings={handleSaveSettings}
                    />
                  </div>
                  <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                    <AdminChat showAlert={showAlert} onSaveSettings={handleSaveSettings} />
                  </div>
                  <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                    <AdminDopamine showAlert={showAlert} />
                  </div>
                </div>
              )}
              {activeTab === 'system' && (
                <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                  <AdminSystemSettings
                    telegram={telegram}
                    setTelegram={setTelegram}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    onSaveSettings={handleSaveSettings}
                    products={products}
                    config={config}
                    showAlert={showAlert}
                  />
                </div>
              )}
              {activeTab === 'shop' && (
                <div className="boutique-glass rounded-[2rem] p-6 border border-white/60 shadow-xl">
                  <AdminSettings
                    shopName={shopName} setShopName={setShopName}
                    shopSubtitle={shopSubtitle} setShopSubtitle={setShopSubtitle}
                    shopNotice={shopNotice} setShopNotice={setShopNotice}
                    instaUrl={instaUrl} setInstaUrl={setInstaUrl}
                    bankInfo={bankInfo} setBankInfo={setBankInfo}
                    portoneConfig={portoneConfig} setPortoneConfig={setPortoneConfig}
                    businessInfo={businessInfo} setBusinessInfo={setBusinessInfo}
                    onSaveSettings={handleSaveSettings}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showGuide && <AdminGuideModal onClose={() => setShowGuide(false)} />}
      <SweetAlert isOpen={alert.show} onClose={hideAlert} title={alert.title} message={alert.message} type={alert.type} showCancel={alert.showCancel} onConfirm={alert.onConfirm} />

      {/* 태블릿 주문 알림: 상단 토스트 */}
      {newOrderNotification && (
        <div className="fixed top-24 right-4 z-[100] animate-slide-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white overflow-hidden w-72">
            <div className="bg-brand-pink px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="text-white animate-bounce" size={16} />
                <span className="text-white font-black text-xs">NEW ORDER</span>
              </div>
              <button onClick={closeNotification} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-pink/10 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-brand-pink" size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">{newOrderNotification.customer_name}님</p>
                <p className="text-gray-500 font-bold text-xs">{newOrderNotification.product_name || '상품'} 주문</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </BrandBackground>
  );
};

export default AdminTabletView;

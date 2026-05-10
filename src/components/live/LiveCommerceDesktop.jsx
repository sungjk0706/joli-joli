import React from 'react';
import { cn } from '../../utils/cn';
import { GlassIconButton } from '../ui/Common';
import { Heart, Maximize2, X, Volume2, VolumeX } from 'lucide-react';

// Lazy-loaded sub-components
const LiveVideoPlayer = React.lazy(() => import('./LiveVideoPlayer'));
const LiveHeader = React.lazy(() => import('./LiveHeader'));
const LiveInteractionSidebar = React.lazy(() => import('./LiveInteractionSidebar'));
const LiveProductVerticalList = React.lazy(() => import('./LiveProductVerticalList'));
const LiveChatSheet = React.lazy(() => import('./LiveChatSheet').then(m => ({ default: m.LiveChatSheet })));
const LiveProductPushSheet = React.lazy(() => import('./LiveProductPushSheet'));
const AdminLiveControlPanel = React.lazy(() => import('./AdminLiveControlPanel'));
const LiveOrderSheet = React.lazy(() => import('./LiveOrderSheet'));
const LiveProductListView = React.lazy(() => import('./LiveProductListView'));

/**
 * LiveCommerceDesktop - 데스크톱용 라이브 커머스 뷰
 * - 3열 그리드 레이아웃
 * - 좌측: 상품 목록 (240px)
 * - 중앙: 비디오 (flex-1)
 * - 우측: 채팅 패널 (380px)
 * - 하단 퀵액션바
 */
const LiveCommerceDesktop = ({
  // Mini mode
  isMiniMode,
  miniPos,
  miniWidth,
  miniHeight,
  viewportSize,
  onMiniModeChange,
  onBack,
  // Video
  currentShortformVideoUrl,
  isMuted,
  setIsMuted,
  // Touch gestures
  touchDeltaY,
  isSwiping,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  // Chat
  chatMessages,
  filteredChatMessages,
  message,
  setMessage,
  handleSend,
  currentUsername,
  isAdmin,
  bannedUsers,
  // Products
  displayProducts,
  allProducts,
  liveProductIds,
  activeProduct,
  selectedProduct,
  onProductClick,
  onPushToLive,
  // UI states
  isProductListOpen,
  setIsProductListOpen,
  isProductSheetOpen,
  setIsProductSheetOpen,
  isSheetOpen,
  setIsSheetOpen,
  showControlPanel,
  setShowControlPanel,
  // Interaction
  floatingItems,
  isLiked,
  likeCount,
  handleLike,
  handleReaction,
  onProductListOpen,
  showAlert,
  viewerCount,
  // Form & Order
  formData,
  setFormData,
  handleOrderSubmit,
  loading,
  config,
  guideInfo,
  // Notifications
  notifications,
  // Admin
  setCurrentShortformVideoUrl,
  setGuideInfo,
}) => {
  return (
    <>
      {/* Main Container - 3 Column Layout */}
      <div 
        className={cn(
          "fixed inset-0 z-[9999] overflow-hidden select-none pointer-events-none transition-all duration-500 flex flex-row",
          !isMiniMode && "flex"
        )}
        style={{ overscrollBehavior: 'none', touchAction: 'none' }}
      >
        {/* Left Column: Product List (240px - 280px responsive) */}
        <div 
          className={cn(
            "h-full flex-col transition-opacity duration-500 bg-black",
            isMiniMode ? "hidden" : "flex w-[240px] xl:w-[280px] opacity-100 delay-500"
          )}
        >
          <LiveProductVerticalList 
            products={displayProducts} 
            onProductClick={onProductClick} 
          />
        </div>

        {/* Center Column: Video (flex-1) */}
        <div 
          className={cn(
            "relative h-full pointer-events-none transition-all duration-500",
            isMiniMode ? "absolute inset-0 z-[5500]" : "flex-1 overflow-hidden"
          )}
        >
          {!isMiniMode && <div className="absolute inset-0 bg-black pointer-events-none" />}
          
          <div 
            className={cn(
              "absolute bg-black overflow-hidden shadow-2xl border-0 pointer-events-auto",
              isMiniMode ? "rounded-3xl ring-1 ring-white/20" : "rounded-0"
            )}
            style={{
              willChange: 'transform, border-radius',
              width: isMiniMode ? miniWidth : '100%',
              height: isMiniMode ? miniHeight : '100%',
              transformOrigin: 'top left',
              transform: isMiniMode 
                ? `translate(calc(100vw - ${miniPos.x + (viewportSize.width < 640 ? 136 : 200)}px), calc(100dvh - ${miniPos.y + (viewportSize.width < 640 ? 220 : 340)}px))`
                : `translate(0, ${touchDeltaY}px)`,
              transition: isSwiping ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <LiveVideoPlayer 
              src={currentShortformVideoUrl} 
              isMuted={isMuted} 
              isMiniMode={isMiniMode} 
              onBack={onBack} 
              onMiniModeChange={onMiniModeChange} 
            />
          </div>

          {/* Video Overlay UI */}
          <div className={cn(
            "absolute inset-0 z-[6000] overflow-hidden transition-opacity duration-500 pointer-events-none",
            isMiniMode ? "opacity-0" : "opacity-100 delay-500 pointer-events-auto"
          )}>
            {/* Floating Hearts/Emojis */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {floatingItems.map(item => (
                <div key={item.id} className="absolute bottom-20 animate-heart-fly" style={{ left: `${item.left}%` }}>
                  {item.type === 'heart' ? (
                    <Heart fill="currentColor" size={32} className="text-brand-pink-accent" />
                  ) : (
                    <span className="text-3xl filter drop-shadow-lg">{item.content}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-20" />

            {/* Header */}
            <LiveHeader 
              activeProduct={activeProduct} 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
              onMiniModeChange={onMiniModeChange} 
              onBack={onBack} 
              onProductListOpen={onProductListOpen} 
              showAlert={showAlert} 
              likeCount={likeCount} 
              onLike={handleLike} 
              onReaction={handleReaction} 
              viewerCount={viewerCount} 
            />

            {/* Bottom Section: Chat Preview (Desktop Only) + Interaction Sidebar */}
            <div className="absolute bottom-0 left-0 right-0 z-[60] flex flex-col pointer-events-none pb-10">
              <div className="flex items-end justify-between px-4 w-full">
                <div className="flex-1 min-w-0 flex flex-col gap-2 pr-6">
                  {/* Desktop doesn't show chat preview - it's on the right panel */}
                </div>

                <LiveInteractionSidebar 
                  isAdmin={isAdmin} 
                  onLike={handleLike} 
                  isLiked={isLiked} 
                  likeCount={likeCount} 
                  onChatExpand={() => {}} // Desktop에서는 우측 패널에 채팅이 표시됨
                  onDetailOpen={onProductListOpen} 
                  onProductSheetOpen={() => setIsProductSheetOpen(true)} 
                  onShowGuide={() => showAlert('라이브 이용 가이드 💡', guideInfo, 'info')} 
                  onControlOpen={() => setShowControlPanel(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Panel (380px - 450px responsive) */}
        <div 
          className={cn(
            "h-full bg-zinc-900 border-l border-white/10 flex-col overflow-hidden relative transition-opacity duration-500",
            isMiniMode ? "hidden" : "flex w-[380px] xl:w-[450px] opacity-100 delay-500"
          )}
        >
          <div className="p-6 border-b border-white/5">
            <h3 className="text-white font-black text-xl">실시간 대화</h3>
          </div>
          <LiveChatSheet 
            isOpen={true} 
            isDesktopInline={true} 
            onClose={() => {}} 
            messages={filteredChatMessages} 
            message={message} 
            setMessage={setMessage} 
            onSend={handleSend} 
            isAdmin={isAdmin} 
            productList={displayProducts} 
            onProductClick={onProductClick} 
          />
        </div>
      </div>

      {/* Sheets & Modals */}
      <div className={cn(
        "fixed inset-0 z-[7000] pointer-events-none transition-opacity duration-300",
        isMiniMode ? "opacity-0" : "opacity-100"
      )}>
        {/* Product List View */}
        <LiveProductListView 
          isOpen={isProductListOpen} 
          onClose={() => setIsProductListOpen(false)} 
          products={allProducts} 
          liveProductIds={liveProductIds} 
          onProductClick={onProductClick} 
        />

        {/* Admin Control Panel */}
        {showControlPanel && (
          <AdminLiveControlPanel 
            config={config}
            onClose={() => setShowControlPanel(false)}
            showAlert={showAlert}
            currentShortformVideoUrl={currentShortformVideoUrl}
            setCurrentShortformVideoUrl={setCurrentShortformVideoUrl}
            guideInfo={guideInfo}
            setGuideInfo={setGuideInfo}
          />
        )}

        {/* Product Push Sheet (Admin) */}
        <LiveProductPushSheet 
          isOpen={isProductSheetOpen} 
          onClose={() => setIsProductSheetOpen(false)} 
          allProducts={allProducts} 
          onPushToLive={onPushToLive} 
        />

        {/* Order Sheet */}
        <LiveOrderSheet 
          isOpen={isSheetOpen} 
          onClose={() => setIsSheetOpen(false)} 
          activeProduct={activeProduct} 
          formData={formData} 
          setFormData={setFormData} 
          onSubmitOrder={handleOrderSubmit} 
          loading={loading} 
          config={config} 
          showAlert={() => {}} 
        />
      </div>

      {/* Mini Mode Controls */}
      <div 
        className={cn(
          "fixed z-[9000] pointer-events-none transition-opacity duration-300",
          isMiniMode ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: miniWidth, 
          height: miniHeight, 
          transformOrigin: 'top left',
          transform: isMiniMode 
            ? `translate(calc(100vw - ${miniPos.x + (viewportSize.width < 640 ? 136 : 200)}px), calc(100dvh - ${miniPos.y + (viewportSize.width < 640 ? 220 : 340)}px))`
            : `translate(0, ${touchDeltaY}px)`,
          transition: isSwiping ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease-in-out',
        }}
      >
        <div className="absolute top-1.5 left-1.5">
          <GlassIconButton 
            onClick={(e) => { e.stopPropagation(); onMiniModeChange(false); }} 
            className="w-8 h-8 bg-black/60"
          >
            <Maximize2 size={14} />
          </GlassIconButton>
        </div>
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2">
          <GlassIconButton 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} 
            className="w-8 h-8 bg-black/60"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </GlassIconButton>
        </div>
        <div className="absolute top-1.5 right-1.5">
          <GlassIconButton 
            onClick={(e) => { e.stopPropagation(); onBack(); }} 
            className="w-8 h-8 bg-black/60"
          >
            <X size={14} />
          </GlassIconButton>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-brand-pink/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[8px] font-black text-white">
          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-24 left-4 right-4 z-[10000] pointer-events-none flex flex-col gap-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold animate-slide-in flex items-center gap-2 self-start border border-white/10"
          >
            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
            {n.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default LiveCommerceDesktop;

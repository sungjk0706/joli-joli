import React, { useState } from 'react';
import AdminHeader from '../AdminHeader';
import { SweetAlert } from '../../ui/Common';
import { 
  LayoutDashboard, Radio, ShoppingCart, Settings, 
  TrendingUp, Users, Package, ChevronRight, 
  Zap, Gift, Pin, Save, Key, Share2, Store,
  Phone, Mail, ShieldCheck, CreditCard, Bell
} from 'lucide-react';
import BrandBackground from '../../ui/BrandBackground';
import { cn } from '../../../utils/cn';

const AdminMobileView = ({ logic, activeTab, setActiveTab, onBack, onEnterLiveControl }) => {
  const {
    isLoggedIn, handleLogout,
    showGuide, setShowGuide, alert, hideAlert, showAlert,
    isOrderingActive, handleToggleOrdering,
    orders, products, config,
    handleUpdateStatus, handlePushToLive, handleToggleStock,
    handleSaveSettings, shortformVideoUrl, setShortformVideoUrl,
    // 설정 관련
    telegram, setTelegram,
    newPassword, setNewPassword,
    shopName, setShopName,
    shopSubtitle, setShopSubtitle,
    shopNotice, setShopNotice,
    instaUrl, setInstaUrl,
    bankInfo, setBankInfo,
    portoneConfig, setPortoneConfig,
    businessInfo, setBusinessInfo,
  } = logic;

  // 1. 대시보드 탭 콘텐츠
  const renderDashboard = () => {
    const todayOrders = orders.filter(o => {
      const today = new Date().toISOString().split('T')[0];
      return o.created_at.startsWith(today);
    });
    const totalSales = todayOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl">
            <div className="w-10 h-10 bg-brand-pink/20 rounded-2xl flex items-center justify-center text-brand-pink mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-gray-500 font-bold text-xs mb-1">오늘 매출</p>
            <p className="text-xl font-black text-gray-900">{totalSales.toLocaleString()}원</p>
          </div>
          <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
              <ShoppingCart size={20} />
            </div>
            <p className="text-gray-500 font-bold text-xs mb-1">오늘 주문</p>
            <p className="text-xl font-black text-gray-900">{todayOrders.length}건</p>
          </div>
        </div>

        <div className="glass-gradient p-6 rounded-[2.5rem] border border-white/40 shadow-xl">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand-pink" /> 최근 주문 현황
          </h3>
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-white/40 rounded-2xl border border-white/20">
                <div>
                  <p className="font-black text-sm text-gray-900">{order.customer_name}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{order.product_name} × {order.quantity}</p>
                </div>
                <span className="px-3 py-1 bg-brand-pink/10 text-brand-pink text-[10px] font-black rounded-full border border-brand-pink/20">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab('orders')} className="w-full mt-4 py-3 text-gray-400 font-bold text-xs flex items-center justify-center gap-1">
            전체 주문 보기 <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // 2. 상품 탭 콘텐츠 (모바일 경량화 - 재고 ON/OFF 중심)
  const renderProducts = () => {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="font-black text-gray-900 text-xl">상품 관리</h3>
          <span className="text-xs text-gray-500 font-bold">총 {products.length}개</span>
        </div>

        {/* 상품 목록 */}
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="glass-gradient p-4 rounded-[2rem] border border-white/40 shadow-xl">
              <div className="flex items-center gap-3">
                {/* 상품 이미지 */}
                <div className="w-14 h-14 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-brand-pink font-bold">{product.price.toLocaleString()}원</p>
                  <p className="text-[10px] text-gray-400 font-bold">
                    재고: {product.stock ?? '∞'} · 판매: {product.sales_count ?? 0}회
                  </p>
                </div>

                {/* 재고 토글 스위치 */}
                <button
                  onClick={() => handleToggleStock(product.id, !product.is_active)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0",
                    product.is_active !== false ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow",
                    product.is_active !== false ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {/* 상태 배지 */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black",
                  product.is_active !== false 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-100 text-gray-500"
                )}>
                  {product.is_active !== false ? '판매중' : '품절'}
                </span>
                {product.liveEmoji && (
                  <span className="px-2 py-0.5 bg-brand-pink/10 text-brand-pink rounded-full text-[10px] font-black">
                    {product.liveEmoji} 라이브
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="glass-gradient p-4 rounded-2xl border border-white/40 mt-6">
          <p className="text-[11px] text-gray-500 font-bold text-center">
            💡 상품 추가/삭제 및 상세 수정은 PC 환경에서 이용해주세요
          </p>
        </div>
      </div>
    );
  };

  // 3. 라방 제어 (리모컨) 탭 콘텐츠
  const renderLiveControl = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* 리모컨 상단: 방송 상태 및 영상 제어 */}
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-brand-pink/20 group bg-black">
          <video src={shortformVideoUrl} className="w-full h-full object-cover opacity-60" muted autoPlay loop playsInline />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
              <div className="bg-brand-pink/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white">LIVE STREAMING</span>
              </div>
              <button onClick={onEnterLiveControl} className="w-10 h-10 glass rounded-full flex items-center justify-center text-white">
                <Pin size={18} />
              </button>
            </div>
            <div>
              <p className="text-white font-black text-lg">실시간 방송 리모컨</p>
              <p className="text-white/60 text-xs font-bold mt-1">지금 모든 시청자가 이 영상을 보고 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 액션 그리드: 즉시 실행 도구 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => logic.showAlert('도파민 트리거', '축하 효과를 모든 시청자에게 보냈습니다!', 'success')}
            className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl flex flex-col items-center gap-3 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
              <Zap size={24} />
            </div>
            <span className="font-black text-gray-900 text-sm">축하 효과</span>
          </button>
          <button 
            onClick={() => logic.showAlert('이벤트 시작', '실시간 추첨 이벤트를 가동합니다.', 'info')}
            className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl flex flex-col items-center gap-3 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600">
              <Gift size={24} />
            </div>
            <span className="font-black text-gray-900 text-sm">추첨 이벤트</span>
          </button>
        </div>

        {/* 상품 송출 관리 */}
        <div className="glass-gradient p-6 rounded-[2.5rem] border border-white/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-brand-pink" /> 방송 상품 순서 제어
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">드래그하여 순서 변경 가능</span>
          </div>
          <div className="space-y-3">
            {products.slice(0, 4).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-white/20">
                <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-brand-pink font-bold">현재 {index + 1}순위 송출 중</p>
                </div>
                <button 
                  onClick={() => handlePushToLive(product)}
                  className="w-10 h-10 bg-brand-pink/10 rounded-xl flex items-center justify-center text-brand-pink shadow-sm active:scale-90 transition-all"
                >
                  <Pin size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 4. 주문 탭 콘텐츠
  const renderOrders = () => {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="font-black text-gray-900 text-xl">실시간 주문</h3>
          <span className="text-xs text-gray-500 font-bold">총 {orders.length}건</span>
        </div>
        {orders.map(order => (
          <div key={order.id} className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-brand-pink">
                  {order.customer_name[0]}
                </div>
                <div>
                  <p className="font-black text-gray-900">{order.customer_name}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-brand-pink">{(order.price * order.quantity).toLocaleString()}원</p>
                <p className="text-[10px] text-gray-400 font-bold">{order.payment_method}</p>
              </div>
            </div>
            <div className="h-px bg-white/20 w-full" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">{order.product_name} × {order.quantity}개</p>
              <select 
                value={order.status}
                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                className="bg-white/50 border border-white/40 rounded-xl px-3 py-1.5 text-[10px] font-black focus:outline-none"
              >
                <option value="입금대기">입금대기</option>
                <option value="입금완료">입금완료</option>
                <option value="배송중">배송중</option>
                <option value="배송완료">배송완료</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 5. 설정 탭 콘텐츠 (모바일 경량화 버전)
  const renderSystem = () => {
    const InputField = ({ label, value, onChange, placeholder, type = 'text' }) => (
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{label}</label>
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white/60 border-2 border-white/80 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-brand-pink transition-all"
        />
      </div>
    );

    return (
      <div className="space-y-5 animate-fade-in pb-32">
        {/* 주문 ON/OFF 빠른 토글 */}
        <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", isOrderingActive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-500")}>
                <Bell size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">주문 접수</p>
                <p className={cn("text-[10px] font-bold", isOrderingActive ? "text-green-600" : "text-red-500")}>
                  {isOrderingActive ? '현재 주문 받는 중' : '주문 마감됨'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleOrdering}
              className={cn(
                "w-14 h-7 rounded-full transition-all duration-300 relative",
                isOrderingActive ? "bg-green-500" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow",
                isOrderingActive ? "left-8" : "left-1"
              )} />
            </button>
          </div>
        </div>

        {/* 상점 기본 정보 */}
        <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Store size={16} className="text-brand-pink" />
            <h3 className="font-black text-gray-900 text-sm">상점 기본 정보</h3>
          </div>
          <InputField label="상점 이름" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="예: 졸리졸리" />
          <InputField label="슬로건/부제목" value={shopSubtitle} onChange={e => setShopSubtitle(e.target.value)} placeholder="예: 프리미엄 아동복" />
          <InputField label="인스타그램 URL" value={instaUrl} onChange={e => setInstaUrl(e.target.value)} placeholder="https://instagram.com/..." />
        </div>

        {/* 계좌 정보 */}
        <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-brand-pink" />
            <h3 className="font-black text-gray-900 text-sm">입금 계좌</h3>
          </div>
          <InputField label="은행명" value={bankInfo?.bank} onChange={e => setBankInfo({ ...bankInfo, bank: e.target.value })} placeholder="예: 카카오뱅크" />
          <InputField label="계좌번호" value={bankInfo?.account} onChange={e => setBankInfo({ ...bankInfo, account: e.target.value })} placeholder="000-000-000000" />
          <InputField label="예금주" value={bankInfo?.holder} onChange={e => setBankInfo({ ...bankInfo, holder: e.target.value })} placeholder="예: 홍길동" />
        </div>

        {/* 텔레그램 알림 */}
        <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={16} className="text-brand-pink" />
            <h3 className="font-black text-gray-900 text-sm">텔레그램 주문 알림</h3>
          </div>
          <InputField label="봇 토큰" value={telegram?.token} onChange={e => setTelegram({ ...telegram, token: e.target.value })} placeholder="Bot Token" />
          <InputField label="채팅 ID" value={telegram?.chatId} onChange={e => setTelegram({ ...telegram, chatId: e.target.value })} placeholder="Chat ID" />
        </div>

        {/* 보안: 비밀번호 변경 */}
        <div className="glass-gradient p-5 rounded-[2rem] border border-white/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-brand-pink" />
            <h3 className="font-black text-gray-900 text-sm">관리자 비밀번호 변경</h3>
          </div>
          <InputField type="password" label="새 비밀번호" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="변경할 비밀번호" />
          <p className="text-[10px] text-gray-400 font-bold">공백으로 두면 변경되지 않습니다.</p>
        </div>

        {/* 저장 버튼 */}
        <div className="fixed bottom-24 left-4 right-4 z-50">
          <button
            onClick={handleSaveSettings}
            className="w-full py-4 bg-brand-pink-dark text-white font-black text-sm rounded-2xl shadow-xl shadow-brand-pink/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save size={18} />
            설정 저장하기
          </button>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', label: '홈', icon: LayoutDashboard },
    { id: 'products', label: '상품', icon: Package },
    { id: 'live', label: '라방제어', icon: Radio },
    { id: 'orders', label: '주문', icon: ShoppingCart },
    { id: 'system', label: '설정', icon: Settings },
  ];

  return (
    <BrandBackground className="flex flex-col h-screen overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        <AdminHeader onShowGuide={() => setShowGuide(true)} onBack={onBack} onLogout={handleLogout} isOrderingActive={isOrderingActive} onToggleOrdering={handleToggleOrdering} />
        
        <main className="flex-1 overflow-y-auto p-4 pb-32 scrollbar-hide">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'live' && renderLiveControl()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'system' && renderSystem()}
        </main>

        <nav className="fixed bottom-6 left-6 right-6 z-50">
          <div className="glass-gradient rounded-[2.5rem] shadow-2xl border border-white/50 px-2 py-2 flex items-center justify-around backdrop-blur-2xl">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-brand-pink text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
                <span className="text-[10px] font-black">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      <SweetAlert isOpen={alert.show} onClose={hideAlert} title={alert.title} message={alert.message} type={alert.type} showCancel={alert.showCancel} onConfirm={alert.onConfirm} />
    </BrandBackground>
  );
};

export default AdminMobileView;

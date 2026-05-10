import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { AlertCircle } from 'lucide-react'
import { useLiveStore } from './stores/liveStore'

// 분리된 컴포넌트들 불러오기 (Dynamic Import)
import SetupView from './components/SetupView';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';

// 관리자 로그인 버튼 컴포넌트 - document.body에 직접 포탈 렌더링
const AdminLoginButton = ({ onClick, isVisible }) => {
  useEffect(() => {
    if (!isVisible) return;
    
    // body에 pointer-events-none가 있으면 클릭이 안될 수 있으므로 확인
    const body = document.body;
    const originalPointerEvents = body.style.pointerEvents;
    
    return () => {
      body.style.pointerEvents = originalPointerEvents;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const buttonContent = (
    <button
      id="admin-login-trigger"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[Admin Button] Clicked!');
        onClick();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      className="joli-admin-btn"
      title="관리자 로그인"
      type="button"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8E8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M3 5h4"/>
        <path d="M21 17v4"/>
        <path d="M19 19h4"/>
      </svg>
    </button>
  );

  return createPortal(buttonContent, document.body);
};

function App() {
  const [view, setView] = useState('customer') // customer | admin | setup
  const [adminTab, setAdminTab] = useState('orders');
  const isLive = useLiveStore(state => state.isLive);
  const isMiniMode = useLiveStore(state => state.isMiniMode);

  useEffect(() => {
    // 초기 로드 시 히스토리 상태 확인 (새로고침 대응)
    const savedState = window.history.state
    if (savedState) {
      if (savedState.view) setView(savedState.view);
      if (savedState.adminTab) setAdminTab(savedState.adminTab);
    } else if (!isSupabaseConfigured()) {
      setView('setup')
    }

    // 초기 히스토리 상태 설정 (상태가 없을 때만)
    if (!savedState) {
      window.history.replaceState({ view: 'customer', adminTab: 'orders' }, '')
    }

    const handlePopState = (e) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
        if (e.state.adminTab) {
          setAdminTab(e.state.adminTab);
        }
      } else {
        setView('customer');
      }
    };
    window.addEventListener('popstate', handlePopState);

    const handleViewChange = (e) => {
      const newView = e.detail;
      setView(newView);
      window.history.pushState({ view: newView, adminTab }, '');
    };
    window.addEventListener('changeView', handleViewChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('changeView', handleViewChange);
    }
  }, [adminTab]);

  const navigateTo = (newView) => {
    setView(newView);
    window.history.pushState({ view: newView, adminTab }, '');
  };

  const handleAdminTabChange = (tab) => {
    setAdminTab(tab);
    window.history.pushState({ view: 'admin', adminTab: tab }, '');
  };

  const renderContent = () => {
    try {
      if (view === 'setup') return <SetupView onSkip={() => setView('customer')} />;
      
      if (view === 'admin') {
        return (
          <AdminView 
            onBack={() => setView('customer')} 
            onEnterLiveControl={() => setView('admin-live')}
            activeTab={adminTab}
            setActiveTab={handleAdminTabChange}
          />
        );
      }

      if (view === 'admin-live') {
        return (
          <CustomerView 
            isAdminMode={true} 
            onExitAdminLive={(tab) => {
              if (tab) setAdminTab(tab);
              setView('admin');
            }} 
          />
        );
      }

      return <CustomerView />;
    } catch (err) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-black mb-2">화면 로드 중 오류가 발생했습니다</h2>
          <p className="text-sm text-gray-500 mb-6">{err.message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-brand-pink text-white rounded-2xl font-bold">새로고침</button>
        </div>
      );
    }
  };

  const handleAdminLogin = () => {
    console.log('[Admin Login] Opening admin view...');
    setView('admin');
    window.history.pushState({ view: 'admin', adminTab: 'orders' }, '');
  };

  return (
    <>
      {/* 관리자 로그인 버튼 - 라이브 모드(전체화면)일 때는 숨김 */}
      <AdminLoginButton 
        onClick={handleAdminLogin} 
        isVisible={view === 'customer' && (!isLive || isMiniMode)} 
      />

      {/* Portal용 스타일 - 전역 CSS로 버튼 스타일 정의 */}
      {view === 'customer' && (
        <style>{`
          .joli-admin-btn {
            position: fixed !important;
            bottom: 24px !important;
            left: 24px !important;
            width: 44px !important;
            height: 44px !important;
            background: rgba(255, 255, 255, 0.4) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.7) !important;
            border-radius: 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            z-index: 10000 !important;
            box-shadow: 0 8px 32px 0 rgba(255, 142, 142, 0.1) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .joli-admin-btn:active {
            transform: scale(0.9) !important;
            background: rgba(255, 255, 255, 0.6) !important;
          }
        `}</style>
      )}

      <div className="h-screen flex flex-col overflow-hidden relative bg-brand-pink-light" style={{ pointerEvents: 'auto' }}>
        {/* 미리보기 안내 바 */}
        {view === 'customer' && !isSupabaseConfigured() && (
          <div className="bg-yellow-400 text-yellow-900 px-4 py-3 text-xs text-center font-black flex items-center justify-center gap-2 relative z-[100] shadow-md">
            <AlertCircle size={14} />
            현재 미리보기 모드입니다. 실제 주문 기능을 사용하려면 설정을 완료해주세요.
            <button onClick={() => setView('setup')} className="underline ml-2 hover:text-black">설정하기</button>
          </div>
        )}
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 w-full h-full relative overflow-hidden bg-white/30">
          <React.Suspense fallback={<div className="h-screen flex items-center justify-center bg-zinc-50 text-brand-pink font-black animate-pulse">JOLI JOLI...</div>}>
            {renderContent()}
          </React.Suspense>
        </main>
      </div>
    </>
  )
}

export default App

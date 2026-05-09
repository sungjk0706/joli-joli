import React, { useState, useEffect } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { Settings, AlertCircle } from 'lucide-react'

// 분리된 컴포넌트들 불러오기
import SetupView from './components/SetupView'
import CustomerView from './components/CustomerView'
import AdminView from './components/AdminView'

function App() {
  const [view, setView] = useState('customer') // customer | admin | setup
  const [adminTab, setAdminTab] = useState('orders');

  useEffect(() => {
    // 초기 로드 시 히스토리 상태 확인 (새로고침 대응)
    const savedState = window.history.state
    if (savedState && savedState.view) {
      setView(savedState.view)
    } else if (!isSupabaseConfigured()) {
      setView('setup')
    }

    // 초기 히스토리 상태 설정 (상태가 없을 때만)
    if (!savedState) {
      window.history.replaceState({ view: 'customer' }, '')
    }

    const handlePopState = (e) => {
      if (e.state && e.state.view) {
        setView(e.state.view)
      } else {
        // 히스토리 상태가 없거나 view 정보가 누락된 경우 안전하게 고객 모드로 복구
        setView('customer')
      }
    }
    window.addEventListener('popstate', handlePopState)

    // 하위 컴포넌트에서 뷰 전환을 요청할 때 사용하는 이벤트 리스너
    const handleViewChange = (e) => {
      const newView = e.detail
      setView(newView)
      window.history.pushState({ view: newView }, '')
    }
    window.addEventListener('changeView', handleViewChange)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('changeView', handleViewChange)
    }
  }, [])

  const navigateTo = (newView) => {
    setView(newView)
    window.history.pushState({ view: newView }, '')
  }

  // 초기 설정이 안되어 있으면 설정 화면으로
  if (view === 'setup') return <SetupView onSkip={() => setView('customer')} />
  
  // 관리자 모드
  if (view === 'admin') return (
    <AdminView 
      onBack={() => navigateTo('customer')} 
      onEnterLiveControl={() => navigateTo('admin-live')}
      activeTab={adminTab}
      setActiveTab={setAdminTab}
    />
  )

  // 관리자 전용 라방 컨트롤 모드
  if (view === 'admin-live') return (
    <CustomerView 
      isAdminMode={true} 
      onExitAdminLive={(tab) => {
        if (tab) setAdminTab(tab);
        navigateTo('admin');
      }} 
    />
  )

  // 기본 고객 화면
  return (
    <div className="min-h-screen relative">
      {/* 상단 고정 관리자 로그인 버튼 */}
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={() => setView('admin')}
          className="flex items-center justify-center w-14 h-14 text-brand-pink-dark bg-white/80 backdrop-blur-md rounded-full border-2 border-brand-pink/30 shadow-lg hover:scale-110 active:scale-95 transition-all"
          title="관리자 로그인"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* 미리보기 안내 바 */}
      {!isSupabaseConfigured() && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-[10px] text-center font-bold flex items-center justify-center gap-2">
          <AlertCircle size={12} />
          현재 미리보기 모드입니다. 실제 주문 기능을 사용하려면 설정을 완료해주세요.
          <button onClick={() => setView('setup')} className="underline ml-2">설정하기</button>
        </div>
      )}
      
      {/* 메인 고객 페이지 */}
      <CustomerView />
      
      {/* 공통 푸터 */}
      <footer className="py-20 text-center relative">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-8 h-px bg-brand-pink mx-auto mb-2 opacity-30"></div>
          <p className="text-[11px] font-bold text-brand-pink-dark tracking-widest uppercase">joli.joli Live Collection</p>
          <p className="text-[10px] text-gray-400">© 2026 Style Live. All rights reserved.</p>
        </div>
        
        <div className="flex justify-center items-center gap-4">
          {!isSupabaseConfigured() && (
            <button 
              onClick={() => setView('setup')}
              className="text-[10px] text-gray-400 hover:text-brand-pink-dark transition-colors font-bold"
            >
              시스템 설정
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App

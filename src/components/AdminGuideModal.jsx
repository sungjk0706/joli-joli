import React from 'react'
import { HelpCircle, ChevronRight } from 'lucide-react'

const AdminGuideModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-slide-up" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10 border-b flex justify-between items-center bg-brand-pink-light">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-brand-pink-dark">
            <HelpCircle size={32} />
            상점 관리 초보자 가이드
          </h2>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all">
            <ChevronRight size={32} className="rotate-90" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
          {/* Step 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-brand-pink text-brand-pink-contrast rounded-full flex items-center justify-center font-black text-lg shadow-lg">1</span>
              <h3 className="font-bold text-xl">상품 등록하기 (라방 준비!)</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl space-y-3 text-base text-gray-600 leading-relaxed border-l-8 border-brand-pink shadow-inner">
              <p>• <span className="font-bold text-gray-900">[상품 관리]</span> 탭에서 새 상품을 등록해 보세요.</p>
              <p>• <span className="font-bold text-gray-900">사진</span>은 핸드폰으로 바로 찍거나 갤러리에서 고를 수 있어요.</p>
              <p>• <span className="font-bold text-gray-900">옵션</span>란에는 "핑크, 화이트 / S, M" 처럼 적어두면 손님이 고르기 편해요.</p>
              <p>• 라방 중에 품절된 옷은 <span className="font-bold text-gray-900">[품절 처리]</span> 버튼을 누르면 즉시 주문이 차단돼요.</p>
            </div>
          </section>

          {/* Step 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-brand-blue text-brand-blue-contrast rounded-full flex items-center justify-center font-black text-lg shadow-lg">2</span>
              <h3 className="font-bold text-xl">주문 확인 & 입금 체크 (실시간!)</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl space-y-3 text-base text-gray-600 leading-relaxed border-l-8 border-brand-blue shadow-inner">
              <p>• 새 주문이 들어오면 <span className="font-bold text-brand-pink-dark">"띵동!"</span> 소리와 함께 목록이 자동으로 나타나요.</p>
              <p>• 입금을 확인하셨다면 <span className="font-bold text-gray-900">[입금 확인]</span> 버튼을 눌러 상태를 변경해 주세요.</p>
              <p>• <span className="font-bold text-gray-900">주문자명과 입금자명</span>이 다를 수 있으니 목록에서 꼭 비교해 보세요!</p>
              <p>• 취소된 주문이나 중복 주문은 <span className="font-bold text-gray-900">[삭제]</span> 버튼으로 정리할 수 있어요.</p>
            </div>
          </section>

          {/* Step 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">3</span>
              <h3 className="font-bold text-xl">주문 알림 받기 (강력 추천!)</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl space-y-3 text-base text-gray-600 leading-relaxed border-l-8 border-purple-400 shadow-inner">
              <p>• 바빠서 화면을 못 볼 때는 <span className="font-bold text-gray-900">텔레그램 알림</span>이 최고예요!</p>
              <p>• <span className="font-bold text-gray-900">[시스템 설정]</span> 탭 하단에서 텔레그램 봇 설정을 완료하세요.</p>
              <p>• 설정해두면 손님이 주문할 때마다 핸드폰으로 알림이 띠링! 하고 바로 와요.</p>
            </div>
          </section>

          {/* Step 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">4</span>
              <h3 className="font-bold text-xl">계좌 및 카카오페이 설정</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl space-y-3 text-base text-gray-600 leading-relaxed border-l-8 border-green-400 shadow-inner">
              <p>• <span className="font-bold text-gray-900">[시스템 설정]</span>의 '입금 및 송금 계좌 설정'을 꼭 확인해 주세요.</p>
              <p>• <span className="font-bold text-gray-900">은행명, 계좌번호</span>를 넣으면 고객 주문 완료 페이지에 자동으로 표시돼요.</p>
              <p>• <span className="font-bold text-gray-900">카카오페이 링크</span>를 넣으면 손님이 버튼 하나로 즉시 송금할 수 있어요!</p>
              <p className="text-sm text-brand-pink-dark font-bold italic">* 이 설정이 완료되어야 손님들이 편하게 입금할 수 있습니다.</p>
            </div>
          </section>

          <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm">
            <p className="text-center text-yellow-800 text-base font-bold leading-relaxed">
              팁: 우리 상점 주소를 인스타 프로필 링크에 걸어두면<br/>
              손님들이 훨씬 더 편하게 주문할 수 있어요!
            </p>
          </div>
        </div>
        
        <div className="p-8 bg-gray-50">
          <button onClick={onClose} className="btn-primary w-full py-5 text-xl font-black shadow-xl">확인했습니다! 화이팅!</button>
        </div>
      </div>
    </div>
  )
}

export default AdminGuideModal

import React from 'react'
import { Camera, ClipboardList } from 'lucide-react'

const QRCodeModal = ({ onClose }) => {
  const shopUrl = "https://joli-joli.vercel.app"
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${shopUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shopUrl)
    alert('상점 주소가 복사되었습니다!')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center p-10 animate-slide-up text-center" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-24 h-24 bg-brand-pink-light rounded-full flex items-center justify-center mb-8 text-brand-pink-dark">
          <Camera size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-3">내 상점 공유하기</h2>
        <p className="text-gray-400 text-base mb-10 leading-relaxed">
          손님 카메라로 아래 QR 코드를 스캔하면<br/>
          즉시 우리 상점으로 연결돼요! 🧸
        </p>
        
        <div className="p-6 bg-white border-8 border-brand-pink-light rounded-[3rem] mb-10 shadow-inner">
          <img src={qrUrl} alt="상점 QR 코드" className="w-64 h-64 rounded-2xl" />
        </div>

        <div className="w-full space-y-4">
          <button onClick={handleCopy} className="btn-secondary w-full py-5 text-lg flex items-center justify-center gap-3 font-bold shadow-lg">
            <ClipboardList size={22} /> 상점 주소 복사하기
          </button>
          <button onClick={onClose} className="w-full py-4 text-gray-400 font-bold text-lg">닫기</button>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal

import React, { useState } from 'react'
import { productService } from '../services/productService'
import { Settings, Camera, Eye, EyeOff, Layout, BellRing, Save, ShieldCheck, Share2, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { Button, Input, Textarea, Card, SectionHeading } from './ui/Common'

const AdminSettings = ({
  newPassword, setNewPassword, shopName, setShopName, shopSubtitle, setShopSubtitle,
  shopNotice, setShopNotice, instaUrl, setInstaUrl, bankInfo, setBankInfo,
  telegram, setTelegram, shortformVideoUrl, setShortformVideoUrl, onSaveSettings
}) => {
  const [showPass, setShowPass] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    try {
      const publicUrl = await productService.uploadImage(file)
      setShortformVideoUrl(publicUrl)
    } catch (error) {
      console.error('Video upload error:', error)
      alert('영상 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploadingVideo(false)
    }
  }

  const sampleVideos = [
    { name: '샘플 1 (졸리졸리 브랜딩)', url: '/joli-joli.mp4' },
    { name: '샘플 2 (인스타 스타일)', url: '/인스타.mp4' }
  ]

  return (
    <form onSubmit={onSaveSettings} className="space-y-10 animate-fade-in pb-24">
      {/* ... (생략) ... */}
      {/* 3. 라이브 및 숏폼 설정 */}
      <Card className="p-10 border-2 border-brand-pink-light/30">
        <SectionHeading icon={Camera}>라이브 및 숏폼 설정</SectionHeading>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input 
                label="기본 숏폼 영상 URL (방송 중이 아닐 때)" 
                placeholder="예: /인스타.mp4 또는 외부 영상 링크" 
                value={shortformVideoUrl} 
                onChange={e => setShortformVideoUrl(e.target.value)} 
              />
            </div>
            <div className="shrink-0 mb-0.5 w-full sm:w-auto">
              <input 
                type="file" 
                id="video-upload" 
                className="hidden" 
                accept="video/*" 
                onChange={handleVideoUpload}
              />
              <label htmlFor="video-upload" className="block w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto h-[60px] px-8 flex items-center justify-center gap-2 border-brand-pink text-brand-pink hover:bg-brand-pink/5"
                  disabled={uploadingVideo}
                  onClick={() => document.getElementById('video-upload').click()}
                >
                  {uploadingVideo ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {uploadingVideo ? '업로드 중...' : '파일 찾기'}
                </Button>
              </label>
            </div>
          </div>

          {/* 샘플 영상 퀵 선택 */}
          <div className="flex flex-wrap gap-2 mt-4 ml-1">
            <span className="admin-label w-full mb-1">프로젝트 내장 샘플 영상 바로 선택:</span>
            {sampleVideos.map((video, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setShortformVideoUrl(video.url)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border-2 ${
                  shortformVideoUrl === video.url 
                    ? 'bg-brand-pink/10 border-brand-pink text-brand-pink-dark shadow-sm' 
                    : 'bg-gray-50 border-gray-100 admin-text-secondary hover:bg-gray-100'
                }`}
              >
                {video.name}
              </button>
            ))}
          </div>

          {shortformVideoUrl && !uploadingVideo && (
            <div className="flex items-center gap-2 text-[11px] text-green-500 font-bold ml-1 animate-fade-in">
              <CheckCircle2 size={12} /> 영상 주소가 성공적으로 설정되었습니다.
            </div>
          )}
          <p className="admin-text-secondary text-xs ml-1">라이브 방송 송출이 없을 때 자동으로 반복 재생될 영상입니다. 직접 파일을 업로드하거나 주소를 입력, 또는 위 샘플을 선택하세요.</p>
        </div>
      </Card>

      {/* 4. 외부 서비스 연동 */}
      <Card className="p-10 border-2 border-brand-blue-light/30">
        <SectionHeading icon={Share2}>외부 서비스 및 결제 연동</SectionHeading>
        <div className="space-y-8">
          <Input label="인스타그램 상점 주소" placeholder="https://instagram.com/..." value={instaUrl} onChange={e => setInstaUrl(e.target.value)} />
          
          <div className="space-y-4">
            <label className="admin-label block mb-2 ml-1">입금 및 송금 계좌 설정</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/30 p-8 rounded-[2.5rem] border border-blue-100">
              <Input label="은행명" placeholder="예: 카카오뱅크" value={bankInfo.bank} onChange={e => setBankInfo({ ...bankInfo, bank: e.target.value })} />
              <Input label="계좌번호" placeholder="123-456-789012" value={bankInfo.account} onChange={e => setBankInfo({ ...bankInfo, account: e.target.value })} className="font-mono" />
              <Input label="예금주 성함" placeholder="예: 홍길동" value={bankInfo.holder} onChange={e => setBankInfo({...bankInfo, holder: e.target.value})} />
              <Input label="카카오페이 송금 링크" placeholder="https://qr.kakaopay.com/..." value={bankInfo.payLink} onChange={e => setBankInfo({ ...bankInfo, payLink: e.target.value })} />
            </div>
            <p className="admin-text-secondary text-xs mt-2 ml-4">카카오톡 {'>'} 페이 {'>'} 내 코드(QR) {'>'} 링크 복사해서 붙여넣으세요!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <Input label="텔레그램 봇 토큰" placeholder="Token" value={telegram.token} onChange={e => setTelegram({ ...telegram, token: e.target.value })} className="font-mono text-xs bg-gray-50" />
            <Input label="텔레그램 채팅 ID" placeholder="Chat ID" value={telegram.chatId} onChange={e => setTelegram({ ...telegram, chatId: e.target.value })} className="font-mono text-xs bg-gray-50" />
          </div>
        </div>
      </Card>
      
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex justify-center">
        <Button type="submit" variant="primary" className="w-full max-w-md py-6 text-xl shadow-2xl" icon={Save}>
          모든 설정 안전하게 저장하기
        </Button>
      </div>
    </form>
  )
}

export default AdminSettings

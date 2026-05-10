import React, { useState } from 'react'
import { productService } from '../services/productService'
import { Settings, Camera, Eye, EyeOff, Layout, BellRing, Save, ShieldCheck, Share2, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { Button, Input, Textarea, Card, SectionHeading } from './ui/Common'

const AdminSettings = ({
  newPassword, setNewPassword, shopName, setShopName, shopSubtitle, setShopSubtitle,
  shopNotice, setShopNotice, instaUrl, setInstaUrl, bankInfo, setBankInfo,
  telegram, setTelegram, shortformVideoUrl, setShortformVideoUrl,
  liveGuideInfo, setLiveGuideInfo, onSaveSettings
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await productService.uploadImage(file);
      setShortformVideoUrl(publicUrl);
    } catch (error) {
      console.error('업로드 실패:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={onSaveSettings} className="space-y-10 animate-fade-in pb-24">
      {/* 1. 상점 기본 정보 */}
      <Card className="p-10">
        <SectionHeading icon={Settings}>상점 기본 정보</SectionHeading>
        <div className="space-y-8">
          <Input label="상점 이름" placeholder="예: 졸리졸리" value={shopName} onChange={e => setShopName(e.target.value)} />
          <Input label="상점 부제목 (슬로건)" placeholder="예: 프리미엄 아동복 셀렉트숍" value={shopSubtitle} onChange={e => setShopSubtitle(e.target.value)} />
          <div className="space-y-2">
            <Textarea label="상점 공지사항 (메인 페이지 노출)" placeholder="배송 안내나 현재 진행 중인 이벤트를 적어주세요." value={shopNotice} onChange={e => setShopNotice(e.target.value)} rows={4} />
          </div>
        </div>
      </Card>

      {/* 2. 외부 서비스 연동 */}
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

      {/* 3. 라이브 방송 기본 설정 */}
      <Card className="p-10 border-2 border-brand-pink-light/30">
        <SectionHeading icon={Camera}>라이브 방송 및 안내 설정</SectionHeading>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="admin-label block ml-1 text-sm">기본 숏폼 영상 URL (또는 인스타 링크)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleVideoUpload}
                  ref={fileInputRef}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  className="px-4 py-2 h-auto text-[10px] font-bold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  icon={Upload}
                >
                  {isUploading ? '업로드 중...' : '파일 찾기'}
                </Button>
              </div>
            </div>
            <Input 
              placeholder="예: https://instagram.com/live/... 또는 업로드한 파일 주소" 
              value={shortformVideoUrl} 
              onChange={e => setShortformVideoUrl(e.target.value)} 
            />
            <p className="text-[10px] text-zinc-400 font-bold ml-2">라이브 방송이 없을 때 재생될 기본 영상 주소입니다. 개발 기간에는 임시 영상을, 실제 운영 시에는 인스타 링크를 입력하세요.</p>
          </div>

          <div className="space-y-4">
            <Textarea 
              label="라이브 이용 가이드 내용" 
              placeholder="시청자들에게 보여줄 안내 문구 (결제, 배송, 교환/환불 등)" 
              value={liveGuideInfo} 
              onChange={e => setLiveGuideInfo(e.target.value)} 
              rows={4}
            />
            <p className="text-[10px] text-zinc-400 font-bold ml-2">라이브 화면의 '?' 버튼 클릭 시 노출되는 정보입니다.</p>
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

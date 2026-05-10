import React, { useState } from 'react'
import { productService } from '../services/productService'
import { Settings, Camera, Eye, EyeOff, Layout, BellRing, Save, ShieldCheck, Share2, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { Button, Input, Textarea, Card, SectionHeading } from './ui/Common'

const AdminSettings = ({
  shopName, setShopName, shopSubtitle, setShopSubtitle,
  shopNotice, setShopNotice, instaUrl, setInstaUrl, bankInfo, setBankInfo,
  businessInfo, setBusinessInfo, portoneConfig, setPortoneConfig, onSaveSettings
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
      {/* 2. 사업자 정보 (Legally required) */}
      <Card className="p-10 border-2 border-zinc-200/50">
        <SectionHeading icon={ShieldCheck}>사업자 정보 설정</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input 
            label="대표자 성함" 
            placeholder="예: 홍길동" 
            value={businessInfo.ceo} 
            onChange={e => setBusinessInfo({ ...businessInfo, ceo: e.target.value })} 
          />
          <Input 
            label="사업자등록번호" 
            placeholder="000-00-00000" 
            value={businessInfo.businessNumber} 
            onChange={e => setBusinessInfo({ ...businessInfo, businessNumber: e.target.value })} 
          />
          <Input 
            label="통신판매업신고번호" 
            placeholder="제 2024-서울-0000호" 
            value={businessInfo.mailOrderNumber} 
            onChange={e => setBusinessInfo({ ...businessInfo, mailOrderNumber: e.target.value })} 
          />
          <Input 
            label="고객센터 전화번호" 
            placeholder="02-1234-5678" 
            value={businessInfo.phone} 
            onChange={e => setBusinessInfo({ ...businessInfo, phone: e.target.value })} 
          />
          <Input 
            label="대표 이메일" 
            placeholder="contact@joli-joli.com" 
            value={businessInfo.email} 
            onChange={e => setBusinessInfo({ ...businessInfo, email: e.target.value })} 
          />
          <Input 
            label="개인정보보호책임자" 
            placeholder="예: 홍길동" 
            value={businessInfo.privacyOfficer} 
            onChange={e => setBusinessInfo({ ...businessInfo, privacyOfficer: e.target.value })} 
          />
          <div className="md:col-span-2">
            <Input 
              label="사업장 소재지 (주소)" 
              placeholder="서울특별시 강남구..." 
              value={businessInfo.address} 
              onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })} 
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 font-bold mt-6 ml-2">
          * 위 정보는 전자상거래법에 따라 쇼핑몰 하단(Footer)에 의무적으로 표시되어야 하는 정보입니다.
        </p>
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

          <div className="space-y-4 pt-6 border-t border-brand-blue-light/20">
            <label className="admin-label block mb-2 ml-1">포트원(Portone) 카드 결제 설정</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-200">
              <Input 
                label="가맹점 식별코드 (Merchant ID)" 
                placeholder="imp00000000" 
                value={portoneConfig.merchantId} 
                onChange={e => setPortoneConfig({ ...portoneConfig, merchantId: e.target.value })} 
              />
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-brand-contrast/50 ml-3 uppercase tracking-widest">PG사 선택</label>
                <select 
                  value={portoneConfig.pg} 
                  onChange={e => setPortoneConfig({ ...portoneConfig, pg: e.target.value })}
                  className="w-full bg-white/40 border-2 border-white/80 rounded-2xl px-6 py-4 text-brand-contrast font-bold focus:outline-none focus:border-brand-pink transition-all"
                >
                  <option value="kcp">NHN KCP</option>
                  <option value="tosspayments">토스페이먼츠</option>
                  <option value="nice">나이스페이</option>
                  <option value="html5_inicis">KG이니시스</option>
                  <option value="kakaopay">카카오페이</option>
                </select>
              </div>
            </div>
            <p className="admin-text-secondary text-xs mt-2 ml-4">* 카드 결제를 활성화하려면 포트원 관리자 콘솔에서 발급받은 식별코드를 입력하세요.</p>
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

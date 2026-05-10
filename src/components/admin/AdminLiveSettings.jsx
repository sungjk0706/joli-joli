import React, { useState, useRef } from 'react';
import { Camera, Upload, Save } from 'lucide-react';
import { Card, SectionHeading, Input, Textarea, Button } from '../ui/Common';
import { productService } from '../../services/productService';

const AdminLiveSettings = ({ 
  shortformVideoUrl, setShortformVideoUrl, 
  liveGuideInfo, setLiveGuideInfo, 
  onSaveSettings 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    <Card className="p-10 border-2 border-brand-pink-light/30">
      <div className="flex items-center justify-between mb-8">
        <SectionHeading icon={Camera} className="mb-0">라이브 방송 및 안내 설정</SectionHeading>
        <Button onClick={onSaveSettings} variant="outline" className="px-6 py-2 h-auto text-xs" icon={Save}>
          이 설정만 저장
        </Button>
      </div>
      
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
          <p className="text-[10px] text-zinc-400 font-bold ml-2">라이브 방송이 없을 때 재생될 기본 영상 주소입니다.</p>
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
  );
};

export default AdminLiveSettings;

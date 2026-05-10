import React, { useState } from 'react';
import { Settings, Video, Info, Save, X, ExternalLink } from 'lucide-react';
import { Card, Button, Input, Textarea } from '../ui/Common';
import { supabase } from '../../lib/supabase';

const AdminLiveControlPanel = ({ 
  config, 
  onClose, 
  showAlert,
  currentShortformVideoUrl,
  setCurrentShortformVideoUrl,
  guideInfo,
  setGuideInfo
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState(currentShortformVideoUrl);
  const [tempGuide, setTempGuide] = useState(guideInfo);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'shortform_video_url', value: tempVideoUrl },
        { key: 'live_guide_info', value: tempGuide }
      ];

      for (const update of updates) {
        await supabase.from('configs').upsert(update, { onConflict: 'key' });
      }

      setCurrentShortformVideoUrl(tempVideoUrl);
      setGuideInfo(tempGuide);
      
      if (showAlert) {
        showAlert('설정 반영 완료 ✨', '방송 설정이 모든 시청자에게 실시간으로 적용되었습니다.', 'success');
      }
    } catch (error) {
      if (showAlert) showAlert('오류', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-fade-in pointer-events-auto">
      <Card className="w-full max-w-lg glass-gradient rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-pink/20 rounded-2xl flex items-center justify-center text-brand-pink">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">방송 실시간 제어</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 glass rounded-full flex items-center justify-center text-gray-900 hover:scale-110 active:scale-95 transition-all"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide">
          {/* 영상 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-pink font-black text-sm">
              <Video size={16} />
              <span>방송 송출 소스 (MP4 URL)</span>
            </div>
            <div className="space-y-3">
              <Input 
                placeholder="https://... 또는 /video.mp4" 
                value={tempVideoUrl}
                onChange={e => setTempVideoUrl(e.target.value)}
              />
              <div className="flex items-center gap-2 px-1">
                <div className={`w-2 h-2 rounded-full ${tempVideoUrl === currentShortformVideoUrl ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-[10px] text-gray-500 font-bold">
                  {tempVideoUrl === currentShortformVideoUrl ? '현재 방송 중인 소스' : '수정됨 (저장 시 반영)'}
                </span>
              </div>
            </div>
          </div>

          {/* 가이드 설정 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-pink font-black text-sm">
              <Info size={16} />
              <span>라이브 이용 가이드 문구</span>
            </div>
            <Textarea 
              rows={5}
              placeholder="시청자들에게 보여줄 안내 문구를 입력하세요..."
              value={tempGuide}
              onChange={e => setTempGuide(e.target.value)}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* 추가 정보 */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
              * 여기서 변경한 내용은 실시간으로 데이터베이스에 저장되며,<br/>
              현재 접속 중인 모든 시청자의 화면에 즉시 반영됩니다.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-white/10 bg-white/5">
          <Button 
            variant="primary" 
            className="w-full h-14 rounded-2xl text-base font-black shadow-xl"
            onClick={handleSave}
            loading={isSaving}
          >
            <Save size={18} className="mr-2" />
            방송 설정 실시간 적용하기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLiveControlPanel;

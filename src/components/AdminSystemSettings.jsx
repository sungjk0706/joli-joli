import React from 'react';
import { HardDrive, BarChart3, Share2, ShieldCheck, Save, Key } from 'lucide-react';
import { Card, SectionHeading, Input, Button } from './ui/Common';
import AdminStats from './AdminStats';
import AdminDB from './AdminDB';

const AdminSystemSettings = ({ 
  telegram, setTelegram, 
  newPassword, setNewPassword, 
  onSaveSettings,
  products, config, showAlert
}) => {
  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* 1. 통계 섹션 */}
      <AdminStats />

      {/* 2. 데이터베이스 관리 */}
      <AdminDB showAlert={showAlert} products={products} config={config} />

      {/* 3. 시스템 연동 (텔레그램) */}
      <Card className="p-10 border-2 border-zinc-200/50">
        <SectionHeading icon={Share2}>시스템 연동 설정</SectionHeading>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="텔레그램 봇 토큰" 
              placeholder="Token" 
              value={telegram.token} 
              onChange={e => setTelegram({ ...telegram, token: e.target.value })} 
              className="font-mono text-xs bg-gray-50" 
            />
            <Input 
              label="텔레그램 채팅 ID" 
              placeholder="Chat ID" 
              value={telegram.chatId} 
              onChange={e => setTelegram({ ...telegram, chatId: e.target.value })} 
              className="font-mono text-xs bg-gray-50" 
            />
          </div>
          <p className="text-[10px] text-zinc-400 font-bold ml-2">
            * 새로운 주문 발생 시 텔레그램으로 실시간 알림을 보내기 위한 설정입니다.
          </p>
        </div>
      </Card>

      {/* 4. 보안 설정 (비밀번호 변경) */}
      <Card className="p-10 border-2 border-zinc-200/50">
        <SectionHeading icon={Key}>보안 설정</SectionHeading>
        <div className="max-w-md space-y-6">
          <Input 
            type="password" 
            label="관리자 새 비밀번호" 
            placeholder="변경할 비밀번호를 입력하세요" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
          />
          <p className="text-[10px] text-zinc-400 font-bold ml-2">
            * 비밀번호를 변경하려면 입력 후 아래 저장 버튼을 누르세요. 공백으로 두면 변경되지 않습니다.
          </p>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex justify-center">
        <Button type="button" onClick={onSaveSettings} variant="primary" className="w-full max-w-md py-6 text-xl shadow-2xl" icon={Save}>
          시스템 설정 저장하기
        </Button>
      </div>
    </div>
  );
};

export default AdminSystemSettings;

import React, { useCallback } from 'react';
import { Settings } from 'lucide-react';
import { Button, Input, Card } from '../ui/Common';

const AdminLoginSection = ({ password, setPassword, onLogin, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <Card className="w-full max-w-sm p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-pink-light rounded-3xl mx-auto flex items-center justify-center text-brand-pink-dark">
          <Settings size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">판매자 로그인</h2>
        <form onSubmit={onLogin} className="space-y-4">
          <Input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required className="text-center" autoFocus />
          <Button type="submit" variant="primary" className="w-full py-4 text-lg">입장하기</Button>
        </form>
        <button type="button" onClick={onBack} className="text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors">고객 페이지로 돌아가기</button>
      </Card>
    </div>
  );
};

export default AdminLoginSection;

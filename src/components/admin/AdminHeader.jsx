import React, { useCallback } from 'react';
import { HelpCircle, ExternalLink, LogOut } from 'lucide-react';
import { Button } from '../ui/Common';

const AdminHeader = React.memo(({ onShowGuide, onBack, onLogout }) => {
  return (
    <header className="bg-white border-b flex-shrink-0 z-30 px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        <h1 className="admin-title text-lg sm:text-xl flex-shrink-0">판매관리</h1>
        
        <button 
          onClick={onShowGuide}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-black shadow-sm active:scale-95 transition-all ml-1"
        >
          <HelpCircle size={14} />
          <span>초보 가이드</span>
        </button>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          variant="ghost" 
          className="px-1 sm:px-3 py-2 text-[10px] sm:text-sm font-black text-gray-600 flex items-center gap-1" 
          onClick={onBack}
        >
          <ExternalLink size={16} />
          <span>내 상점</span>
        </Button>
        <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
        <Button 
          variant="ghost" 
          className="px-1 sm:px-3 py-2 text-[10px] sm:text-sm font-black text-red-500 flex items-center gap-1" 
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </Button>
      </div>
    </header>
  );
});

AdminHeader.displayName = 'AdminHeader';

export default AdminHeader;

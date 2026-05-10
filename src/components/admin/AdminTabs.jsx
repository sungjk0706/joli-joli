import React, { useCallback } from 'react';
import { Package, ShoppingBag, Users, Settings, BarChart3, MessageSquare, Zap, Video, HardDrive } from 'lucide-react';

const AdminTabs = React.memo(({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'stats', label: '데이터\n통계', icon: BarChart3 },
    { id: 'orders', label: '주문\n관리', icon: Package },
    { id: 'products', label: '상품\n관리', icon: ShoppingBag },
    { id: 'live', label: '라방\n제어', icon: Video },
    { id: 'system', label: '시스템\n관리', icon: HardDrive },
    { id: 'shop', label: '상점\n관리', icon: Settings }
  ];

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  return (
    <div className="flex bg-gray-100/80 p-1.5 rounded-3xl gap-1.5 shadow-inner">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`flex-1 py-4 px-1 rounded-2xl text-[13px] sm:text-sm admin-text-base transition-all flex flex-col items-center justify-center gap-2 ${
            activeTab === tab.id 
              ? 'bg-white text-brand-pink-dark shadow-sm scale-[1.02]' 
              : 'admin-label hover:admin-text-secondary'
          }`}
        >
          <tab.icon size={18} className="shrink-0" />
          <span className="leading-tight text-center whitespace-pre-line break-keep">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
});

AdminTabs.displayName = 'AdminTabs';

export default AdminTabs;

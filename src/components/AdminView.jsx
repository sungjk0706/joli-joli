import React from 'react';
import { useAdminLogicV2, useDeviceType } from '../hooks';
import AdminLoginSection from './admin/AdminLoginSection';
const AdminDesktopView = React.lazy(() => import('./admin/desktop/AdminDesktopView'));
const AdminTabletView = React.lazy(() => import('./admin/tablet/AdminTabletView'));
const AdminMobileView = React.lazy(() => import('./admin/mobile/AdminMobileView'));

const AdminView = ({ onBack, onEnterLiveControl, activeTab, setActiveTab }) => {
  const logic = useAdminLogicV2(onBack);
  const { isLoggedIn, handleLogin, password, setPassword } = logic;
  const { isPhone, isTablet } = useDeviceType();

  if (!isLoggedIn) return <AdminLoginSection password={password} setPassword={setPassword} onLogin={handleLogin} onBack={onBack} />;

  const adminProps = { logic, activeTab, setActiveTab, onBack, onEnterLiveControl };

  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center text-brand-pink font-black animate-pulse">JOLI JOLI...</div>}>
      {isPhone && <AdminMobileView {...adminProps} />}
      {isTablet && <AdminTabletView {...adminProps} />}
      {!isPhone && !isTablet && <AdminDesktopView {...adminProps} />}
    </React.Suspense>
  );
};

export default AdminView;

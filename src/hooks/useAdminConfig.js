import { useState, useEffect } from 'react';
import { configService } from '../services';

export const useAdminConfig = (config, configLoading, refetchConfigs, showAlert) => {
  const [shopName, setShopName] = useState('');
  const [shopSubtitle, setShopSubtitle] = useState('');
  const [shopNotice, setShopNotice] = useState('');
  const [instaUrl, setInstaUrl] = useState('');
  const [bankInfo, setBankInfo] = useState({ bank: '', account: '', holder: '' });
  const [portoneConfig, setPortoneConfig] = useState({ merchantId: '', pg: 'kcp' });
  const [telegram, setTelegram] = useState({ token: '', chatId: '' });
  const [isOrderingActive, setIsOrderingActive] = useState(true);
  const [shortformVideoUrl, setShortformVideoUrl] = useState('');
  const [liveGuideInfo, setLiveGuideInfo] = useState('');
  const [businessInfo, setBusinessInfo] = useState({
    ceo: '',
    businessNumber: '',
    mailOrderNumber: '',
    address: '',
    phone: '',
    email: '',
    privacyOfficer: ''
  });

  useEffect(() => {
    if (!configLoading && config) {
      setShopName(config.shopName || '');
      setShopSubtitle(config.shopSubtitle || '');
      setShopNotice(config.shopNotice || '');
      setInstaUrl(config.instaUrl || '');
      setBankInfo(config.bankInfo || { bank: '', account: '', holder: '' });
      setPortoneConfig(config.portoneConfig || { merchantId: '', pg: 'kcp' });
      setTelegram(config.telegramConfig || { token: '', chatId: '' });
      setShortformVideoUrl(config.shortformVideoUrl || '/인스타.mp4');
      setLiveGuideInfo(config.liveGuideInfo || '졸리졸리 라이브에 오신 것을 환영합니다! ✨\n하단을 눌러 상품을 확인하고 하트로 응원해주세요!');
      setBusinessInfo(config.businessInfo || {
        ceo: '',
        businessNumber: '',
        mailOrderNumber: '',
        address: '',
        phone: '',
        email: '',
        privacyOfficer: ''
      });
      setIsOrderingActive(config.isOrderingActive !== false);
    }
  }, [config, configLoading]);

  const handleToggleOrdering = async () => {
    const newState = !isOrderingActive;
    setIsOrderingActive(newState);
    try {
      await configService.upsert('is_ordering_active', newState.toString());
      await refetchConfigs();
      window.dispatchEvent(new Event('configUpdated'));
      showAlert(newState ? '주문 시작' : '주문 마감', newState ? '지금부터 주문을 받을 수 있습니다.' : '주문 접수가 중단되었습니다.', newState ? 'success' : 'info');
    } catch (error) {
      setIsOrderingActive(!newState);
      showAlert('설정 변경 실패', error.message, 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      await configService.upsertMultiple([
        { key: 'shop_name', value: shopName },
        { key: 'shop_subtitle', value: shopSubtitle },
        { key: 'shop_notice', value: shopNotice },
        { key: 'insta_url', value: instaUrl },
        { key: 'bank_info', value: JSON.stringify(bankInfo) },
        { key: 'portone_config', value: JSON.stringify(portoneConfig) },
        { key: 'telegram_config', value: JSON.stringify(telegram) },
        { key: 'shortform_video_url', value: shortformVideoUrl },
        { key: 'live_guide_info', value: liveGuideInfo },
        { key: 'business_info', value: JSON.stringify(businessInfo) },
      ]);
      await refetchConfigs();
      window.dispatchEvent(new Event('configUpdated'));
      showAlert('저장 완료', '상점 설정이 저장되었습니다.', 'success');
    } catch (error) {
      showAlert('저장 실패', error.message, 'error');
    }
  };

  return {
    shopName, setShopName,
    shopSubtitle, setShopSubtitle,
    shopNotice, setShopNotice,
    instaUrl, setInstaUrl,
    bankInfo, setBankInfo,
    portoneConfig, setPortoneConfig,
    telegram, setTelegram,
    isOrderingActive, setIsOrderingActive,
    shortformVideoUrl, setShortformVideoUrl,
    liveGuideInfo, setLiveGuideInfo,
    businessInfo, setBusinessInfo,
    handleToggleOrdering,
    handleSaveSettings
  };
};

import { useState, useEffect, useRef } from 'react';

export const useAdminNotification = (orders, isLoggedIn) => {
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const adminSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const prevOrdersCount = useRef(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0]; 
      setNewOrderNotification(newOrder);

      // 소리 알림
      if (adminSound.current) {
        adminSound.current.currentTime = 0;
        adminSound.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // 5초 후 알림 자동 닫기
      setTimeout(() => {
        setNewOrderNotification(null);
      }, 5000);
    }

    prevOrdersCount.current = orders.length;
  }, [orders, isLoggedIn]);

  const closeNotification = () => setNewOrderNotification(null);

  return { newOrderNotification, closeNotification };
};

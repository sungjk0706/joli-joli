import { useState, useCallback } from 'react';

/**
 * 전역적으로 사용할 수 있는 알림창 제어 훅
 * 확인/취소가 포함된 고급 다이얼로그 기능을 지원합니다.
 */
export const useAlert = () => {
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success',
    showCancel: false,
    onConfirm: null
  });

  const showAlert = useCallback((title, message, type = 'success', showCancel = false, onConfirm = null) => {
    setAlert({ 
      show: true, 
      title, 
      message, 
      type, 
      showCancel, 
      onConfirm 
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, show: false }));
  }, []);

  // 확인창 전용 단축 메소드
  const showConfirm = useCallback((title, message, onConfirm, type = 'info') => {
    showAlert(title, message, type, true, onConfirm);
  }, [showAlert]);

  return { alert, showAlert, hideAlert, showConfirm };
};

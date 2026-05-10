import { useState, useEffect } from 'react';

/**
 * useDeviceType
 *
 * 접속 기기를 자동 감지하여 phone / tablet / desktop 타입과
 * 부가 플래그(orientation, isTouchDevice, hasHover)를 반환합니다.
 *
 * 감지 기준:
 *  - phone   : width < 768px  OR  (768 ≤ width < 1024 AND pointer:coarse)
 *  - tablet  : 768 ≤ width < 1024 AND pointer:fine  (또는 landscape 모드)
 *  - desktop : width ≥ 1024px
 *
 * window.matchMedia 기반으로 SSR-safe하게 동작합니다.
 */

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      orientation: 'landscape',
      isTouchDevice: false,
      hasHover: true,
      width: 1280,
      height: 800,
    };
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isHoverNone = window.matchMedia('(hover: none)').matches;
  const orientation = w >= h ? 'landscape' : 'portrait';
  const isTouchDevice = isCoarsePointer || isHoverNone || 'ontouchstart' in window;
  const hasHover = !isHoverNone;

  let type;
  if (w < BREAKPOINTS.tablet) {
    type = 'phone';
  } else if (w < BREAKPOINTS.desktop) {
    // 태블릿 영역: pointer:coarse이면 phone 취급 (소형 안드로이드 등)
    type = isCoarsePointer ? 'phone' : 'tablet';
  } else {
    type = 'desktop';
  }

  return { type, orientation, isTouchDevice, hasHover, width: w, height: h };
}

export function useDeviceType() {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo);

  useEffect(() => {
    const update = () => setDeviceInfo(getDeviceInfo());

    // resize — 화면 크기 변경 (브라우저 리사이즈, 폴더블 펼침 등)
    window.addEventListener('resize', update);
    // orientationchange — 모바일 가로/세로 전환
    window.addEventListener('orientationchange', update);

    // matchMedia change — 포인터 타입 변경 (마우스 연결 등)
    const coarseQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: none)');
    coarseQuery.addEventListener('change', update);
    hoverQuery.addEventListener('change', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      coarseQuery.removeEventListener('change', update);
      hoverQuery.removeEventListener('change', update);
    };
  }, []);

  return {
    /** 'phone' | 'tablet' | 'desktop' */
    deviceType: deviceInfo.type,
    /** 'portrait' | 'landscape' */
    orientation: deviceInfo.orientation,
    /** 터치 입력이 주 입력 수단인지 여부 */
    isTouchDevice: deviceInfo.isTouchDevice,
    /** 마우스 hover가 지원되는 기기인지 여부 */
    hasHover: deviceInfo.hasHover,
    /** 현재 뷰포트 너비 */
    viewportWidth: deviceInfo.width,
    /** 현재 뷰포트 높이 */
    viewportHeight: deviceInfo.height,
    /** 편의 플래그 */
    isPhone: deviceInfo.type === 'phone',
    isTablet: deviceInfo.type === 'tablet',
    isDesktop: deviceInfo.type === 'desktop',
    isMobileSize: deviceInfo.type === 'phone' || deviceInfo.type === 'tablet',
  };
}

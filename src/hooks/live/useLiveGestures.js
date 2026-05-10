import { useState, useRef } from 'react';

export const useLiveGestures = ({
  isMiniMode,
  onMiniModeChange,
  miniPos,
  setMiniPos,
  viewportSize,
  onSwipeUp,
}) => {
  const [touchDeltaY, setTouchDeltaY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const initialMiniPos = useRef({ x: 0, y: 0 });
  const directionLocked = useRef(null); // 'vertical' | 'horizontal' | null

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    directionLocked.current = null;
    
    if (isMiniMode) {
      initialMiniPos.current = { ...miniPos };
    }
    
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const deltaY = e.touches[0].clientY - touchStartY.current;
    const deltaX = e.touches[0].clientX - touchStartX.current;

    if (isMiniMode) {
      // 미니 플레이어 자유 이동
      setMiniPos({
        x: initialMiniPos.current.x - deltaX, 
        y: initialMiniPos.current.y - deltaY  
      });
    } else {
      // 방향 잠금 (10px 이상 이동 시 결정)
      if (!directionLocked.current) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          directionLocked.current = Math.abs(deltaY) >= Math.abs(deltaX) ? 'vertical' : 'horizontal';
        }
      }
      // 수직 방향일 때만 드래그 처리
      if (directionLocked.current === 'vertical') {
        if (deltaY > 0) setTouchDeltaY(deltaY);
        else setTouchDeltaY(0);
      }
    }
  };

  const handleTouchEnd = (e) => {
    setIsSwiping(false);
    
    if (!isMiniMode) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const isVertical = directionLocked.current === 'vertical' ||
        (Math.abs(deltaY) > Math.abs(deltaX) * 1.5);

      if (isVertical) {
        if (touchDeltaY > 100) {
          // 아래로 100px+ → 미니모드
          onMiniModeChange(true);
        } else if (deltaY < -80 && onSwipeUp) {
          // 위로 80px+ → 상품목록 열기
          onSwipeUp();
        }
      }
      setTouchDeltaY(0);
    }
    directionLocked.current = null;
  };

  return {
    touchDeltaY,
    isSwiping,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

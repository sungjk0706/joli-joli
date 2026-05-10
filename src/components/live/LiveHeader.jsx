import React, { useState } from 'react';
import { GlassIconButton, StatusBadge } from '../ui/Common';
import { ChevronDown, MoreVertical, Volume2, VolumeX, Minimize2, Minimize, Maximize, X, Share2, Info, Heart } from 'lucide-react';

const LiveHeader = ({ 
  activeProduct, 
  isMuted, 
  setIsMuted, 
  onMiniModeChange, 
  onBack,
  showAlert,
  viewMode,
  likeCount = 0,
  viewerCount = 1291,
  onProductListOpen,
  onLike,
  onReaction
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!(document.fullscreenElement || document.webkitFullscreenElement));

  // 메뉴 외부 클릭 시 닫기
  React.useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = () => setShowMenu(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // 전체 화면 상태 변화 감지
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const docElm = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docElm.requestFullscreen) docElm.requestFullscreen().catch(() => {});
      else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  };

  const handleShare = async () => {
    setShowMenu(false);
    const shareUrl = window.location.href;
    const shareTitle = '졸리졸리 라이브 쇼핑 💖';
    const shareText = `[joli.joli] ${activeProduct?.name || '라이브 특가 진행 중!'} ✨\n지금 바로 접속해서 혜택을 확인하세요!`;

    // 복사 성공 여부 플래그
    let isCopied = false;

    // 1. 최신 방식 시도 (HTTPS 전용)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        isCopied = true;
      } catch (err) {
        console.error('Modern copy failed:', err);
      }
    }

    // 2. 구형 방식 시도 (HTTP 환경용 Fallback)
    if (!isCopied) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) isCopied = true;
      } catch (err) {
        console.error('Legacy copy failed:', err);
      }
    }

    // 결과 알림
    if (isCopied) {
      if (showAlert) {
        showAlert('복사 완료! 🔗', '공유 링크가 클립보드에 복사되었습니다. 원하시는 곳에 붙여넣어주세요!', 'success');
      }
    } else {
      // 최악의 경우 주소라도 띄워줌
      if (showAlert) {
        showAlert('주소 확인 🔗', `복사 기능이 지원되지 않는 환경입니다.\n아래 주소를 길게 눌러 복사해주세요:\n${shareUrl}`, 'info');
      }
    }

    // 3. 모바일/지원 브라우저라면 시스템 공유창 추가 시도
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Native share failed:', err);
      }
    }
  };

  const handleShowInfo = () => {
    setShowMenu(false);
    if (showAlert) {
      showAlert(
        '방송 정보 📺', 
        `제목: ${activeProduct?.name || '졸리졸리 라이브'}\n호스트: joli.joli\n시청자: ${Number(viewerCount).toLocaleString()}명\n\n졸리졸리만의 감성적인 프리미엄 아동복 컬렉션 실시간 방송입니다.`,
        'info'
      );
    }
  };

  return (
    <div className={`absolute left-0 right-0 z-[70] flex flex-col px-3 sm:px-4 transition-all duration-500 pointer-events-auto ${viewMode === 'landscape-full' ? 'top-4' : 'top-5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-1.5">
            <StatusBadge variant="red">
              <span className="uppercase">LIVE</span>
            </StatusBadge>
            <StatusBadge variant="dark" className="cursor-pointer active:scale-95 transition-all hover:bg-zinc-800" onClick={handleShowInfo}>
              <span>{Number(viewerCount).toLocaleString()} 시청</span>
            </StatusBadge>
            <StatusBadge 
              variant="dark" 
              className="cursor-pointer active:scale-95 transition-all hover:bg-zinc-800 group"
              onClick={onLike}
            >
              <Heart size={10} className="fill-white animate-pulse group-hover:text-brand-pink transition-colors" />
              <span>{Number(likeCount).toLocaleString()}</span>
            </StatusBadge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button 
              onClick={() => onReaction?.('custom', activeProduct?.liveEmoji || '✨')}
              className="hover:scale-125 active:scale-90 transition-all duration-300 filter drop-shadow-md text-lg"
            >
              {activeProduct?.liveEmoji || '✨'}
            </button>
            <h2 className="text-white text-[15px] sm:text-[17px] md:text-[19px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tight">
              {activeProduct?.name || '졸리졸리 라이브 컬렉션'}
            </h2>
            <button 
              onClick={() => onReaction?.('custom', activeProduct?.liveEmoji || '💥')}
              className="hover:scale-125 active:scale-90 transition-all duration-300 filter drop-shadow-md text-lg"
            >
              {activeProduct?.liveEmoji || '💥'}
            </button>

            {activeProduct?.liveTag && (
              <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-brand-pink to-brand-pink-dark text-brand-pink-contrast text-[10px] font-black rounded-md shadow-lg animate-bounce-subtle">
                {activeProduct.liveTag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] sm:text-[11px] font-bold mt-0.5">
            <span>{activeProduct?.category || 'Kids'}</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>{activeProduct?.price ? `${Number(activeProduct.price).toLocaleString()}원` : '특가 진행 중'}</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>{activeProduct?.is_out_of_stock ? '품절 임박' : '재고 여유'}</span>
          </div>
          <button 
            onClick={onProductListOpen}
            className="mt-2 w-fit bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-[11px] sm:text-[12px] font-bold hover:bg-white/20 transition-all shadow-xl group"
          >
            <div className="w-4 h-4 bg-brand-pink rounded-full flex items-center justify-center text-[10px] sm:text-[11px] group-hover:scale-110 transition-all">%</div>
            혜택 보기
            <ChevronDown size={14} sm:size={16} className="opacity-60" />
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-2.5 pt-1">
          {/* 1. Close Button */}
          <GlassIconButton onClick={onBack} title="닫기">
            <X size={20} sm:size={24} />
          </GlassIconButton>

          {/* 2. Full Screen Toggle */}
          <GlassIconButton onClick={toggleFullscreen} title={isFullscreen ? "축소하기" : "전체화면"}>
            {isFullscreen ? <Minimize size={20} sm:size={22} /> : <Maximize size={20} sm:size={22} />}
          </GlassIconButton>

          {/* 3. Mini Mode Toggle */}
          <GlassIconButton onClick={() => onMiniModeChange(true)} title="미니 플레이어">
            <Minimize2 size={18} sm:size={20} />
          </GlassIconButton>

          {/* 4. Mute Toggle */}
          <GlassIconButton onClick={() => setIsMuted(!isMuted)} title={isMuted ? "소리 켜기" : "소리 끄기"}>
            {isMuted ? <VolumeX size={20} sm:size={22} /> : <Volume2 size={20} sm:size={22} />}
          </GlassIconButton>

          {/* 5. More Menu */}
          <div className="relative">
            <GlassIconButton 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="더보기"
            >
              <MoreVertical size={20} sm:size={22} />
            </GlassIconButton>

            {/* More Options Popover */}
            {showMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-full top-0 mr-3 w-36 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in z-[9999]"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-white text-[13px] font-bold hover:bg-white/10 active:bg-white/20 transition-all"
                >
                  <Share2 size={16} className="text-brand-pink" />
                  공유하기
                </button>
                <div className="h-px bg-white/5 mx-2" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShowInfo(); }}
                  className="w-full px-4 py-3.5 flex items-center gap-3 text-white text-[13px] font-bold hover:bg-white/10 active:bg-white/20 transition-all"
                >
                  <Info size={16} className="text-blue-400" />
                  방송 정보
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveHeader;

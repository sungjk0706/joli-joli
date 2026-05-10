import React, { useState } from 'react';
import { ChevronDown, MoreVertical, Volume2, VolumeX, Minimize2, Minimize, Maximize, X, Share2, Info } from 'lucide-react';

const LiveHeader = ({ 
  activeProduct, 
  isMuted, 
  setIsMuted, 
  onMiniModeChange, 
  onBack,
  showAlert,
  viewMode 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!(document.fullscreenElement || document.webkitFullscreenElement));

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
        `제목: ${activeProduct?.name || '졸리졸리 라이브'}\n호스트: joli.joli\n시청자: 1,291명\n\n졸리졸리만의 감성적인 프리미엄 아동복 컬렉션 실시간 방송입니다.`,
        'info'
      );
    }
  };

  return (
    <div className={`absolute left-0 right-0 z-[70] flex flex-col px-3 sm:px-4 transition-all duration-500 pointer-events-auto ${viewMode === 'landscape-full' ? 'top-4' : 'top-5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-1">
            <div className="bg-red-600 px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow-md">
              <span className="text-white text-[9px] sm:text-[10px] font-black uppercase">LIVE</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-sm flex items-center border border-white/10">
              <span className="text-white text-[11px] sm:text-[12px] font-bold opacity-90">1,291 시청</span>
            </div>
          </div>
          <h2 className="text-white text-[15px] sm:text-[17px] md:text-[19px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1.5 tracking-tight mt-0.5">
            ✨ {activeProduct?.name || '졸리졸리 라이브 컬렉션'} 💥
          </h2>
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] sm:text-[11px] font-bold mt-0.5">
            <span>100cm</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>SIZE 100</span>
            <span className="w-[1px] h-2.5 bg-white/30" />
            <span>모델 착용</span>
          </div>
          <button className="mt-2 w-fit bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-[11px] sm:text-[12px] font-bold hover:bg-white/20 transition-all shadow-xl group">
            <div className="w-4 h-4 bg-brand-pink rounded-full flex items-center justify-center text-[10px] sm:text-[11px] group-hover:scale-110 transition-all">%</div>
            혜택 보기
            <ChevronDown size={14} sm:size={16} className="opacity-60" />
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-3 pt-1">
          {/* Top Right Close Button */}
          <button onClick={onBack} className="w-10 h-10 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-xl">
            <X size={20} sm:size={24} />
          </button>

          {/* Full Screen Toggle (Clean Icon) */}
          <button onClick={toggleFullscreen} className="w-10 h-10 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-xl" title={isFullscreen ? "축소하기" : "전체화면"}>
            {isFullscreen ? <Minimize size={20} sm:size={22} /> : <Maximize size={20} sm:size={22} />}
          </button>

          {/* Mini Mode Toggle (Clean Icon) */}
          <button onClick={() => onMiniModeChange(true)} className="w-9 h-9 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center text-white/80 hover:bg-black/40 transition-all shadow-lg" title="미니 플레이어">
            <Minimize2 size={18} sm:size={20} />
          </button>

          <div className="flex flex-col gap-2 mt-2 relative">
            <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/90 hover:bg-white/10 rounded-full transition-all">
              {isMuted ? <VolumeX size={20} sm:size={22} /> : <Volume2 size={20} sm:size={22} />}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Dots clicked, current showMenu:', showMenu);
                setShowMenu(!showMenu);
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/90 hover:bg-white/10 rounded-full transition-all ${showMenu ? 'bg-white/20' : ''}`}
            >
              <MoreVertical size={20} sm:size={22} />
            </button>

            {/* More Options Popover */}
            {showMenu && (
              <div className="absolute right-full top-0 mr-3 w-36 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in z-[9999]">
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

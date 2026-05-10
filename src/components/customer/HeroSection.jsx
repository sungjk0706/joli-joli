import React from 'react';
import { ShoppingBag, Camera, Instagram, History } from 'lucide-react';
import { Button } from '../ui/Common';

const HeroSection = React.memo(({ instaUrl, onEnterLive, onShowHistory, onShowCart, cartCount }) => {
  return (
    <div className="p-4 sm:p-8 mb-4 text-center animate-fade-in relative bg-transparent overflow-visible">
      <div className="relative z-10 pt-16 sm:pt-32 pb-4 flex flex-col items-center overflow-visible">
        <div className="relative flex items-center justify-center pointer-events-none pb-6 sm:pb-10 overflow-visible">
          {/* Ripple Effects */}
          <div className="absolute w-40 h-40 bg-brand-pink-dark/30 rounded-full animate-ripple will-change-transform" style={{ animationDelay: '0s' }}></div>
          <div className="absolute w-40 h-40 bg-brand-pink-dark/20 rounded-full animate-ripple will-change-transform" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-40 h-40 bg-brand-pink-dark/10 rounded-full animate-ripple will-change-transform" style={{ animationDelay: '2s' }}></div>
          
          <img 
            src="/joli-joli-Logo.png" 
            alt="Joli-Joli Logo" 
            className="relative z-10 w-48 sm:w-64 md:w-80 h-auto animate-logo-rocking will-change-transform select-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 [touch-action:manipulation]">
          <Button 
            variant="primary" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base shadow-xl shadow-brand-pink/20 animate-pulse" 
            onClick={onEnterLive} 
            icon={Camera}
          >
            LIVE 쇼핑하기
          </Button>

          <Button 
            variant="dark" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base shadow-lg" 
            onClick={() => window.location.href = instaUrl}
            icon={Instagram}
          >
            인스타 구경가기
          </Button>

          <Button 
            variant="secondary" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base relative shadow-lg" 
            onClick={onShowCart}
            icon={ShoppingBag}
          >
            장바구니
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-brand-blue-dark text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-brand-blue animate-bounce">
                {cartCount}
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base shadow-sm" 
            onClick={onShowHistory}
            icon={History}
          >
            주문 내역
          </Button>
        </div>

        {/* 브랜드 라벨 (주문 내역 하단으로 이동) */}
        <div className="mt-4 flex flex-col items-center gap-1 opacity-60">
          <div className="w-8 h-px bg-brand-pink mx-auto mb-1 opacity-30"></div>
          <p className="text-[10px] font-bold text-brand-pink-dark tracking-widest uppercase">joli.joli Live Collection</p>
          <p className="text-[9px] text-gray-400">© 2026 Style Live. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;


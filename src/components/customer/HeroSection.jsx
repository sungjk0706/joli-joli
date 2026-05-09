import React from 'react';
import { ShoppingBag, Camera, Instagram, History } from 'lucide-react';
import { Button } from '../ui/Common';

const HeroSection = React.memo(({ instaUrl, onEnterLive, onShowHistory, onShowCart, cartCount }) => {
  return (
    <div className="p-6 sm:p-10 mb-10 text-center animate-fade-in relative bg-transparent">
      <div className="relative z-10 pt-20 sm:pt-32 pb-10 flex flex-col items-center">
        <div className="mb-12 sm:mb-20 relative flex items-center justify-center">
          {/* Ripple Effects */}
          <div className="absolute w-40 h-40 bg-brand-pink-dark/30 rounded-full animate-ripple pointer-events-none" style={{ animationDelay: '0s' }}></div>
          <div className="absolute w-40 h-40 bg-brand-pink-dark/20 rounded-full animate-ripple pointer-events-none" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-40 h-40 bg-brand-pink-dark/10 rounded-full animate-ripple pointer-events-none" style={{ animationDelay: '2s' }}></div>
          
          <img 
            src="/joli-joli-Logo.png" 
            alt="Joli-Joli Logo" 
            className="relative z-10 w-48 sm:w-64 md:w-80 h-auto drop-shadow-[0_10px_30px_rgba(255,142,142,0.2)]"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
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
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base" 
            onClick={() => window.open(instaUrl, '_blank')}
            icon={Instagram}
          >
            인스타 구경가기
          </Button>
          <Button 
            variant="secondary" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base relative" 
            onClick={onShowCart}
            icon={ShoppingBag}
          >
            장바구니
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-pink text-brand-pink-contrast text-xs w-6 h-6 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="px-8 py-4 sm:px-10 sm:py-5 text-sm sm:text-base" 
            onClick={onShowHistory}
            icon={History}
          >
            주문 내역
          </Button>
        </div>
      </div>
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;


import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = ({ config }) => {
  const business = config?.businessInfo || {};
  
  if (!business.businessNumber && !business.ceo) return null;

  return (
    <footer className="mt-20 pb-20 px-6 sm:px-10 border-t border-black/5">
      <div className="max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <img src="/joli-joli-Logo.png" alt="Logo" className="h-8 w-auto opacity-40 grayscale" />
            <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-sm">
              {config?.shopSubtitle || '프리미엄 아동복 라이브 커머스'}
              <br />
              졸리졸리만의 감성적인 셀렉션으로 아이들의 일상을 특별하게 채워드립니다.
            </p>
          </div>

          {/* Business Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[10px] sm:text-[11px] font-medium text-gray-400">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                <ShieldCheck size={12} />
                <span>사업자 정보</span>
              </div>
              <p>상호명: {config?.shopName || '졸리졸리'}</p>
              <p>대표자: {business.ceo || '-'}</p>
              <p>사업자등록번호: {business.businessNumber || '-'}</p>
              <p>통신판매업신고: {business.mailOrderNumber || '-'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                <Phone size={12} />
                <span>고객센터 및 개인정보</span>
              </div>
              <p className="flex items-center gap-1"><Phone size={10} /> {business.phone || '-'}</p>
              <p className="flex items-center gap-1"><Mail size={10} /> {business.email || '-'}</p>
              <p>개인정보보호책임자: {business.privacyOfficer || '-'}</p>
              <p className="flex items-start gap-1"><MapPin size={10} className="mt-0.5" /> {business.address || '-'}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
          <p>© 2026 {config?.shopName || 'Joli-Joli'}. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="hover:text-gray-500 transition-colors">이용약관</button>
            <button className="hover:text-gray-500 transition-colors">개인정보처리방침</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

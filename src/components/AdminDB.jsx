import React from 'react';
import { Database, HardDrive, Search } from 'lucide-react';
import { Card, SectionHeading } from './ui/Common';
import AdminStorage from './AdminStorage';
import AdminCartManagement from './AdminCartManagement';

const AdminDB = ({ showAlert, products, config }) => {
  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* DB Management Header */}
      <div className="flex flex-col">
        <h2 className="text-2xl sm:text-3xl admin-title flex items-center gap-3">
          <Database size={28} className="text-zinc-800" />
          DB 및 스토리지 관리
        </h2>
        <p className="admin-text-secondary text-sm mt-1">
          애플리케이션의 데이터베이스 및 스토리지 리소스를 중앙에서 관리합니다.
        </p>
      </div>

      {/* Storage Management Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-6 bg-brand-pink rounded-full" />
          <h3 className="text-xl font-black text-zinc-800">영상 및 미디어 데이터</h3>
        </div>
        
        <Card className="p-8 border-2 border-brand-pink-light/10">
          <AdminStorage showAlert={showAlert} products={products} config={config} />
        </Card>
      </div>

      {/* Cart Management Section */}
      <div className="space-y-6 pt-10 border-t border-zinc-100">
        <AdminCartManagement showAlert={showAlert} />
      </div>

      {/* Future Sections Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-30 pt-10 border-t border-zinc-100">
        <Card className="p-8 border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center text-center space-y-3">
          <Search size={40} className="text-zinc-300" />
          <div>
            <h4 className="font-bold text-zinc-500">DB 쿼리 분석기</h4>
            <p className="text-xs text-zinc-400">준비 중인 기능입니다.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDB;

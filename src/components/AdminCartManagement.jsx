import React, { useState, useEffect } from 'react';
import { cartService, productService } from '../services';
import { ShoppingCart, Trash2, User, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, Button } from './ui/Common';

const AdminCartManagement = ({ showAlert }) => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalItems: 0, totalUsers: 0 });

  const loadAllCarts = async () => {
    setLoading(true);
    try {
      // Note: cartService currently only has getCart(phone). 
      // For Admin, we'll need a way to get ALL carts.
      // I'll assume we can query supabase directly here for admin purposes.
      const { data, error } = await window.supabase
        .from('cart')
        .select('*, products(*)');
      
      if (error) throw error;
      
      setCarts(data || []);
      
      // 통계 계산
      const uniqueUsers = new Set(data.map(item => item.customer_phone)).size;
      setSummary({
        totalItems: data.length,
        totalUsers: uniqueUsers
      });
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
      // showAlert('오류', '장바구니 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCarts();
  }, []);

  const handleClearOldCarts = async () => {
    if (!window.confirm('30일 이상 된 오래된 장바구니 데이터를 모두 삭제하시겠습니까?')) return;
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { error } = await window.supabase
        .from('cart')
        .delete()
        .lt('updated_at', thirtyDaysAgo.toISOString());
        
      if (error) throw error;
      
      showAlert('정리 완료', '오래된 장바구니 데이터가 삭제되었습니다.', 'success');
      loadAllCarts();
    } catch (error) {
      showAlert('정리 실패', error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">장바구니 데이터 현황</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cart Database Status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAllCarts}
            className="p-2 text-zinc-400 hover:text-zinc-600 transition-all"
            title="새로고침"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[11px] font-bold h-9"
            onClick={handleClearOldCarts}
            icon={Trash2}
          >
            오래된 데이터 정리
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-orange-400 uppercase">Total Items</p>
            <p className="text-2xl font-black text-zinc-800">{summary.totalItems}개</p>
          </div>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase">Active Users</p>
            <p className="text-2xl font-black text-zinc-800">{summary.totalUsers}명</p>
          </div>
        </div>
      </div>

      {/* Recent Cart Activity */}
      <Card className="overflow-hidden border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">사용자 (전화번호)</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">상품 정보</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase text-center">수량</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase">마지막 업데이트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-300 italic animate-pulse">데이터 분석 중...</td>
                </tr>
              ) : carts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-300 italic">현재 담긴 장바구니 데이터가 없습니다.</td>
                </tr>
              ) : (
                carts.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="font-mono text-xs font-bold text-zinc-600">{item.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                          {item.products?.image_url && <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-zinc-800 truncate">{item.products?.name || '삭제된 상품'}</p>
                          <p className="text-[10px] text-zinc-400">{item.selected_option || '옵션없음'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-zinc-100 rounded-md text-[10px] font-black text-zinc-600">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-zinc-400">
                      {new Date(item.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {carts.length > 10 && (
          <div className="p-4 bg-zinc-50/50 text-center border-t border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400">최근 10건의 내역만 표시됩니다. (전체 {carts.length}건)</p>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        <AlertCircle size={16} className="text-blue-400" />
        <p className="text-[10px] font-bold text-blue-500/80 leading-relaxed">
          장바구니 데이터는 실시간 마케팅 인사이트로 활용할 수 있습니다. <br />
          사용자가 오래 방치한 데이터는 '오래된 데이터 정리' 버튼으로 주기적으로 청소해 주는 것이 DB 성능에 좋습니다.
        </p>
      </div>
    </div>
  );
};

export default AdminCartManagement;

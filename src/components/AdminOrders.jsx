import React, { useState } from 'react';
import { Package, TrendingUp, AlertCircle, CheckCircle, Radio, ExternalLink, Truck } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button, Card, Badge, SectionHeading, Input } from './ui/Common';
import { OrderCardSkeleton } from './ui/Skeleton';
import { orderService } from '../services/orderService';

import AdminCartManagement from './AdminCartManagement';

const AdminOrders = React.memo(({ orders = [], loading = false, onUpdateStatus, onDeleteOrder, isOrderingActive, onToggleOrdering, onEnterLiveControl, onUpdateTracking, showAlert }) => {
  const [trackingData, setTrackingData] = useState({});
  const [showTrackingInput, setShowTrackingInput] = useState({});
  const [filterStatus, setFilterStatus] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBulkTracking, setShowBulkTracking] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  const carriers = ['cj대한통운', '우체국', '롯데택배', '한진택배', '경동택배', '로젠택배', 'EMS'];

  const handleTrackingSave = async (orderId) => {
    const data = trackingData[orderId];
    if (data && data.trackingNumber && data.carrier) {
      await onUpdateTracking(orderId, data.trackingNumber, data.carrier);
      setShowTrackingInput(prev => ({ ...prev, [orderId]: false }));
    }
  };
  // 통계 계산
  const totalCount = orders.length;
  const unpaidCount = orders.filter(o => o.status === '미입금').length;
  const completedCount = orders.filter(o => o.status === '입금완료' || o.status === '배송중').length;

  const handleSyncBank = async () => {
    const unpaidOrders = orders.filter(o => o.status === '미입금' && (o.payment_method === 'bank_transfer' || !o.payment_method));
    if (unpaidOrders.length === 0) {
      showAlert('동기화 완료', '현재 입금 대기 중인 주문이 없습니다.', 'info');
      return;
    }

    // 시뮬레이션: 입금자명이 존재하면 입금 확인 처리
    let syncedCount = 0;
    for (const order of unpaidOrders) {
      if (order.deposit_name || order.customer_name) {
        await onUpdateStatus(order.id, '입금완료');
        syncedCount++;
      }
    }
    
    if (syncedCount > 0) {
      showAlert('입금 자동 확인 ✨', `${syncedCount}건의 주문이 입금 확인되었습니다.`, 'success');
    } else {
      showAlert('동기화 완료', '새로 확인된 입금 내역이 없습니다.', 'info');
    }
  };
  
  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    
    const headers = ['주문번호', '주문일시', '고객명', '연락처', '상품명', '수량', '옵션', '금액', '상태', '주소', '요청사항'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => [
        o.id,
        new Date(o.created_at).toLocaleString(),
        o.customer_name,
        o.customer_phone,
        o.products?.name || '상품',
        o.quantity,
        o.selected_option || '',
        o.price * o.quantity,
        o.status,
        `"${o.address} ${o.detail_address}"`,
        `"${o.requests || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === '전체' || o.status === filterStatus;
    const matchesSearch = !searchQuery || 
      o.customer_name?.includes(searchQuery) || 
      o.id.toString().includes(searchQuery) ||
      (o.products?.name || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleBulkSave = async () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    if (lines.length === 0) return showAlert('입력 부족', '송장 정보를 입력해주세요.', 'info');
    
    let successCount = 0;
    for (const line of lines) {
      // Format: order_id, carrier, tracking_number
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 3) {
        const [orderId, carrier, trackingNumber] = parts;
        try {
          await onUpdateTracking(orderId, trackingNumber, carrier);
          successCount++;
        } catch (e) {
          console.error(`Bulk update error for ID ${orderId}:`, e);
        }
      }
    }
    showAlert('일괄 저장 완료', `${successCount}건의 송장 정보가 처리되었습니다.`, 'success');
    setShowBulkTracking(false);
    setBulkInput('');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* 1. 대형 라방 제어 센터 진입 카드 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card 
          onClick={() => {
            const docElm = document.documentElement;
            if (docElm.requestFullscreen) docElm.requestFullscreen();
            else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
            onEnterLiveControl();
          }}
          className="flex-1 h-16 sm:h-20 px-4 sm:px-8 border-0 shadow-2xl bg-[#FFD600] hover:bg-[#FFC400] text-black cursor-pointer active:scale-95 transition-all group overflow-hidden relative flex items-center"
        >
          <div className="flex items-center justify-center w-full relative z-10">
            <h2 className="text-xl sm:text-2xl admin-title tracking-tighter text-center">
              라방 화면 제어 센터 🎥
            </h2>
          </div>
        </Card>

        <Card 
          onClick={handleSyncBank}
          className="h-16 sm:h-20 px-6 sm:px-10 border-0 shadow-2xl bg-brand-blue-dark hover:bg-black text-white cursor-pointer active:scale-95 transition-all flex items-center gap-3 group"
        >
          <CheckCircle className="text-brand-blue-light animate-pulse" size={24} />
          <span className="text-lg font-black whitespace-nowrap">입금 내역 동기화</span>
        </Card>
      </div>

      {/* 2. 라방 요약 대시보드 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-4 sm:p-10 bg-gray-900 text-white border-0 shadow-xl overflow-hidden">
          <div className="flex justify-center mb-1 sm:mb-4 opacity-70">
            <span className="text-[12px] sm:text-lg font-black uppercase tracking-[0.3em]">총 주문</span>
          </div>
          <div className="text-3xl sm:text-7xl font-black admin-number leading-none">{totalCount}<span className="text-xs sm:text-3xl ml-1.5">건</span></div>
        </Card>
        <Card className="p-4 sm:p-10 bg-brand-pink text-brand-pink-contrast border-0 shadow-xl overflow-hidden">
          <div className="flex justify-center mb-1 sm:mb-4 opacity-90">
            <span className="text-[12px] sm:text-lg font-black uppercase tracking-[0.3em]">미입금</span>
          </div>
          <div className="text-3xl sm:text-7xl font-black admin-number leading-none">{unpaidCount}<span className="text-xs sm:text-3xl ml-1.5">건</span></div>
        </Card>
        <Card className="p-4 sm:p-10 bg-brand-blue text-brand-blue-contrast border-0 shadow-xl overflow-hidden">
          <div className="flex justify-center mb-1 sm:mb-4 opacity-90">
            <span className="text-[12px] sm:text-lg font-black uppercase tracking-[0.3em]">처리 완료</span>
          </div>
          <div className="text-3xl sm:text-7xl font-black admin-number leading-none">{completedCount}<span className="text-xs sm:text-3xl ml-1.5">건</span></div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['전체', '미입금', '입금완료', '배송중', '배송완료', '취소'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all",
                filterStatus === status 
                  ? "bg-zinc-900 text-white shadow-lg scale-105" 
                  : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input 
              placeholder="주문자명, 상품명 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 py-2 h-10 text-xs rounded-xl border-zinc-200"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowBulkTracking(!showBulkTracking)}
            className={cn(
              "h-10 px-4 text-xs font-black flex items-center gap-2",
              showBulkTracking ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <Truck size={14} />
            송장 일괄 입력
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="h-10 px-4 text-xs font-black bg-white border-zinc-200 hover:bg-zinc-50 flex items-center gap-2"
          >
            <TrendingUp size={14} className="rotate-90" />
            CSV 추출
          </Button>
        </div>
      </div>

      {/* 송장 일괄 입력 섹션 */}
      {showBulkTracking && (
        <div className="bg-zinc-900 text-white rounded-[2rem] p-8 space-y-6 animate-slide-down shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black flex items-center gap-3">
                <Truck className="text-brand-pink" />
                송장 일괄 입력 시스템
              </h3>
              <p className="text-zinc-400 text-xs mt-1 font-bold">
                한 줄에 하나씩 입력: <span className="text-brand-pink">주문번호, 배송사, 송장번호</span>
              </p>
            </div>
            <button onClick={() => setShowBulkTracking(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <textarea 
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="예:&#10;123, CJ대한통운, 68712345678&#10;124, 우체국, 1234567890123"
              className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium focus:border-brand-pink outline-none placeholder:opacity-30 scrollbar-thin"
            />
            
            <div className="flex gap-3">
              <Button 
                variant="primary" 
                onClick={handleBulkSave}
                className="flex-1 py-4 text-sm font-black shadow-lg"
              >
                송장 정보 {bulkInput.split('\n').filter(l => l.trim()).length}건 일괄 저장하기
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setBulkInput('')}
                className="px-8 text-sm font-bold text-zinc-400 hover:text-white"
              >
                비우기
              </Button>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 font-bold leading-relaxed">
              * 콤마(,)로 구분하여 주문번호, 배송사명, 송장번호 순으로 입력해주세요.<br />
              * 배송사명은 정확하게 입력해야 추적 링크가 정상 동작합니다 (예: CJ대한통운, 우체국).
            </p>
          </div>
        </div>
      )}

      <SectionHeading icon={Package}>주문 리스트 ({filteredOrders.length}건)</SectionHeading>

      {loading ? (
        Array.from({ length: 3 }).map((_, idx) => <OrderCardSkeleton key={idx} />)
      ) : (!filteredOrders || filteredOrders.length === 0) ? (
        <Card className="text-center py-20 admin-text-secondary italic">
          조건에 맞는 주문 내역이 없습니다.
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const productData = Array.isArray(order.products) ? order.products[0] : order.products;
            const productName = productData?.name || '상품 정보 없음';
            const price = (productData?.price || 0) * (order.quantity || 1);
            
            return (
              <Card 
                key={order.id} 
                className={`p-0 overflow-hidden border-2 transition-all ${
                  order.status === '미입금' ? 'border-brand-pink-light/30' : 'border-brand-blue-light/30'
                }`}
              >
                {/* 헤더: 입금자명과 금액 강조 */}
                <div className={`p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  order.status === '미입금' ? 'bg-brand-pink/5' : 'bg-brand-blue/5'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={order.status === '입금완료' ? 'blue' : 'pink'} className="px-4 py-1.5 text-xs font-black">
                        {order.status}
                      </Badge>
                      <span className="admin-label">#{order.id.toString().slice(-4)}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl admin-title">
                      {order.deposit_name || order.customer_name} 
                      <span className="text-lg font-bold admin-label ml-2">님</span>
                    </h3>
                  </div>
                  <div className="text-right sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="admin-text-secondary line-through opacity-50 text-xs sm:text-sm">
                      {((price + 3000) * 1.2).toLocaleString()}원
                    </div>
                    <div className="text-4xl sm:text-7xl admin-title text-brand-pink-dark admin-number">
                      {price.toLocaleString()}원
                    </div>
                  </div>
                </div>
                
                {/* 바디: 상세 정보 */}
                <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                   <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
                        <Package size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="admin-label">주문 상품</div>
                        <h4 className="admin-text-base text-3xl sm:text-5xl truncate">
                          {productName} <span className="admin-text-secondary text-xl sm:text-3xl ml-2 admin-number">x {order.quantity}개</span>
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 ml-1">
                      <div>
                        <div className="admin-label">선택 옵션</div>
                        <div className="admin-text-base text-brand-pink">
                          {order.selected_option || '기본'}
                        </div>
                      </div>
                      <div>
                        <div className="admin-label">주문 일시</div>
                        <div className="admin-text-secondary text-sm admin-number">
                          {new Date(order.created_at).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <div className="admin-label">배송 정보</div>
                        <div className="admin-text-base text-sm sm:text-base">
                          [{order.zip_code}] {order.address} {order.detail_address}
                        </div>
                        <div className="admin-text-secondary text-sm">
                          수령인: {order.receiver_name} | {order.receiver_phone}
                        </div>
                      </div>
                      {order.requests && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-[10px] text-yellow-700 font-bold">
                          요청사항: {order.requests}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 푸터: 액션 버튼 */}
                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-3">
                  {order.status === '미입금' ? (
                    <Button
                      variant="primary"
                      className="flex-1 py-4 text-sm font-black shadow-lg"
                      onClick={() => onUpdateStatus(order.id, '입금완료')}
                    >
                      입금 확인 완료
                    </Button>
                  ) : order.status === '입금완료' ? (
                    <Button
                      variant="secondary"
                      className="flex-1 py-4 text-sm font-black shadow-lg"
                      onClick={() => onUpdateStatus(order.id, '배송중')}
                    >
                      배송 시작 처리
                    </Button>
                  ) : order.status === '배송중' ? (
                    <>
                      {!showTrackingInput[order.id] && order.tracking_number ? (
                        <Button
                          variant="outline"
                          className="flex-1 py-4 text-sm font-black shadow-lg flex items-center justify-center gap-2"
                          onClick={() => {
                            const trackingUrl = orderService.getTrackingUrl(order.carrier, order.tracking_number);
                            if (trackingUrl) window.open(trackingUrl, '_blank');
                          }}
                        >
                          <Truck size={16} />
                          배송 추적하기
                          <ExternalLink size={14} />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        className="px-6 py-4 text-xs font-black text-brand-pink hover:bg-brand-pink/10"
                        onClick={() => setShowTrackingInput(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      >
                        {showTrackingInput[order.id] ? '취소' : '송장 번호 입력'}
                      </Button>
                    </>
                  ) : (
                    <div className="flex-1 text-center py-4 text-sm admin-label">
                      배송 정보를 입력하면 추적 링크가 생성됩니다.
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="px-6 py-4 text-xs text-red-400 font-bold hover:bg-red-50"
                    onClick={() => onDeleteOrder(order.id)}
                  >
                    주문 삭제
                  </Button>
                </div>

                {/* 송장 번호 입력 폼 */}
                {showTrackingInput[order.id] && (
                  <div className="px-8 py-6 bg-brand-pink/5 border-t border-brand-pink/20">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-black text-brand-pink-dark">
                        <Truck size={16} />
                        송장 번호 입력
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-2">배송사</label>
                          <select
                            value={trackingData[order.id]?.carrier || ''}
                            onChange={(e) => setTrackingData(prev => ({
                              ...prev,
                              [order.id]: { ...prev[order.id], carrier: e.target.value }
                            }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none text-sm font-black"
                          >
                            <option value="">배송사 선택</option>
                            {carriers.map(carrier => (
                              <option key={carrier} value={carrier}>{carrier}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-2">송장 번호</label>
                          <Input
                            placeholder="송장 번호 입력"
                            value={trackingData[order.id]?.trackingNumber || ''}
                            onChange={(e) => setTrackingData(prev => ({
                              ...prev,
                              [order.id]: { ...prev[order.id], trackingNumber: e.target.value }
                            }))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full py-3 text-sm font-black"
                        onClick={() => handleTrackingSave(order.id)}
                      >
                        저장하기
                      </Button>
                    </div>
                  </div>
                )}

                {/* 배송 추적 링크 */}
                {order.tracking_number && order.carrier && !showTrackingInput[order.id] && (
                  <div className="px-8 py-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-blue-600" />
                        <span className="text-xs font-black text-blue-600">
                          {order.carrier}: {order.tracking_number}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 font-black hover:bg-blue-100"
                        onClick={() => {
                          const trackingUrl = orderService.getTrackingUrl(order.carrier, order.tracking_number);
                          if (trackingUrl) window.open(trackingUrl, '_blank');
                        }}
                      >
                        추적하기
                        <ExternalLink size={12} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. 장바구니 관리 센터 */}
      <div className="pt-20 border-t border-gray-100">
        <AdminCartManagement showAlert={showAlert} />
      </div>
    </div>
  );
});

AdminOrders.displayName = 'AdminOrders';

export default AdminOrders;

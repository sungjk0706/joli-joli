import React, { useState, useEffect } from 'react';
import { orderService } from '../../services';
import { Package, Clock, CheckCircle, Truck, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

const CustomerOrderHistory = ({ showAlert, onReorder }) => {
  const [phone, setPhone] = useState(localStorage.getItem('SAVED_CUSTOMER_PHONE') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!phone.trim()) {
      showAlert('입력 오류', '연락처를 입력해주세요.', 'error');
      return;
    }

    setLoading(true);
    try {
      const allOrders = await orderService.getAll();
      const customerOrders = allOrders.filter(
        order => order.customer_phone === phone.trim()
      );
      setOrders(customerOrders);
      setSearched(true);
      
      if (customerOrders.length === 0) {
        showAlert('조회 결과', '해당 연락처로 주문 내역이 없습니다.', 'info');
      }
    } catch (error) {
      console.error('주문 내역 조회 실패:', error);
      showAlert('오류', '주문 내역 조회 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '미입금':
        return <Clock size={16} className="text-yellow-500" />;
      case '입금확인':
      case '입금완료':
        return <CheckCircle size={16} className="text-blue-500" />;
      case '배송중':
        return <Truck size={16} className="text-purple-500" />;
      case '배송완료':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <XCircle size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '미입금':
        return 'bg-yellow-100 text-yellow-700';
      case '입금확인':
      case '입금완료':
        return 'bg-blue-100 text-blue-700';
      case '배송중':
        return 'bg-purple-100 text-purple-700';
      case '배송완료':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleReorder = (order) => {
    const productData = {
      productId: order.product_id,
      productName: order.product_name,
      price: order.price,
      quantity: order.quantity,
      selectedOption: order.selected_option,
    };

    // 재주문 정보를 localStorage에 저장
    localStorage.setItem('REORDER_DATA', JSON.stringify(productData));
    showAlert('재주문 준비', '상품 목록에서 재주문 버튼을 눌러주세요.', 'success');

    // 콜백 호출 (페이지 새로고침 대신)
    if (onReorder) {
      onReorder(productData);
    }
  };

  const handleTrackOrder = (order) => {
    if (order.tracking_number && order.carrier) {
      const trackingUrl = orderService.getTrackingUrl(order.carrier, order.tracking_number);
      if (trackingUrl) {
        window.open(trackingUrl, '_blank');
      } else {
        showAlert('배송 조회', '배송 조회 링크를 찾을 수 없습니다.', 'info');
      }
    } else {
      showAlert('배송 조회', '송장 번호가 등록되지 않았습니다.', 'info');
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white/60 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 to-transparent pointer-events-none" />
      
      <h2 className="font-black text-2xl text-gray-900 mb-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
          <Package size={24} />
        </div>
        주문 내역 조회
      </h2>

      {/* 검색 폼 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-10">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="연락처 입력 (- 없이)"
          className="flex-1 px-6 py-4 rounded-2xl border-2 border-white/60 bg-white/40 focus:border-brand-pink focus:outline-none font-black text-lg shadow-inner transition-all placeholder:text-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-8 py-4 bg-brand-pink text-white rounded-2xl font-black text-lg hover:bg-brand-pink-dark disabled:opacity-50 transition-all shadow-xl shadow-brand-pink/30 active:scale-95"
        >
          {loading ? '조회 중...' : '주문 조회 ✨'}
        </button>
      </div>

      {/* 주문 내역 목록 */}
      {searched && (
        <div className="relative z-10">
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/50 rounded-3xl p-6 border border-white/60 shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                      <h4 className="font-black text-lg text-gray-900 mb-1">{order.product_name}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                        <span>수량: {order.quantity}개</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span>옵션: {order.selected_option || '없음'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-brand-pink-dark">
                        {(order.price * order.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-2xl p-4 text-[11px] font-bold text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">받는분:</span>
                      <span className="text-gray-700">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">입금자:</span>
                      <span className="text-gray-700">{order.deposit_name}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex items-start gap-2">
                      <span className="text-gray-400 shrink-0">주소:</span>
                      <span className="text-gray-700">{order.address}</span>
                    </div>
                  </div>

                  {/* 배송 정보 */}
                  {order.tracking_number && (
                    <div className="mb-4 p-4 rounded-2xl bg-brand-pink/5 border border-brand-pink/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-black text-gray-900">{order.carrier || '배송사'}</span>
                          <span className="w-1 h-1 bg-brand-pink/20 rounded-full"></span>
                          <span className="font-mono font-bold text-brand-pink-dark tracking-wider">{order.tracking_number}</span>
                        </div>
                        <button
                          onClick={() => handleTrackOrder(order)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-brand-pink/20 rounded-xl text-xs text-brand-pink-dark font-black hover:bg-brand-pink hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          <ExternalLink size={14} />
                          배송 조회하기
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 재주문 버튼 */}
                  <button
                    onClick={() => handleReorder(order)}
                    className="w-full py-4 bg-white/60 text-gray-400 border-2 border-white rounded-2xl font-black text-sm hover:bg-brand-pink/10 hover:text-brand-pink-dark hover:border-brand-pink/20 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw size={16} />
                    이 상품 다시 주문하기
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 relative z-10">
              <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center mb-6 text-gray-200">
                <Package size={40} />
              </div>
              <p className="font-black text-xl text-gray-400">주문 내역이 없어요 😥</p>
              <p className="text-sm text-gray-300 font-bold mt-2">연락처를 다시 한번 확인해주세요!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrderHistory;

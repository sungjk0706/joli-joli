import React from 'react';
import { CheckCircle, ClipboardList } from 'lucide-react';
import { Button, Card } from '../ui/Common';

const OrderCompleteView = React.memo(({ selectedProduct, formData, bankInfo, onCopyBankInfo, onBackToHome }) => {
  const totalPrice = selectedProduct.price * formData.quantity;
  const paymentMethod = formData.paymentMethod || 'bank_transfer';

  const getPaymentMethodInfo = () => {
    switch (paymentMethod) {
      case 'kakaopay':
        return {
          label: '카카오페이',
          color: 'bg-[#FEE500] text-[#3c1e1e]',
          icon: '📱',
          link: bankInfo?.payLink
        };
      case 'tosspay':
        return {
          label: '토스',
          color: 'bg-[#06C675] text-white',
          icon: '💳',
          link: bankInfo?.tossLink
        };
      default:
        return {
          label: '무통장 입금',
          color: 'bg-brand-pink text-white',
          icon: '🏦',
          link: null
        };
    }
  };

  const paymentInfo = getPaymentMethodInfo();

  return (
    <div className="w-full max-w-md mx-auto p-6 animate-fade-in relative z-10">
      <Card variant="glass" className="p-6 sm:p-8 text-center space-y-6 sm:space-y-8 bg-white/20 border-white/60 shadow-2xl backdrop-blur-xl">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-[2.5rem] mx-auto flex items-center justify-center mb-4 shadow-xl shadow-green-500/20 animate-scale-in">
          <CheckCircle size={48} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">주문 완료! 🎉</h2>
          <p className="text-gray-500 text-[13px] font-bold">주문이 접수되었습니다. 결제 완료 후 배송이 시작됩니다.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-inner">
          <p className="text-gray-400 text-[10px] font-black mb-1 uppercase tracking-widest">Product</p>
          <p className="font-black text-gray-900 text-lg truncate">{selectedProduct.name}</p>
          <p className="text-gradient-pink font-black text-2xl mt-1">{totalPrice.toLocaleString()}원</p>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-inner">
          <p className="text-gray-400 text-[10px] font-black mb-1 uppercase tracking-widest">Payment Method</p>
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${paymentInfo.color} shadow-lg`}>
            <span className="text-xl">{paymentInfo.icon}</span>
            <span className="font-black">{paymentInfo.label}</span>
          </div>
        </div>

        {paymentMethod === 'bank_transfer' && (
          <div className="bg-white/40 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-inner">
            <p className="text-gray-400 text-[10px] font-black mb-1 uppercase tracking-widest">Bank Info</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-gray-900">{bankInfo.bank}</p>
              <p className="text-xl font-black tracking-tighter text-brand-pink-dark">{bankInfo.account}</p>
              <div className="pt-2 border-t border-brand-pink/5">
                <p className="text-[11px] text-gray-400 font-bold">예금주: <span className="text-gray-900">{bankInfo.holder || '관리자'}</span></p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        {paymentInfo.link && (
          <Button 
            variant="primary" 
            className={`w-full py-5 sm:py-6 text-lg sm:text-xl shadow-xl ${paymentInfo.color} border-none`} 
            onClick={() => window.open(paymentInfo.link, '_blank')}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{paymentInfo.icon}</span>
              <span className="font-black">{paymentInfo.label}로 결제하기</span>
            </div>
          </Button>
        )}
        {paymentMethod === 'bank_transfer' && (
          <Button variant="dark" className="w-full py-5 sm:py-6 text-lg sm:text-xl shadow-xl" onClick={onCopyBankInfo} icon={ClipboardList}>
            입금 정보 복사하기
          </Button>
        )}
        <Button variant="outline" className="w-full py-3 sm:py-4 text-sm sm:text-base" onClick={onBackToHome}>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
});

OrderCompleteView.displayName = 'OrderCompleteView';

export default OrderCompleteView;

import React, { useState, useEffect } from 'react';
import { cartService } from '../services';
import { ShoppingBag, Trash2, Plus, Minus, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/Common';

const CartView = ({ customerPhone, showAlert, onCheckout, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerPhone) {
      loadCart();
    }
  }, [customerPhone]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const items = await cartService.getCart(customerPhone);
      setCartItems(items);
    } catch (error) {
      console.error('장바구니 로드 실패:', error);
      showAlert('오류', '장바구니를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateQuantity(cartId, newQuantity);
      loadCart();
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      showAlert('오류', '수량 업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await cartService.removeFromCart(cartId);
      loadCart();
      showAlert('삭제 완료', '상품이 장바구니에서 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('삭제 실패:', error);
      showAlert('오류', '삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart(customerPhone);
      setCartItems([]);
      showAlert('장바구니 비우기', '장바구니가 비워졌습니다.', 'success');
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      showAlert('오류', '장바구니 비우기 중 오류가 발생했습니다.', 'error');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-brand-pink" size={28} />
            <h3 className="font-black text-2xl text-gray-900">장바구니</h3>
            <span className="bg-brand-pink/10 text-brand-pink px-3 py-1 rounded-full text-xs font-black">
              {totalQuantity}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto flex items-center justify-center mb-6 text-gray-200">
                <ShoppingBag size={56} />
              </div>
              <p className="font-black text-xl text-gray-400">장바구니가 비어있어요 🛍️</p>
              <p className="text-sm text-gray-300 font-bold mt-2">졸리졸리의 예쁜 옷들을 채워보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-5 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                    {item.products?.image_url && (
                      <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-lg text-gray-900 truncate leading-tight">{item.products?.name}</h4>
                      {item.selected_option && (
                        <p className="inline-block mt-1 text-[11px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md italic">
                          옵션: {item.selected_option}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-black text-xl text-brand-pink-dark">
                        {(item.products?.price || 0).toLocaleString()}원
                      </p>
                      <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-brand-pink active:scale-90 transition-all"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg gradient-primary text-white flex items-center justify-center active:scale-90 transition-all shadow-md"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-10 h-10 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all flex-shrink-0 shadow-sm self-start"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="relative z-10 p-6 bg-white/60 backdrop-blur-xl border-t border-brand-pink/10 space-y-4 shadow-inner">
            <div className="flex justify-between items-end px-2">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-[13px] font-bold text-gray-500 italic">배송비는 졸리졸리가 쏩니다! 🎁</p>
              </div>
              <span className="font-black text-3xl text-gradient-pink leading-none">{totalAmount.toLocaleString()}원</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 py-5 rounded-[1.5rem] font-black text-gray-400 border-2 border-white bg-white/40"
                onClick={handleClearCart}
              >
                비우기
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-[2] py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-brand-pink/30 flex items-center justify-center gap-3"
                onClick={() => onCheckout(cartItems)}
              >
                주문하기
                <ArrowRight size={22} strokeWidth={3} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;

import React from 'react';
import { Tag, Plus, CheckCircle, XCircle, Trash2, Edit2, Check, X } from 'lucide-react';

const CouponTab = ({ 
  coupons, 
  showCouponForm, 
  setShowCouponForm, 
  editingCoupon, 
  setEditingCoupon,
  couponFormData, 
  setCouponFormData,
  onSubmit,
  onEdit,
  onToggle,
  onDelete,
  onResetForm
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl admin-title">쿠폰 관리</h2>
          <p className="admin-text-secondary text-sm sm:text-base">할인 쿠폰을 생성하고 관리합니다.</p>
        </div>
        <button
          onClick={() => {
            onResetForm();
            setEditingCoupon(null);
            setShowCouponForm(true);
          }}
          className="bg-brand-pink text-brand-pink-contrast px-4 py-2 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={20} />
          <span>새 쿠폰</span>
        </button>
      </div>

      {showCouponForm && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-brand-pink/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="admin-title text-base sm:text-lg">{editingCoupon ? '쿠폰 수정' : '새 쿠폰 생성'}</h3>
            <button onClick={() => setShowCouponForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="admin-label block mb-1">쿠폰 코드</label>
                <input
                  type="text"
                  value={couponFormData.code}
                  onChange={e => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                  placeholder="예: WELCOME2024"
                  required
                />
              </div>
              <div>
                <label className="admin-label block mb-1">할인 유형</label>
                <select
                  value={couponFormData.discount_type}
                  onChange={e => setCouponFormData({ ...couponFormData, discount_type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                >
                  <option value="percentage">정률 할인 (%)</option>
                  <option value="fixed">정액 할인 (원)</option>
                </select>
              </div>
              <div>
                <label className="admin-label block mb-1">할인 값</label>
                <input
                  type="number"
                  value={couponFormData.discount_value}
                  onChange={e => setCouponFormData({ ...couponFormData, discount_value: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                  placeholder={couponFormData.discount_type === 'percentage' ? '10' : '5000'}
                  required
                />
              </div>
              <div>
                <label className="admin-label block mb-1">최소 주문 금액 (선택)</label>
                <input
                  type="number"
                  value={couponFormData.min_purchase}
                  onChange={e => setCouponFormData({ ...couponFormData, min_purchase: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                  placeholder="0"
                />
              </div>
              {couponFormData.discount_type === 'percentage' && (
                <div>
                  <label className="admin-label block mb-1">최대 할인 금액 (선택)</label>
                  <input
                    type="number"
                    value={couponFormData.max_discount}
                    onChange={e => setCouponFormData({ ...couponFormData, max_discount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                  />
                </div>
              )}
              <div>
                <label className="admin-label block mb-1">사용 제한 횟수 (선택)</label>
                <input
                  type="number"
                  value={couponFormData.usage_limit}
                  onChange={e => setCouponFormData({ ...couponFormData, usage_limit: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="admin-label block mb-1">유효 시작일</label>
                <input
                  type="date"
                  value={couponFormData.valid_from}
                  onChange={e => setCouponFormData({ ...couponFormData, valid_from: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="admin-label block mb-1">유효 종료일</label>
                <input
                  type="date"
                  value={couponFormData.valid_until}
                  onChange={e => setCouponFormData({ ...couponFormData, valid_until: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-brand-pink text-brand-pink-contrast py-3 rounded-xl font-black text-lg hover:scale-[1.02] transition-all shadow-lg"
            >
              {editingCoupon ? '쿠폰 수정 완료' : '쿠폰 생성하기'}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-3 sm:gap-4">
        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Tag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="admin-text-base">생성된 쿠폰이 없습니다.</p>
          </div>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-2xl p-4 border border-brand-pink/10 shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-gray-900 text-lg">{coupon.code}</span>
                  {!coupon.is_active && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold">비활성</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-brand-pink font-black">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% 할인` : `${coupon.discount_value.toLocaleString()}원 할인`}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {coupon.min_purchase > 0 ? `${coupon.min_purchase.toLocaleString()}원 이상 구매 시` : '금액 제한 없음'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  기간: {coupon.valid_from || '미지정'} ~ {coupon.valid_until || '미지정'} | 사용: {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggle(coupon)}
                  className={`p-2 rounded-xl transition-all ${coupon.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-50'}`}
                >
                  {coupon.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </button>
                <button
                  onClick={() => onEdit(coupon)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => onDelete(coupon.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CouponTab;

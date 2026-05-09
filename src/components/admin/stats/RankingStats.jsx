import React from 'react';
import { ShoppingBag, Users } from 'lucide-react';

export const ProductRanking = ({ popularProducts }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
      <ShoppingBag size={18} className="text-brand-pink" />
      인기 상품 순위
    </h3>
    <div className="space-y-3">
      {popularProducts.map((product, index) => (
        <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
            index === 0 ? 'bg-yellow-400 text-yellow-900' :
            index === 1 ? 'bg-gray-300 text-gray-700' :
            index === 2 ? 'bg-orange-300 text-orange-800' :
            'bg-gray-100 text-gray-600'
          }`}>
            {index + 1}
          </div>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="admin-text-base text-sm truncate">{product.name}</h4>
            <p className="admin-label text-[10px]">{product.price.toLocaleString()}원</p>
          </div>
          <div className="text-right">
            <p className="admin-text-base text-sm text-brand-pink">{product.total_sold || 0}개</p>
            <p className="admin-label text-[10px]">{(product.total_revenue || 0).toLocaleString()}원</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CustomerRanking = ({ customerStats }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
      <Users size={18} className="text-brand-pink" />
      고객 분석
    </h3>
    <div className="space-y-3">
      {customerStats.map((customer, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-dark flex items-center justify-center">
            <Users size={18} className="text-brand-pink-contrast" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="admin-text-base text-sm truncate">{customer.customer_name}</h4>
            <p className="admin-label text-[10px]">{customer.customer_phone || '연락처 없음'}</p>
          </div>
          <div className="text-right">
            <p className="admin-text-base text-sm text-brand-pink">{customer.order_count}건</p>
            <p className="admin-label text-[10px]">{(customer.total_spent || 0).toLocaleString()}원</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

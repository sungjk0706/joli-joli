import React from 'react';
import { ShoppingBag, Wallet, Calendar, TrendingUp, Users } from 'lucide-react';

const StatCard = ({ title, value, unit, subValue, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
    <div className="flex justify-center items-center gap-3 mb-4">
      <div className={`p-3 rounded-2xl bg-${colorClass}/10 text-${colorClass}`}>
        <Icon size={24} />
      </div>
      <span className="admin-label font-black text-lg">{title}</span>
    </div>
    <div className="flex flex-col items-center w-full">
      <span className="text-4xl sm:text-6xl font-black text-gray-900 admin-number leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <p className="admin-label text-base mt-3 text-center">{unit} {subValue && `(${subValue})`}</p>
    </div>
  </div>
);

const StatsOverview = ({ overallStats, popularProducts, customerStats, viewerCount = 0 }) => {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="현재 접속자" 
          value={viewerCount} 
          unit="명" 
          icon={Users} 
          colorClass="brand-pink" 
        />
        <StatCard 
          title="총 주문" 
          value={overallStats?.totalOrders || 0} 
          unit="건" 
          icon={ShoppingBag} 
          colorClass="zinc-900" 
        />
        <StatCard 
          title="총 매출" 
          value={(overallStats?.totalSales || 0).toLocaleString()} 
          unit="원" 
          icon={Wallet} 
          colorClass="brand-pink" 
        />
        <StatCard 
          title="오늘 매출" 
          value={(overallStats?.todaySales || 0).toLocaleString()} 
          unit="원" 
          subValue={`${overallStats?.todayOrders || 0}건`}
          icon={Calendar} 
          colorClass="brand-pink" 
        />
        <StatCard 
          title="이번 달" 
          value={(overallStats?.thisMonthSales || 0).toLocaleString()} 
          unit="원" 
          subValue={`${overallStats?.thisMonthOrders || 0}건`}
          icon={TrendingUp} 
          colorClass="brand-pink" 
        />
      </div>

      {/* Quick Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products TOP 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-pink" />
            인기 상품 TOP 3
          </h3>
          <div className="space-y-3">
            {popularProducts.slice(0, 3).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  'bg-orange-300 text-orange-800'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="admin-text-base text-sm truncate">{product.name}</p>
                  <p className="admin-label text-[10px]">{product.total_sold}개 판매</p>
                </div>
                <p className="font-black text-brand-pink text-sm">
                  {(product.total_revenue || 0).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Customers TOP 3 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand-pink" />
            VIP 고객 TOP 3
          </h3>
          <div className="space-y-3">
            {customerStats.slice(0, 3).map((customer, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-pink to-brand-pink-dark flex items-center justify-center">
                  <Users size={16} className="text-brand-pink-contrast" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="admin-text-base text-sm truncate">{customer.customer_name}</p>
                  <p className="admin-label text-[10px]">{customer.order_count}건 주문</p>
                </div>
                <p className="font-black text-brand-pink text-sm">
                  {(customer.total_spent || 0).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

import React from 'react';
import { Calendar, PieChart } from 'lucide-react';

const StatBar = ({ label, value, percent, subLabel }) => (
  <div className="flex items-center gap-3 py-1.5">
    <span className="admin-label w-24">{label}</span>
    <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
      <div 
        className="h-full bg-brand-pink transition-all duration-500" 
        style={{ width: `${percent}%` }}
      />
    </div>
    <span className="admin-text-base text-xs w-20 text-right">{value.toLocaleString()}원</span>
    <span className="admin-label w-12 text-right">{subLabel}</span>
  </div>
);

const SalesStats = ({ dailyStats, monthlyStats }) => {
  const maxDailySales = Math.max(...dailyStats.map(s => s.total_sales), 1);
  const maxMonthlySales = Math.max(...monthlyStats.map(s => s.total_sales), 1);

  return (
    <div className="space-y-6">
      {/* Daily Sales */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-brand-pink" />
          최근 30일 일별 매출
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {dailyStats.map((stat) => (
            <ChartRow 
              key={stat.date} 
              label={stat.date} 
              value={stat.total_sales} 
              subLabel={`${stat.order_count}건`} 
              percentage={(stat.total_sales / maxDailySales) * 100}
            />
          ))}
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-brand-pink" />
          월별 매출 추이
        </h3>
        <div className="space-y-2">
          {monthlyStats.map((stat) => (
            <ChartRow 
              key={stat.month} 
              label={stat.month ? stat.month.slice(0, 7) : '-'} 
              value={stat.total_sales} 
              subLabel={`${stat.order_count}건`} 
              percentage={(stat.total_sales / maxMonthlySales) * 100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesStats;

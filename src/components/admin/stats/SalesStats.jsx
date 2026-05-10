import React from 'react';
import { Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Tooltip as RechartsTooltip 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 border border-brand-pink/20 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-black text-gray-900">
          매출: <span className="text-brand-pink">{payload[0].value.toLocaleString()}원</span>
        </p>
        <p className="text-[10px] font-bold text-gray-500">
          주문: {payload[0].payload.order_count || 0}건
        </p>
      </div>
    );
  }
  return null;
};

const SalesStats = ({ dailyStats = [], monthlyStats = [] }) => {
  // 데이터 가공
  const chartData = dailyStats.map(d => ({
    name: d.date.split('-').slice(1).join('/'),
    value: d.total_sales,
    order_count: d.order_count
  }));

  const monthData = monthlyStats.map(m => ({
    name: m.month,
    value: m.total_sales,
    order_count: m.order_count
  })).reverse();

  return (
    <div className="space-y-8">
      {/* Daily Sales Area Chart */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-gray-900 text-xl flex items-center gap-3">
            <TrendingUp size={24} className="text-brand-pink" />
            최근 30일 매출 추이
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-pink rounded-full" />
              <span className="text-[10px] font-bold text-gray-500">일별 매출액</span>
            </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4b91" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff4b91" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                interval={2}
              />
              <YAxis 
                hide 
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ff4b91" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Sales Bar Chart */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-900 text-xl mb-8 flex items-center gap-3">
          <BarChart3 size={24} className="text-brand-pink" />
          월별 성과 분석
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#fdf2f8'}} />
              <Bar 
                dataKey="value" 
                radius={[10, 10, 10, 10]} 
                barSize={40}
                animationDuration={1500}
              >
                {monthData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === monthData.length - 1 ? '#ff4b91' : '#fecdd3'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesStats;

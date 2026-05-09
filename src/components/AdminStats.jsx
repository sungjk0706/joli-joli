import React, { useState, useEffect } from 'react';
import { statsService } from '../services';
import { ShoppingBag, BarChart3, Wallet, Users } from 'lucide-react';

// Modularized Components
import StatsOverview from './admin/stats/StatsOverview';
import SalesStats from './admin/stats/SalesStats';
import { ProductRanking, CustomerRanking } from './admin/stats/RankingStats';

const AdminStats = () => {
  const [overallStats, setOverallStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [overall, daily, monthly, popular, customers] = await Promise.all([
        statsService.getOverallStats(),
        statsService.getDailySalesStats(30),
        statsService.getMonthlySalesStats(12),
        statsService.getPopularProducts(10),
        statsService.getCustomerStats(20),
      ]);
      setOverallStats(overall);
      setDailyStats(daily);
      setMonthlyStats(monthly);
      setPopularProducts(popular);
      setCustomerStats(customers);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      setOverallStats({
        totalOrders: 0, totalSales: 0, totalItems: 0,
        todaySales: 0, todayOrders: 0, thisMonthSales: 0, thisMonthOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="admin-text-secondary animate-pulse">데이터 분석 중...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: '개요', icon: BarChart3 },
    { id: 'sales', name: '매출 통계', icon: Wallet },
    { id: 'products', name: '인기 상품', icon: ShoppingBag },
    { id: 'customers', name: '고객 분석', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl admin-text-base text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-brand-pink text-brand-pink-contrast shadow-lg scale-105'
                : 'bg-white admin-label hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <StatsOverview 
            overallStats={overallStats} 
            popularProducts={popularProducts} 
            customerStats={customerStats} 
          />
        )}
        
        {activeTab === 'sales' && (
          <SalesStats 
            dailyStats={dailyStats} 
            monthlyStats={monthlyStats} 
          />
        )}
        
        {activeTab === 'products' && (
          <ProductRanking 
            popularProducts={popularProducts} 
          />
        )}
        
        {activeTab === 'customers' && (
          <CustomerRanking 
            customerStats={customerStats} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminStats;

import { supabase } from '../lib/supabase';

export const statsService = {
  async getDailySalesStats(days = 30) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('daily_sales_stats')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getMonthlySalesStats(months = 12) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('monthly_sales_stats')
      .select('*')
      .limit(months)
      .order('month', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPopularProducts(limit = 10) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('popular_products')
      .select('*')
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getCustomerStats(limit = 20) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('customer_stats')
      .select('*')
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getOverallStats() {
    if (!supabase) return null;
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('price, quantity, status, created_at')
      .in('status', ['입금완료', '배송중', '배송완료']);
    
    if (ordersError) throw ordersError;

    const totalOrders = orders?.length || 0;
    const totalSales = orders?.reduce((sum, o) => sum + (o.price * o.quantity), 0) || 0;
    const totalItems = orders?.reduce((sum, o) => sum + o.quantity, 0) || 0;

    // 오늘의 매출
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders?.filter(o => o.created_at.startsWith(today)) || [];
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);

    // 이번 달 매출
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthOrders = orders?.filter(o => o.created_at.startsWith(thisMonth)) || [];
    const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);

    return {
      totalOrders,
      totalSales,
      totalItems,
      todaySales,
      todayOrders: todayOrders.length,
      thisMonthSales,
      thisMonthOrders: thisMonthOrders.length,
    };
  },
};

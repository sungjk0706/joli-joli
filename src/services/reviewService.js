import { supabase } from '../lib/supabase';

export const reviewService = {
  async getByProductId(productId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(reviewData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        customer_name: reviewData.customerName,
        product_id: reviewData.productId,
        order_id: reviewData.orderId || null,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        is_verified: !!reviewData.orderId,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, reviewData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  },

  async getAverageRating(productId) {
    if (!supabase) return { average: 0, count: 0 };
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);
    if (error) throw error;
    
    const reviews = data || [];
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
    };
  },

  async getReviewsByOrder(orderId) {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  },
};

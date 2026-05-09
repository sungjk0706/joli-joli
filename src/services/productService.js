import { supabase } from '../lib/supabase';

export const productService = {
  async getAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(productData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, productData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleStock(id, isOutOfStock) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('products')
      .update({ is_out_of_stock: !isOutOfStock })
      .eq('id', id);
    if (error) throw error;
  },

  async uploadImage(file) {
    if (!supabase) throw new Error('Supabase not configured');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);
    return publicUrl;
  },

  subscribeToChanges(callback) {
    if (!supabase) return { unsubscribe: () => {} };
    const subscription = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe();
    return {
      unsubscribe: () => supabase.removeChannel(subscription),
    };
  },
  async decrementStock(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.rpc('decrement_stock', { product_id: id });
    if (error) {
      if (error.message.includes('OUT_OF_STOCK')) {
        throw new Error('재고가 모두 소진되었습니다. 😭');
      }
      throw error;
    }
    return data;
  },

  async incrementSalesCount(id, quantity = 1) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.rpc('increment_sales_count', { product_id: id, quantity: quantity });
    if (error) throw error;
  },

  async getSalesCount(id) {
    if (!supabase) return 0;
    const { data, error } = await supabase
      .from('products')
      .select('sales_count')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data?.sales_count || 0;
  },
};


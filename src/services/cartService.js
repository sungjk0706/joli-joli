import { supabase } from '../lib/supabase';

export const cartService = {
  async getCart(customerPhone) {
    if (!supabase || !customerPhone) return [];
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('customer_phone', customerPhone);
    if (error) throw error;
    return data || [];
  },

  async addToCart(customerPhone, productId, quantity = 1, selectedOption = '') {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 기존에 있는지 확인
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('customer_phone', customerPhone)
      .eq('product_id', productId)
      .eq('selected_option', selectedOption)
      .maybeSingle();

    if (existing) {
      // 수량 업데이트
      const { data, error } = await supabase
        .from('cart')
        .update({ 
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // 새로 추가
      const { data, error } = await supabase
        .from('cart')
        .insert([{
          customer_phone: customerPhone,
          product_id: productId,
          quantity,
          selected_option: selectedOption,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async updateQuantity(cartId, quantity) {
    if (!supabase) throw new Error('Supabase not configured');
    if (quantity <= 0) {
      return this.removeFromCart(cartId);
    }
    const { data, error } = await supabase
      .from('cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async removeFromCart(cartId) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('cart').delete().eq('id', cartId);
    if (error) throw error;
  },

  async clearCart(customerPhone) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('cart').delete().eq('customer_phone', customerPhone);
    if (error) throw error;
  },

  async getCartCount(customerPhone) {
    if (!supabase || !customerPhone) return 0;
    const { data, error } = await supabase
      .from('cart')
      .select('id')
      .eq('customer_phone', customerPhone);
    if (error) throw error;
    return data?.length || 0;
  },

  async getCartTotal(customerPhone) {
    if (!supabase || !customerPhone) return 0;
    const { data, error } = await supabase
      .from('cart')
      .select('*, products(price)')
      .eq('customer_phone', customerPhone);
    if (error) throw error;
    
    return (data || []).reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0);
  },
};

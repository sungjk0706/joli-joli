import { supabase } from '../lib/supabase';

export const categoryService = {
  async getAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(name) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};

import { supabase } from '../lib/supabase';

export const configService = {
  async getAll() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('configs').select('*');
    if (error) throw error;
    return data || [];
  },

  async getByKey(key) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('configs')
      .select('*')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsert(key, value) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('configs')
      .upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  },

  async upsertMultiple(configs) {
    if (!supabase) throw new Error('Supabase not configured');
    const validConfigs = configs.filter(c => c.key && c.value !== undefined && c.value !== null);
    if (validConfigs.length === 0) return;
    const { error } = await supabase
      .from('configs')
      .upsert(validConfigs, { onConflict: 'key' });
    if (error) throw error;
  },

  async getShopConfig() {
    if (!supabase) return this.getDefaultConfig();
    try {
      const data = await this.getAll();
      return {
        shopName: data.find(c => c.key === 'shop_name')?.value || 'joli.joli',
        shopSubtitle: data.find(c => c.key === 'shop_subtitle')?.value || '라이브 컬렉션 ✨',
        shopNotice: data.find(c => c.key === 'shop_notice')?.value || '',
        instaUrl: data.find(c => c.key === 'insta_url')?.value || '',
        isOrderingActive: data.find(c => c.key === 'is_ordering_active')?.value === 'true',
        bankInfo: this.parseJSON(data.find(c => c.key === 'bank_info')?.value),
        telegramConfig: this.parseJSON(data.find(c => c.key === 'telegram_config')?.value),
        shortformVideoUrl: data.find(c => c.key === 'shortform_video_url')?.value || '/인스타.mp4',
      };
    } catch (e) {
      console.error('설정 로드 실패:', e);
      return this.getDefaultConfig();
    }
  },

  parseJSON(value) {
    if (!value) return {};
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  },

  getDefaultConfig() {
    return {
      shopName: 'joli.joli',
      shopSubtitle: '라이브 컬렉션 ✨',
      shopNotice: '',
      instaUrl: '',
      isOrderingActive: true,
      bankInfo: { bank: '', account: '', holder: '', payLink: '' },
      telegramConfig: { token: '', chatId: '' },
      shortformVideoUrl: '/인스타.mp4',
    };
  },
};

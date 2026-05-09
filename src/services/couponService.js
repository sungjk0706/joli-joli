import { supabase } from '../lib/supabase';

export const couponService = {
  async getAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByCode(code) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async create(couponData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        ...couponData,
        code: couponData.code.toUpperCase(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, couponData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('coupons')
      .update({
        ...couponData,
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
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  },

  async validateCoupon(code, purchaseAmount, customerPhone) {
    if (!supabase) return { valid: false, reason: '서비스 오류' };

    const coupon = await this.getByCode(code);
    if (!coupon) {
      return { valid: false, reason: '존재하지 않는 쿠폰입니다.' };
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (validFrom && now < validFrom) {
      return { valid: false, reason: '아직 사용할 수 없는 쿠폰입니다.' };
    }

    if (validUntil && now > validUntil) {
      return { valid: false, reason: '만료된 쿠폰입니다.' };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, reason: '사용 가능 횟수를 초과했습니다.' };
    }

    if (coupon.min_purchase && purchaseAmount < coupon.min_purchase) {
      return { valid: false, reason: `최소 구매 금액은 ${coupon.min_purchase.toLocaleString()}원입니다.` };
    }

    // 동일 고객의 사용 횟수 확인 (선택사항)
    if (customerPhone) {
      const { data: usages } = await supabase
        .from('coupon_usages')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('customer_phone', customerPhone);
      
      if (usages && usages.length >= 1) { // 1인 1회 제한
        return { valid: false, reason: '이미 사용한 쿠폰입니다.' };
      }
    }

    return { valid: true, coupon };
  },

  async calculateDiscount(coupon, purchaseAmount) {
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.floor(purchaseAmount * (coupon.discount_value / 100));
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return Math.min(discount, purchaseAmount);
  },

  async useCoupon(couponId, orderId, customerPhone, discountAmount) {
    if (!supabase) throw new Error('Supabase not configured');

    // 쿠폰 사용 내역 기록
    const { error: usageError } = await supabase
      .from('coupon_usages')
      .insert([{
        coupon_id: couponId,
        order_id: orderId,
        customer_phone: customerPhone,
        discount_amount: discountAmount,
      }]);

    if (usageError) throw usageError;

    // 쿠폰 사용 횟수 증가
    const { error: updateError } = await supabase.rpc('increment_coupon_usage', {
      coupon_id: couponId
    });

    if (updateError) {
      // RPC가 없으면 직접 업데이트
      await supabase
        .from('coupons')
        .update({ 
          used_count: supabase.raw('used_count + 1'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', couponId);
    }
  },

  getCouponUsages(couponId) {
    if (!supabase) return [];
    return supabase
      .from('coupon_usages')
      .select('*')
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });
  },
};

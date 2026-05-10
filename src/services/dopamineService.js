import { supabase } from '../lib/supabase';

export const dopamineService = {
  // ==================== 선참순 판매 (Flash Sale) ====================
  
  // 선참순 판매 가능 여부 확인
  async checkFlashSaleAvailability(productId) {
    if (!supabase) return { isAvailable: false, remainingQuantity: 0, isActive: false };
    
    const { data, error } = await supabase.rpc('check_flash_sale_availability', {
      product_id: productId
    });
    
    if (error) throw error;
    
    return data?.[0] || { isAvailable: false, remainingQuantity: 0, isActive: false };
  },

  // 선참순 판매 기록
  async recordFlashSale(productId, customerPhone, customerName, quantity = 1) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 1. 선참순 판매 기록 저장
    const { error: insertError } = await supabase.from('flash_sales').insert([{
      product_id: productId,
      customer_phone: customerPhone,
      customer_name: customerName,
      quantity
    }]);
    
    if (insertError) throw insertError;
    
    // 2. 판매 수량 증가
    const { error: updateError } = await supabase.rpc('increment_flash_sale_sold', {
      product_id: productId,
      quantity
    });
    
    if (updateError) throw updateError;
  },

  // 상품의 선참순 판매 설정 업데이트
  async updateFlashSaleSettings(productId, settings) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.from('products').update({
      flash_sale_enabled: settings.enabled,
      flash_sale_start_time: settings.startTime,
      flash_sale_end_time: settings.endTime,
      flash_sale_quantity: settings.quantity,
      flash_sale_sold_quantity: 0 // 설정 변경 시 판매량 초기화
    }).eq('id', productId);
    
    if (error) throw error;
  },

  // 선참순 판매 기록 조회
  async getFlashSaleHistory(productId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .eq('product_id', productId)
      .order('purchased_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // ==================== 한정판 (Limited Edition) ====================
  
  // 한정판 설정 업데이트
  async updateLimitedSettings(productId, isLimited, limitedQuantity) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.from('products').update({
      is_limited: isLimited,
      limited_quantity: limitedQuantity
    }).eq('id', productId);
    
    if (error) throw error;
  },

  // 한정판 재고 확인
  async checkLimitedStock(productId) {
    if (!supabase) return { isLimited: false, remaining: 0 };
    
    const { data, error } = await supabase
      .from('products')
      .select('is_limited, limited_quantity, stock')
      .eq('id', productId)
      .single();
    
    if (error) throw error;
    
    if (!data.is_limited) {
      return { isLimited: false, remaining: data.stock || 0 };
    }
    
    return { isLimited: true, remaining: Math.min(data.limited_quantity, data.stock || 0) };
  },

  // ==================== 추첨 시스템 (Raffle) ====================
  
  // 추첨 이벤트 생성
  async createRaffle(raffleData) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.from('raffles').insert([{
      product_id: raffleData.productId,
      title: raffleData.title,
      description: raffleData.description,
      start_time: raffleData.startTime,
      end_time: raffleData.endTime,
      max_participants: raffleData.maxParticipants,
      winner_count: raffleData.winnerCount || 1
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  // 추첨 이벤트 목록 조회
  async getRaffles(activeOnly = false) {
    if (!supabase) return [];
    
    let query = supabase.from('raffles').select('*').order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true).eq('is_completed', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // 추첨 이벤트 상세 조회
  async getRaffleById(raffleId) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 추첨 참여
  async enterRaffle(raffleId, customerPhone, customerName) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 1. 참여 가능 여부 확인
    const { data: availability, error: checkError } = await supabase.rpc('check_raffle_availability', {
      p_raffle_id: raffleId,
      p_customer_phone: customerPhone
    });
    
    if (checkError) throw checkError;
    
    if (!availability?.[0]?.is_available) {
      if (availability?.[0]?.already_entered) {
        throw new Error('이미 참여하신 추첨입니다.');
      }
      if (availability?.[0]?.current_participants >= availability?.[0]?.max_participants) {
        throw new Error('참여 인원이 모두 찼습니다.');
      }
      throw new Error('현재 참여할 수 없는 추첨입니다.');
    }
    
    // 2. 참여 기록 저장
    const { data, error } = await supabase.from('raffle_entries').insert([{
      raffle_id: raffleId,
      customer_phone: customerPhone,
      customer_name: customerName
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  // 추첨 참여자 목록 조회
  async getRaffleEntries(raffleId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('raffle_entries')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('entered_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // 추첨 당첨자 선정
  async selectRaffleWinners(raffleId) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // 1. 추첨 이벤트 정보 조회
    const raffle = await this.getRaffleById(raffleId);
    if (!raffle) throw new Error('추첨 이벤트를 찾을 수 없습니다.');
    
    // 2. 참여자 목록 조회
    const entries = await this.getRaffleEntries(raffleId);
    if (entries.length === 0) throw new Error('참여자가 없습니다.');
    
    // 3. 랜덤 당첨자 선정
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, raffle.winner_count);
    
    // 4. 당첨자 기록 저장
    for (const winner of winners) {
      await supabase.from('raffle_winners').insert([{
        raffle_id: raffleId,
        customer_phone: winner.customer_phone,
        customer_name: winner.customer_name
      }]);
      
      // 참여자 테이블에서 당첨 표시
      await supabase.from('raffle_entries')
        .update({ is_winner: true })
        .eq('id', winner.id);
    }
    
    // 5. 추첨 완료 표시
    await supabase.from('raffles')
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq('id', raffleId);
    
    return winners;
  },

  // 추첨 당첨자 목록 조회
  async getRaffleWinners(raffleId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('raffle_winners')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('won_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // 추첨 이벤트 삭제
  async deleteRaffle(raffleId) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.from('raffles').delete().eq('id', raffleId);
    if (error) throw error;
  },

  // 추첨 이벤트 활성/비활성
  async toggleRaffleActive(raffleId, isActive) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase.from('raffles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', raffleId);
    
    if (error) throw error;
  }
};

import { supabase } from '../lib/supabase';

export const orderService = {
  async getAll() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(orderData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTrackingNumber(id, trackingNumber, carrier) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber, carrier: carrier })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback) {
    if (!supabase) return { unsubscribe: () => {} };
    const subscription = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
    return {
      unsubscribe: () => supabase.removeChannel(subscription),
    };
  },

  getTrackingUrl(carrier, trackingNumber) {
    if (!trackingNumber) return null;

    const carriers = {
      'cj대한통운': `https://www.cjlogistics.com/kor/service/inquiry_result_waybill.jsp?wbl_num=${trackingNumber}`,
      '우체국': `https://service.epost.go.kr/portal.RetrievePhilRySeqtLiist.comm?displayNo=1-2&postNum=${trackingNumber}`,
      '롯데택배': `https://www.lotteglogis.com/tracking/mobileTracking.jsp?InvNo=${trackingNumber}`,
      '한진택배': `https://www.hanjin.com/kor/CustomerService/customerService_cs_02.do?wbl_num=${trackingNumber}`,
      '경동택배': `https://kdex.com/kdex/servlet/trk.trkResult?barcode=${trackingNumber}`,
      '로젠택배': `https://www.ilogen.com/i/logistics/goods/tracking.do?slipno=${trackingNumber}`,
      'EMS': `https://trace.epost.go.kr/ctt13trace RetrieveDetailServRCCS?POST_ID=${trackingNumber}`,
    };

    return carriers[carrier] || null;
  },

  async placeOrderTransaction(orderData) {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name: orderData.customer_name,
      p_customer_phone: orderData.phone || orderData.customer_phone,
      p_address: orderData.address,
      p_detail_address: orderData.detail_address || '',
      p_zonecode: orderData.zonecode || '',
      p_product_id: orderData.product_id,
      p_product_name: orderData.product_name,
      p_price: orderData.price,
      p_options: orderData.options || '',
      p_payment_method: orderData.payment_method || 'bank_transfer',
      p_quantity: orderData.quantity || 1,
      p_selected_option: orderData.selected_option || '',
      p_deposit_name: orderData.deposit_name || orderData.customer_name,
      p_requests: orderData.requests || ''
    });

    if (error) {
      if (error.message.includes('OUT_OF_STOCK')) {
        throw new Error('재고가 부족하여 주문을 완료할 수 없습니다. 😭');
      }
      throw error;
    }
    return data;
  },
};

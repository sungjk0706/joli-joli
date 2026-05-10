/**
 * Portone (I'mport) Payment Service
 */
export const paymentService = {
  /**
   * Initialize Portone with Merchant ID
   * @param {string} merchantId 
   */
  init(merchantId) {
    if (!window.IMP) return false;
    window.IMP.init(merchantId);
    return true;
  },

  /**
   * Request Payment
   * @param {Object} data 
   * @returns {Promise}
   */
  requestPayment(data) {
    return new Promise((resolve, reject) => {
      if (!window.IMP) {
        reject(new Error('결제 모듈이 로드되지 않았습니다.'));
        return;
      }

      const {
        pg = 'kcp',
        pay_method = 'card',
        merchant_uid = `mid_${new Date().getTime()}`,
        name,
        amount,
        buyer_email,
        buyer_name,
        buyer_tel,
        buyer_addr,
        buyer_postcode
      } = data;

      window.IMP.request_pay({
        pg,
        pay_method,
        merchant_uid,
        name,
        amount,
        buyer_email,
        buyer_name,
        buyer_tel,
        buyer_addr,
        buyer_postcode
      }, (rsp) => {
        if (rsp.success) {
          resolve(rsp);
        } else {
          reject(new Error(`결제 실패: ${rsp.error_msg}`));
        }
      });
    });
  }
};

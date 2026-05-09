/**
 * 외부 알림 서비스 (텔레그램 등) 연동을 담당합니다.
 */
export const notificationService = {
  /**
   * 새로운 주문이 발생했을 때 관리자에게 텔레그램 메시지를 전송합니다.
   */
  sendOrderNotification: async (orderData, config) => {
    const { token, chatId } = config.telegramConfig || {};
    if (!token || !chatId) return;

    const message = [
      '🔔 *새로운 주문이 도착했습니다!*',
      '--------------------------------',
      `👤 *주문자:* ${orderData.name}`,
      `📞 *연락처:* ${orderData.phone}`,
      `📦 *상품명:* ${orderData.product_name} (${orderData.quantity}개)`,
      `✨ *선택옵션:* ${orderData.selectedOption || '없음'}`,
      `💰 *결제금액:* ${(orderData.price * orderData.quantity).toLocaleString()}원`,
      `🏠 *배송주소:* ${orderData.address}`,
      `📝 *요청사항:* ${orderData.requests || '없음'}`,
      '--------------------------------',
      '✅ 관리자 페이지에서 입금 확인 후 처리를 진행해 주세요!'
    ].join('\n');

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        console.error('텔레그램 알림 전송 실패:', await response.text());
      }
    } catch (error) {
      console.error('텔레그램 알림 전송 중 오류 발생:', error);
    }
  }
};

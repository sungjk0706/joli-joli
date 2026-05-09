-- 결제 수단 필드 추가
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'bank_transfer';

-- 결제 수단 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

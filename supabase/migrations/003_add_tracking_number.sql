-- 송장 번호 필드 추가
ALTER TABLE orders ADD COLUMN tracking_number TEXT;

-- 배송사 필드 추가
ALTER TABLE orders ADD COLUMN carrier TEXT;

-- 배송 상태 확장 (배송완료 추가)
-- 기존 상태: 미입금, 입금완료, 배송중
-- 추가 상태: 배송완료

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

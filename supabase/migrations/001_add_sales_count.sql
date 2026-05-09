-- 판매량 필드 추가
ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);

-- 기존 주문 데이터로 판매량 초기화
UPDATE products p
SET sales_count = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM orders
  WHERE orders.product_id = p.id
  AND orders.status IN ('입금완료', '배송중', '배송완료')
);

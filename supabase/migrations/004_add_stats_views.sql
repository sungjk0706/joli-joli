-- orders 테이블에 price 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price INTEGER;

-- 일별 매출 통계 뷰
CREATE OR REPLACE VIEW daily_sales_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(price * quantity) as total_sales,
  SUM(quantity) as total_items
FROM orders
WHERE status IN ('입금완료', '배송중', '배송완료')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 월별 매출 통계 뷰
CREATE OR REPLACE VIEW monthly_sales_stats AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as order_count,
  SUM(price * quantity) as total_sales,
  SUM(quantity) as total_items
FROM orders
WHERE status IN ('입금완료', '배송중', '배송완료')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 인기 상품 순위 뷰
CREATE OR REPLACE VIEW popular_products AS
SELECT
  p.id,
  p.name,
  p.price,
  p.image_url,
  COALESCE(SUM(o.quantity), 0) as total_sold,
  COALESCE(SUM(o.price * o.quantity), 0) as total_revenue
FROM products p
LEFT JOIN orders o ON p.id = o.product_id AND o.status IN ('입금완료', '배송중', '배송완료')
GROUP BY p.id, p.name, p.price, p.image_url
ORDER BY total_sold DESC;

-- 고객 분석 뷰
CREATE OR REPLACE VIEW customer_stats AS
SELECT
  customer_phone,
  customer_name,
  COUNT(*) as order_count,
  SUM(price * quantity) as total_spent,
  MAX(created_at) as last_order_date
FROM orders
WHERE status IN ('입금완료', '배송중', '배송완료')
GROUP BY customer_phone, customer_name
ORDER BY total_spent DESC;

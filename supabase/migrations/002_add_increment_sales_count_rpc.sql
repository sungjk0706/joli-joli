-- 판매량 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_sales_count(product_id INTEGER, quantity INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET sales_count = sales_count + quantity
  WHERE id = product_id;
END;
$$;

-- 판매량 감소 RPC 함수 (주문 취소 시 사용)
CREATE OR REPLACE FUNCTION decrement_sales_count(product_id INTEGER, quantity INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET sales_count = GREATEST(0, sales_count - quantity)
  WHERE id = product_id;
END;
$$;

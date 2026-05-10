-- place_order: 재고 차감 + 주문 생성을 원자적으로 처리하는 트랜잭션 RPC
CREATE OR REPLACE FUNCTION place_order(
  p_customer_name    TEXT,
  p_customer_phone   TEXT,
  p_address          TEXT,
  p_detail_address   TEXT,
  p_zonecode         TEXT,
  p_product_id       INTEGER,
  p_product_name     TEXT,
  p_price            INTEGER,
  p_options          TEXT,
  p_payment_method   TEXT,
  p_quantity         INTEGER,
  p_selected_option  TEXT,
  p_deposit_name     TEXT,
  p_requests         TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id INTEGER;
  v_stock    INTEGER;
BEGIN
  -- 재고 확인 (FOR UPDATE로 행 잠금)
  SELECT stock INTO v_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF v_stock IS NOT NULL AND v_stock < p_quantity THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  -- 재고 차감 (stock 컬럼이 있는 경우에만)
  IF v_stock IS NOT NULL THEN
    UPDATE products
    SET stock = stock - p_quantity
    WHERE id = p_product_id;
  END IF;

  -- 주문 생성
  INSERT INTO orders (
    customer_name,
    customer_phone,
    address,
    detail_address,
    zonecode,
    product_id,
    product_name,
    price,
    options,
    payment_method,
    quantity,
    selected_option,
    deposit_name,
    requests,
    status,
    created_at
  ) VALUES (
    p_customer_name,
    p_customer_phone,
    p_address,
    p_detail_address,
    p_zonecode,
    p_product_id,
    p_product_name,
    p_price,
    p_options,
    p_payment_method,
    p_quantity,
    p_selected_option,
    p_deposit_name,
    p_requests,
    '미입금',
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- 판매량 증가
  UPDATE products
  SET sales_count = sales_count + p_quantity
  WHERE id = p_product_id;

  RETURN v_order_id;
END;
$$;

-- decrement_stock: 재고 차감 RPC (단독 호출용)
CREATE OR REPLACE FUNCTION decrement_stock(product_id INTEGER, quantity INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  SELECT stock INTO v_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;

  IF v_stock IS NOT NULL AND v_stock < quantity THEN
    RAISE EXCEPTION 'OUT_OF_STOCK';
  END IF;

  IF v_stock IS NOT NULL THEN
    UPDATE products
    SET stock = stock - quantity
    WHERE id = product_id;
  END IF;
END;
$$;

-- ============================================================
-- MONKEY LARANJA — PATCH 10: nome + CPF do comprador no pedido
-- Rode INTEIRO no SQL Editor do Supabase (depois do 09).
-- ------------------------------------------------------------
-- O checkout deixou de pedir e-mail e passou a pedir nome
-- completo + CPF. Este patch:
--   1. adiciona as colunas buyer_name / buyer_cpf em orders;
--   2. order_place passa a gravá-las (vindas do p_order);
--   3. orders_seller deixa de devolver o CPF ao vendedor.
-- O CPF fica visível apenas para o comprador (orders_mine).
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_name TEXT,
  ADD COLUMN IF NOT EXISTS buyer_cpf  TEXT;

-- ── order_place v2: grava nome e CPF (só dígitos) ────────────
CREATE OR REPLACE FUNCTION public.order_place(p_token TEXT, p_order JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_require_username(p_token);
  v_id TEXT := coalesce(p_order->>'id', 'ord' || replace(gen_random_uuid()::text, '-', ''));
  v_row JSONB;
BEGIN
  IF coalesce(p_order->'items', '[]'::jsonb) = '[]'::jsonb THEN
    RAISE EXCEPTION 'ORDER_EMPTY';
  END IF;

  INSERT INTO public.orders (
    id, code, date, buyer, buyer_name, buyer_cpf, items, subtotal, discount,
    total, payment_method, status, demo, gateway
  )
  VALUES (
    v_id,
    coalesce(p_order->>'code', 'ML-' || (floor(random() * 900000 + 100000))::int::text),
    coalesce((p_order->>'date')::timestamptz, NOW()),
    v_user,
    nullif(btrim(coalesce(p_order->>'buyerName', '')), ''),
    nullif(regexp_replace(coalesce(p_order->>'buyerCpf', ''), '\D', '', 'g'), ''),
    p_order->'items',
    coalesce((p_order->>'subtotal')::numeric, 0),
    coalesce((p_order->>'discount')::numeric, 0),
    coalesce((p_order->>'total')::numeric, 0),
    coalesce(p_order->>'paymentMethod', ''),
    'PAGO',
    coalesce((p_order->>'demo')::boolean, false),
    coalesce(p_order->>'gateway', 'mock')
  );

  SELECT to_jsonb(o) INTO v_row FROM public.orders o WHERE o.id = v_id;
  RETURN v_row;
END
$$;

-- ── orders_seller v2: nunca devolve o CPF do comprador ───────
CREATE OR REPLACE FUNCTION public.orders_seller(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg((to_jsonb(o) - 'buyer_cpf') ORDER BY o.date DESC), '[]'::jsonb)
    FROM public.orders o
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) AS item
      JOIN public.products p ON p.id = item->>'productId'
      WHERE p.seller_username = v_user
    )
  );
END
$$;

GRANT EXECUTE ON FUNCTION public.order_place(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.orders_seller(text) TO anon, authenticated;

-- ── CHECAGEM ────────────────────────────────────────────────
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('buyer_name', 'buyer_cpf')
ORDER BY column_name;

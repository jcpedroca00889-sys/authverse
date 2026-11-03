-- ============================================================
-- MONKEY LARANJA — Função para seed de produtos demo
-- Bypassa RLS com SECURITY DEFINER (seguro).
-- Rode no SQL Editor e depois recarregue o app.
-- ============================================================

CREATE OR REPLACE FUNCTION public.seed_demo_products(products JSONB)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.products WHERE demo = true LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.products (id, title, game, category, price, old_price, delivery, description, details, reviews, seller_username, rating, rating_count, sales_count, created_at, status, stock, emoji, art, tags, demo, featured, variants)
  SELECT *
  FROM jsonb_to_recordset(products) AS x(
    id text, title text, game text, category text, price numeric, old_price numeric,
    delivery text, description text, details jsonb, reviews jsonb, seller_username text,
    rating numeric, rating_count int, sales_count int, created_at timestamptz,
    status text, stock int, emoji text, art int, tags jsonb, demo bool, featured bool, variants jsonb
  );
END;
$$;

-- Permite que qualquer role (anon, authenticated) chame a função
GRANT EXECUTE ON FUNCTION public.seed_demo_products TO anon, authenticated;
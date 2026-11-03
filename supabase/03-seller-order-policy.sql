-- ============================================================
-- MONKEY LARANJA — Política extra para vendedores verem pedidos
-- Rode no SQL Editor se já executou o 01-setup.sql
-- ============================================================

-- Permite que um vendedor veja pedidos que contenham seus produtos
CREATE POLICY "orders_select_seller" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
      WHERE item->>'productId' IN (
        SELECT id FROM public.products
        WHERE seller_username = (auth.jwt() -> 'user_metadata' ->> 'username')
      )
    )
  );
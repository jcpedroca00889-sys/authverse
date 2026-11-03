-- ============================================================
-- MONKEY LARANJA — Permite inserir produtos demo (seed)
-- Rode APÓS o 01-setup.sql, ANTES de recarregar o app.
-- ============================================================
CREATE POLICY "products_insert_demo" ON public.products
  FOR INSERT TO anon
  WITH CHECK (demo = true);
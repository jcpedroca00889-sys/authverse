-- ============================================================
-- MONKEY LARANJA — Permite inserir produtos demo para logados
-- Rode no SQL Editor, DEPOIS do 05-allow-demo-insert.sql
-- ============================================================
-- Quando o usuário está logado, a role é 'authenticated'.
-- Precisamos de uma política específica pra esse caso.
CREATE POLICY "products_insert_demo_auth" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (demo = true);
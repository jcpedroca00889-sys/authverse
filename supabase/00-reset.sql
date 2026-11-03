-- ============================================================
-- MONKEY LARANJA — RESET TOTAL
-- ⚠️ APAGA TODAS as tabelas e dados criados por este projeto.
-- Rode no SQL Editor do Supabase.
-- ============================================================

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.app_sessions CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;

-- (opcional) remove funções/triggers auxiliares, se existirem
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.app_username(text) CASCADE;
DROP FUNCTION IF EXISTS public.app_require_username(text) CASCADE;
DROP FUNCTION IF EXISTS public.app_register(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.app_login(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.app_logout(text) CASCADE;
DROP FUNCTION IF EXISTS public.app_me(text) CASCADE;
DROP FUNCTION IF EXISTS public.orders_mine(text) CASCADE;
DROP FUNCTION IF EXISTS public.orders_seller(text) CASCADE;
DROP FUNCTION IF EXISTS public.order_place(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.favorites_list(text) CASCADE;
DROP FUNCTION IF EXISTS public.favorite_add(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.favorite_remove(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.wallet_get(text) CASCADE;
DROP FUNCTION IF EXISTS public.wallet_add(text, numeric, text) CASCADE;
DROP FUNCTION IF EXISTS public.wallet_spend(text, numeric, text) CASCADE;
DROP FUNCTION IF EXISTS public.listing_create(text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.listing_update(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.listing_delete(text, text) CASCADE;

-- Resultado esperado: "Success. No rows returned"
-- Obs.: usuários criados no Auth (auth.users) NÃO são removidos aqui.
-- Para apagá-los: Dashboard → Authentication → Users → Delete.

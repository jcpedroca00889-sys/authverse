-- ============================================================
-- MONKEY LARANJA — AUTENTICAÇÃO POR TABELA (substitui o Supabase Auth)
-- Rode INTEIRO no SQL Editor do Supabase. Requer o 01-setup.sql aplicado.
-- ------------------------------------------------------------
-- O que este script faz:
--   1. Cria app_users (senha com bcrypt/pgcrypto) e app_sessions (token);
--   2. Cria RPCs SECURITY DEFINER p/ registrar, logar, deslogar e validar;
--   3. Cria RPCs para TODAS as operações que dependiam do Supabase Auth
--      (pedidos, favoritos, carteira, anúncios) — o token é passado
--      como parâmetro, sem header customizado (imune a CORS);
--   4. Remove as 14 policies antigas baseadas em auth.jwt() e nega
--      qualquer escrita direta do anon/authenticated.
-- ============================================================

-- Extensão de hash (bcrypt). No Supabase fica no schema `extensions`.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. USUÁRIOS E SESSÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,           -- bcrypt, só o Postgres conhece
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Username único sem diferenciar maiúsculas
CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_lower_key
  ON public.app_users (lower(username));

CREATE TABLE IF NOT EXISTS public.app_sessions (
  token TEXT PRIMARY KEY,                -- token opaco (uuid v4)
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON public.app_sessions (user_id);
CREATE INDEX IF NOT EXISTS app_sessions_username_idx ON public.app_sessions (username);

-- Ninguém lê/escreve direto (nem o hash de senha): só via RPC SECURITY DEFINER
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_users, public.app_sessions FROM anon, authenticated;

-- ============================================================
-- 2. HELPERS DE SESSÃO
-- ============================================================

-- Retorna o username dono do token (ou NULL se inválido/expirado)
CREATE OR REPLACE FUNCTION public.app_username(p_token TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
  SELECT s.username
  FROM public.app_sessions s
  WHERE s.token = nullif(btrim(coalesce(p_token, '')), '')
    AND s.expires_at > NOW()
  LIMIT 1
$$;

-- Version "exigente": levanta erro se o token não for válido
CREATE OR REPLACE FUNCTION public.app_require_username(p_token TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_username(p_token);
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  RETURN v_user;
END
$$;

-- Helpers internos: não precisam ser chamados pelo front
REVOKE ALL ON FUNCTION public.app_username(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.app_require_username(text) FROM PUBLIC;

-- ============================================================
-- 3. AUTENTICAÇÃO (RPCs públicas)
-- ============================================================

-- Registro: cria usuário + sessão. Nada de email, nada de rate limit de SMTP.
CREATE OR REPLACE FUNCTION public.app_register(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_username TEXT := btrim(coalesce(p_username, ''));
  v_token TEXT := gen_random_uuid()::text;
  v_id UUID;
BEGIN
  IF length(v_username) < 3 OR length(v_username) > 24 THEN
    RAISE EXCEPTION 'USERNAME_INVALID';
  END IF;
  IF v_username !~ '^[A-Za-z0-9_.-]+$' THEN
    RAISE EXCEPTION 'USERNAME_INVALID';
  END IF;
  IF length(coalesce(p_password, '')) < 6 THEN
    RAISE EXCEPTION 'PASSWORD_TOO_SHORT';
  END IF;
  IF EXISTS (SELECT 1 FROM public.app_users u WHERE lower(u.username) = lower(v_username)) THEN
    RAISE EXCEPTION 'USERNAME_TAKEN';
  END IF;

  INSERT INTO public.app_users (username, display_name, password_hash, last_login_at)
  VALUES (v_username, v_username, crypt(p_password, gen_salt('bf', 10)), NOW())
  RETURNING id INTO v_id;

  INSERT INTO public.app_sessions (token, user_id, username)
  VALUES (v_token, v_id, v_username);

  RETURN jsonb_build_object('token', v_token, 'username', v_username);
END
$$;

-- Login: valida senha com bcrypt e cria sessão
CREATE OR REPLACE FUNCTION public.app_login(p_username TEXT, p_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user public.app_users;
  v_token TEXT := gen_random_uuid()::text;
  v_uname TEXT := btrim(coalesce(p_username, ''));
BEGIN
  SELECT * INTO v_user
  FROM public.app_users u
  WHERE lower(u.username) = lower(v_uname)
  LIMIT 1;

  IF v_user.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;

  -- Bloqueio temporário após tentativas seguidas
  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > NOW() THEN
    RAISE EXCEPTION 'TOO_MANY_ATTEMPTS';
  END IF;

  IF v_user.password_hash <> crypt(coalesce(p_password, ''), v_user.password_hash) THEN
    UPDATE public.app_users
       SET failed_attempts = v_user.failed_attempts + 1,
           locked_until = CASE WHEN v_user.failed_attempts + 1 >= 5
                               THEN NOW() + INTERVAL '2 minutes' ELSE NULL END
     WHERE id = v_user.id;
    RAISE EXCEPTION 'INVALID_CREDENTIALS';
  END IF;

  UPDATE public.app_users
     SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW()
   WHERE id = v_user.id;

  -- Limpeza simples de sessões vencidas
  DELETE FROM public.app_sessions WHERE expires_at < NOW();

  INSERT INTO public.app_sessions (token, user_id, username)
  VALUES (v_token, v_user.id, v_user.username);

  RETURN jsonb_build_object('token', v_token, 'username', v_user.username);
END
$$;

-- Logout: mata a sessão do token
CREATE OR REPLACE FUNCTION public.app_logout(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  DELETE FROM public.app_sessions WHERE token = btrim(coalesce(p_token, ''));
  RETURN TRUE;
END
$$;

-- Valida a sessão do token (usado na inicialização do app)
CREATE OR REPLACE FUNCTION public.app_me(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_username(p_token);
BEGIN
  IF v_user IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object('username', v_user);
END
$$;

GRANT EXECUTE ON FUNCTION public.app_register(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_logout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_me(text) TO anon, authenticated;

-- ============================================================
-- 4. RPCs DE NEGÓCIO (tudo que antes dependia do Supabase Auth)
-- ============================================================

-- ── PEDIDOS ─────────────────────────────────────────────────

-- Lista pedidos do comprador logado
CREATE OR REPLACE FUNCTION public.orders_mine(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY o.date DESC), '[]'::jsonb)
    FROM public.orders o
    WHERE o.buyer = v_user
  );
END
$$;

-- Lista pedidos que contêm anúncios do vendedor logado
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
    SELECT coalesce(jsonb_agg(to_jsonb(o) ORDER BY o.date DESC), '[]'::jsonb)
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

-- Cria pedido (comprador = usuário do token)
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

  INSERT INTO public.orders (id, code, date, buyer, items, subtotal, discount, total, payment_method, status, demo, gateway)
  VALUES (
    v_id,
    coalesce(p_order->>'code', 'ML-' || (floor(random() * 900000 + 100000))::int::text),
    coalesce((p_order->>'date')::timestamptz, NOW()),
    v_user,
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

-- ── FAVORITOS ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.favorites_list(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(product_id ORDER BY created_at DESC), '[]'::jsonb)
    FROM public.favorites
    WHERE username = v_user
  );
END
$$;

CREATE OR REPLACE FUNCTION public.favorite_add(p_token TEXT, p_product_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  INSERT INTO public.favorites (username, product_id)
  VALUES (v_user, p_product_id)
  ON CONFLICT (username, product_id) DO NOTHING;
  RETURN TRUE;
END
$$;

CREATE OR REPLACE FUNCTION public.favorite_remove(p_token TEXT, p_product_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  DELETE FROM public.favorites
  WHERE username = v_user AND product_id = p_product_id;
  RETURN TRUE;
END
$$;

-- ── CARTEIRA ────────────────────────────────────────────────

-- Saldo + extrato (cria carteira com bônus de boas-vindas na primeira visita)
CREATE OR REPLACE FUNCTION public.wallet_get(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  INSERT INTO public.wallets (username, balance, updated_at)
  VALUES (v_user, 150, NOW())
  ON CONFLICT (username) DO NOTHING;

  IF FOUND THEN
    INSERT INTO public.wallet_transactions (id, username, type, amount, description, date, method, demo)
    VALUES ('txn' || replace(gen_random_uuid()::text, '-', ''), v_user, 'credit', 150,
            '🎉 Bônus de boas-vindas', NOW(), 'Bônus', false);
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'balance', w.balance,
      'transactions', (
        SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.date DESC), '[]'::jsonb)
        FROM public.wallet_transactions t
        WHERE t.username = v_user
      )
    )
    FROM public.wallets w
    WHERE w.username = v_user
  );
END
$$;

-- Depósito
CREATE OR REPLACE FUNCTION public.wallet_add(p_token TEXT, p_amount DECIMAL, p_method TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  IF coalesce(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT';
  END IF;

  INSERT INTO public.wallets (username, balance, updated_at)
  VALUES (v_user, 0, NOW())
  ON CONFLICT (username) DO NOTHING;

  UPDATE public.wallets
     SET balance = balance + p_amount, updated_at = NOW()
   WHERE username = v_user;

  INSERT INTO public.wallet_transactions (id, username, type, amount, description, date, method, demo)
  VALUES ('txn' || replace(gen_random_uuid()::text, '-', ''), v_user, 'credit', p_amount,
          'Depósito via ' || coalesce(p_method, ''), NOW(), coalesce(p_method, ''), false);

  RETURN public.wallet_get(p_token);
END
$$;

-- Gasto — retorna NULL se saldo insuficiente
CREATE OR REPLACE FUNCTION public.wallet_spend(p_token TEXT, p_amount DECIMAL, p_description TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_require_username(p_token);
  v_balance DECIMAL;
BEGIN
  IF coalesce(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT';
  END IF;

  UPDATE public.wallets
     SET balance = balance - p_amount, updated_at = NOW()
   WHERE username = v_user AND balance >= p_amount
   RETURNING balance INTO v_balance;

  IF NOT FOUND THEN
    RETURN NULL; -- saldo insuficiente
  END IF;

  INSERT INTO public.wallet_transactions (id, username, type, amount, description, date, method, demo)
  VALUES ('txn' || replace(gen_random_uuid()::text, '-', ''), v_user, 'debit', p_amount,
          coalesce(p_description, 'Compra'), NOW(), 'Compra', false);

  RETURN public.wallet_get(p_token);
END
$$;

-- ── ANÚNCIOS (products) ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.listing_create(p_token TEXT, p_product JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_require_username(p_token);
  v_id TEXT := coalesce(p_product->>'id', 'u' || replace(gen_random_uuid()::text, '-', ''));
BEGIN
  IF p_product->>'title' IS NULL OR p_product->>'price' IS NULL THEN
    RAISE EXCEPTION 'INVALID_PRODUCT';
  END IF;

  INSERT INTO public.products (
    id, title, game, category, price, old_price, delivery, description,
    details, reviews, seller_username, rating, rating_count, sales_count,
    created_at, status, stock, emoji, art, tags, demo, featured, variants
  ) VALUES (
    v_id,
    p_product->>'title',
    p_product->>'game',
    p_product->>'category',
    (p_product->>'price')::numeric,
    nullif(p_product->>'oldPrice', '')::numeric,
    coalesce(p_product->>'delivery', 'automatic'),
    coalesce(p_product->>'description', ''),
    '[]'::jsonb,
    '[]'::jsonb,
    v_user,
    0, 0, 0,
    NOW(),
    'available',
    coalesce((p_product->>'stock')::int, 1),
    coalesce(p_product->>'emoji', '🎁'),
    coalesce((p_product->>'art')::int, 0),
    coalesce(p_product->'tags', '[]'::jsonb),
    false, false, '[]'::jsonb
  );

  RETURN (SELECT to_jsonb(p) FROM public.products p WHERE p.id = v_id);
END
$$;

CREATE OR REPLACE FUNCTION public.listing_update(p_token TEXT, p_id TEXT, p_patch JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_require_username(p_token);
  v_row JSONB;
BEGIN
  UPDATE public.products p
     SET title        = coalesce(p_patch->>'title', p.title),
         game         = coalesce(p_patch->>'game', p.game),
         category     = coalesce(p_patch->>'category', p.category),
         price        = coalesce((p_patch->>'price')::numeric, p.price),
         old_price    = CASE WHEN p_patch ? 'oldPrice' THEN nullif(p_patch->>'oldPrice', '')::numeric ELSE p.old_price END,
         stock        = coalesce((p_patch->>'stock')::int, p.stock),
         delivery     = coalesce(p_patch->>'delivery', p.delivery),
         description  = coalesce(p_patch->>'description', p.description),
         emoji        = coalesce(p_patch->>'emoji', p.emoji),
         art          = coalesce((p_patch->>'art')::int, p.art),
         status       = coalesce(p_patch->>'status', p.status)
   WHERE p.id = p_id AND p.seller_username = v_user
   RETURNING to_jsonb(p) INTO v_row;

  RETURN v_row; -- NULL se não found (não é dono ou não existe)
END
$$;

CREATE OR REPLACE FUNCTION public.listing_delete(p_token TEXT, p_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE v_user TEXT := public.app_require_username(p_token);
BEGIN
  DELETE FROM public.products
  WHERE id = p_id AND seller_username = v_user;
  RETURN FOUND;
END
$$;

GRANT EXECUTE ON FUNCTION public.orders_mine(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.orders_seller(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.order_place(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.favorites_list(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.favorite_add(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.favorite_remove(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_get(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_add(text, numeric, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_spend(text, numeric, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listing_create(text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listing_update(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listing_delete(text, text) TO anon, authenticated;

-- ============================================================
-- 5. RLS — remove as policies antigas do Supabase Auth
-- ============================================================
-- Leitura pública (catálogo) continua; TODA escrita direta é negada:
-- o único caminho é pelas RPCs SECURITY DEFINER acima.
-- (Se as policies não existirem ainda, o IF EXISTS evita erro.)

DROP POLICY IF EXISTS "products_insert_auth"   ON public.products;
DROP POLICY IF EXISTS "products_update_own"    ON public.products;
DROP POLICY IF EXISTS "products_delete_own"    ON public.products;
DROP POLICY IF EXISTS "products_insert_demo"   ON public.products;
DROP POLICY IF EXISTS "products_insert_demo_auth" ON public.products;
DROP POLICY IF EXISTS "sellers_insert_self"    ON public.sellers;
DROP POLICY IF EXISTS "sellers_update_self"    ON public.sellers;
DROP POLICY IF EXISTS "orders_select_own"      ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"      ON public.orders;
DROP POLICY IF EXISTS "orders_update_own"      ON public.orders;
DROP POLICY IF EXISTS "orders_select_seller"   ON public.orders;
DROP POLICY IF EXISTS "wallets_all_own"        ON public.wallets;
DROP POLICY IF EXISTS "wallet_tx_all_own"      ON public.wallet_transactions;
DROP POLICY IF EXISTS "favorites_all_own"      ON public.favorites;
DROP POLICY IF EXISTS "reviews_insert_auth"    ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own"     ON public.reviews;

-- Reforço de privilégios: anon/authenticated só leem catálogo
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.sellers FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.wallets FROM anon, authenticated;
REVOKE ALL ON public.wallet_transactions FROM anon, authenticated;
REVOKE ALL ON public.favorites FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviews FROM anon, authenticated;

GRANT SELECT ON public.products, public.sellers, public.reviews TO anon, authenticated;

-- As antigas credit_wallet/debit_wallet ficam sem execute público:
-- por segurança, crédito/débito passam a exigir token.
REVOKE EXECUTE ON FUNCTION public.credit_wallet(text, numeric) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.debit_wallet(text, numeric) FROM anon, authenticated;

-- ============================================================
-- 6. CHECAGEM
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('app_users', 'app_sessions')
ORDER BY table_name;
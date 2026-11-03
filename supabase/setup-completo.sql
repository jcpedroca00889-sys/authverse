-- ============================================================
-- MONKEY LARANJA — SETUP COMPLETO (TUDO EM UM) 🍌
-- ------------------------------------------------------------
-- ⚠️ Rode INTEIRO no SQL Editor do Supabase (Dashboard → SQL Editor)
--
-- ✅ IDEMPOTENTE: pode rodar quantas vezes quiser, não quebra.
-- ✅ Substitui TODOS os arquivos anteriores (01 a 10):
--    01-setup.sql · 02-functions.sql · 03 · 04 · 05 · 06 · 07
--    08-app-users.sql · 09-table-auth-fixes.sql · 10-order-buyer-fields.sql
--
-- O que este script cria:
--   1. Tabelas completas (products, sellers, orders, wallets,
--      wallet_transactions, favorites, reviews, app_users, app_sessions)
--   2. Sistema de autenticação por tabela (app_register, app_login,
--      app_logout, app_me, app_change_password) — sem Supabase Auth,
--      sem email, sem rate limit de SMTP; senha com bcrypt (pgcrypto)
--   3. RPCs de negócio (pedidos, favoritos, carteira, anúncios) —
--      token passado como parâmetro, imune a CORS
--   4. RLS: leitura pública do catálogo; TODA escrita direta negada —
--      só via RPCs SECURITY DEFINER
--   5. Seed dos vendedores demo (idempotente)
-- ============================================================

-- Extensão de hash (bcrypt). No Supabase fica no schema extensions.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  delivery TEXT NOT NULL DEFAULT 'automatic',
  description TEXT DEFAULT '',
  details JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb,
  seller_username TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'available',
  stock INTEGER DEFAULT 1,
  emoji TEXT DEFAULT '🎁',
  art INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  demo BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  variants JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.sellers (
  username TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  member_since DATE DEFAULT CURRENT_DATE,
  response_time TEXT DEFAULT '~15 min',
  description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  buyer TEXT NOT NULL,
  buyer_name TEXT,
  buyer_cpf TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT '',
  status TEXT DEFAULT 'PENDENTE',
  demo BOOLEAN DEFAULT false,
  gateway TEXT DEFAULT 'mock'
);

CREATE TABLE IF NOT EXISTS public.wallets (
  username TEXT PRIMARY KEY,
  balance DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT '',
  demo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.favorites (
  username TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (username, product_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Autenticação por tabela (substitui o Supabase Auth)
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

-- ============================================================
-- 2. COLUNAS EXTRA (compat com patches antigos)
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_cpf TEXT;

-- ============================================================
-- 3. ÍNDICES (performance nas buscas do catálogo)
-- ============================================================

CREATE INDEX IF NOT EXISTS products_game_idx ON public.products (game);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_seller_idx ON public.products (seller_username);
CREATE INDEX IF NOT EXISTS products_created_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON public.orders (buyer);
CREATE INDEX IF NOT EXISTS wallet_tx_username_idx ON public.wallet_transactions (username);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON public.app_sessions (user_id);
CREATE INDEX IF NOT EXISTS app_sessions_username_idx ON public.app_sessions (username);

-- ============================================================
-- 4. RLS (habilitar sempre; policies recriadas adiante)
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;

-- Ninguém lê/escreve app_users/app_sessions direto (nem o hash):
-- só via RPC SECURITY DEFINER.
REVOKE ALL ON public.app_users, public.app_sessions FROM anon, authenticated;

-- ============================================================
-- 5. HELPERS DE AUTENTICAÇÃO
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

-- Versão "exigente": levanta erro se o token não for válido
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
-- 6. AUTENTICAÇÃO (RPCs públicas)
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

-- Valida a sessão e devolve o perfil completo (v2 do patch 09)
CREATE OR REPLACE FUNCTION public.app_me(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_username(p_token);
  v_row  public.app_users;
BEGIN
  IF v_user IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row FROM public.app_users u WHERE u.username = v_user;

  RETURN jsonb_build_object(
    'username',      v_row.username,
    'display_name',  v_row.display_name,
    'created_at',    v_row.created_at,
    'last_login_at', v_row.last_login_at
  );
END
$$;

-- Troca de senha validando a atual (bcrypt) e invalidando outras sessões
CREATE OR REPLACE FUNCTION public.app_change_password(p_token TEXT, p_current TEXT, p_new TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_user TEXT := public.app_require_username(p_token);
  v_row  public.app_users;
BEGIN
  SELECT * INTO v_row FROM public.app_users u WHERE u.username = v_user;

  -- Valida a senha atual antes de trocar
  IF v_row.password_hash <> crypt(coalesce(p_current, ''), v_row.password_hash) THEN
    RAISE EXCEPTION 'WRONG_PASSWORD';
  END IF;

  IF length(coalesce(p_new, '')) < 6 THEN
    RAISE EXCEPTION 'PASSWORD_TOO_SHORT';
  END IF;

  UPDATE public.app_users
     SET password_hash = crypt(p_new, gen_salt('bf', 10))
   WHERE id = v_row.id;

  -- Invalida as outras sessões (mantém a atual)
  DELETE FROM public.app_sessions
   WHERE user_id = v_row.id
     AND token <> btrim(coalesce(p_token, ''));

  RETURN TRUE;
END
$$;

GRANT EXECUTE ON FUNCTION public.app_register(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_logout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_me(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_change_password(text, text, text) TO anon, authenticated;

-- ============================================================
-- 7. RPCs DE NEGÓCIO (pedidos, favoritos, carteira, anúncios)
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

-- Lista pedidos do vendedor — SEM o CPF do comprador (v2 do patch 10)
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

-- Cria pedido — grava nome + CPF do comprador (v2 do patch 10)
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
-- 8. SEED DE PRODUTOS DEMO (RPC SECURITY DEFINER — bypassa RLS)
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

-- Funções auxiliares de carteira (mantidas para compat; sem execute público)
CREATE OR REPLACE FUNCTION public.credit_wallet(
  p_username TEXT,
  p_amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE sql
AS $$
  INSERT INTO public.wallets (username, balance, updated_at)
  VALUES (p_username, p_amount, NOW())
  ON CONFLICT (username)
  DO UPDATE SET balance = wallets.balance + p_amount, updated_at = NOW()
  RETURNING balance;
$$;

CREATE OR REPLACE FUNCTION public.debit_wallet(
  p_username TEXT,
  p_amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE sql
AS $$
  UPDATE public.wallets
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE username = p_username AND balance >= p_amount
  RETURNING balance;
$$;

-- As antigas credit_wallet/debit_wallet ficam sem execute público:
-- por segurança, crédito/débito passam a exigir token.
REVOKE EXECUTE ON FUNCTION public.credit_wallet(text, numeric) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.debit_wallet(text, numeric) FROM anon, authenticated;

-- ============================================================
-- 9. RLS — POLICIES FINAIS
-- ------------------------------------------------------------
-- Leitura pública do catálogo (products, sellers, reviews);
-- TODA escrita direta é negada — o único caminho são as RPCs
-- SECURITY DEFINER definidas acima.
-- ============================================================

-- ── Remove policies antigas (idempotente) ──────────────────
DROP POLICY IF EXISTS "products_insert_auth"        ON public.products;
DROP POLICY IF EXISTS "products_update_own"         ON public.products;
DROP POLICY IF EXISTS "products_delete_own"         ON public.products;
DROP POLICY IF EXISTS "products_insert_demo"        ON public.products;
DROP POLICY IF EXISTS "products_insert_demo_auth"   ON public.products;
DROP POLICY IF EXISTS "sellers_insert_self"         ON public.sellers;
DROP POLICY IF EXISTS "sellers_update_self"         ON public.sellers;
DROP POLICY IF EXISTS "orders_select_own"           ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"           ON public.orders;
DROP POLICY IF EXISTS "orders_update_own"           ON public.orders;
DROP POLICY IF EXISTS "orders_select_seller"        ON public.orders;
DROP POLICY IF EXISTS "wallets_all_own"             ON public.wallets;
DROP POLICY IF EXISTS "wallet_tx_all_own"           ON public.wallet_transactions;
DROP POLICY IF EXISTS "favorites_all_own"           ON public.favorites;
DROP POLICY IF EXISTS "reviews_insert_auth"         ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own"          ON public.reviews;

-- ── Remove e recria as de leitura (idempotente) ─────────────
DROP POLICY IF EXISTS "products_select_all"   ON public.products;
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sellers_select_all"  ON public.sellers;
CREATE POLICY "sellers_select_all" ON public.sellers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_select_all"  ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

-- ── Reforço de privilégios: anon/authenticated só leem ──────
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.sellers FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.wallets FROM anon, authenticated;
REVOKE ALL ON public.wallet_transactions FROM anon, authenticated;
REVOKE ALL ON public.favorites FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviews FROM anon, authenticated;

GRANT SELECT ON public.products, public.sellers, public.reviews TO anon, authenticated;

-- ============================================================
-- 10. SEED — VENDEDORES DEMO (idempotente)
-- ============================================================

INSERT INTO public.sellers
  (username, display_name, verified, rating, rating_count, sales_count, member_since, response_time, description, tags)
VALUES
  ('NeoZed_Gaming', 'NeoZed Gaming', true, 5.0, 1284, 9120, '2023-02-14', '~5 min',
   'Loja focada em contas e itens de Roblox e Free Fire com entrega automática 24h.',
   '["Entrega automática","Suporte ágil"]'::jsonb),
  ('BananaPro', 'Banana Pro', true, 4.9, 862, 6350, '2022-11-03', '~10 min',
   'O especialista em Blox Fruits e Grow a Garden. Frutas, pets e moedas com garantia.',
   '["Garantia 7 dias","Verificado"]'::jsonb),
  ('ML_Oficial', 'Monkey Laranja Oficial', true, 5.0, 3421, 18400, '2022-08-01', '~3 min',
   'Loja oficial da MONKEY LARANJA. Créditos, moedas e itens com garantia total.',
   '["Oficial","Verificado","Garantia"]'::jsonb)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 11. CHECAGEM FINAL (deve listar as tabelas e RPCs)
-- ============================================================

SELECT 'tabelas' AS tipo, table_name AS nome
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products','sellers','orders','wallets','wallet_transactions',
                     'favorites','reviews','app_users','app_sessions')
UNION ALL
SELECT 'rpc', proname
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('app_register','app_login','app_logout','app_me','app_change_password',
                    'orders_mine','orders_seller','order_place','favorites_list','favorite_add',
                    'favorite_remove','wallet_get','wallet_add','wallet_spend','listing_create',
                    'listing_update','listing_delete','seed_demo_products')
UNION ALL
SELECT 'sellers_seed', username
FROM public.sellers
ORDER BY tipo, nome;

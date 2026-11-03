-- ============================================================
-- MONKEY LARANJA — SETUP COMPLETO (tabelas + RLS + seed)
-- Rode inteiro no SQL Editor do Supabase.
-- Pode ser executado mais de uma vez? NÃO. Para recriar, rode 00-reset.sql antes.
-- ============================================================

-- ============================================================
-- 1. TABELAS
-- ============================================================

-- 1.1 PRODUTOS
CREATE TABLE public.products (
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

-- 1.2 VENDEDORES
CREATE TABLE public.sellers (
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

-- 1.3 PEDIDOS
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  buyer TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT '',
  status TEXT DEFAULT 'PENDENTE',
  demo BOOLEAN DEFAULT false,
  gateway TEXT DEFAULT 'mock'
);

-- 1.4 CARTEIRA (saldo)
CREATE TABLE public.wallets (
  username TEXT PRIMARY KEY,
  balance DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 TRANSAÇÕES DA CARTEIRA
CREATE TABLE public.wallet_transactions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT '',
  demo BOOLEAN DEFAULT false
);

-- 1.6 FAVORITOS
CREATE TABLE public.favorites (
  username TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (username, product_id)
);

-- 1.7 AVALIAÇÕES
CREATE TABLE public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ÍNDICES (performance nas buscas do catálogo)
-- ============================================================
CREATE INDEX products_game_idx ON public.products (game);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_seller_idx ON public.products (seller_username);
CREATE INDEX products_created_idx ON public.products (created_at DESC);
CREATE INDEX orders_buyer_idx ON public.orders (buyer);
CREATE INDEX wallet_tx_username_idx ON public.wallet_transactions (username);
CREATE INDEX reviews_product_idx ON public.reviews (product_id);

-- ============================================================
-- 3. RLS + POLÍTICAS
-- (o username vem do user_metadata do Supabase Auth)
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- PRODUTOS: leitura pública, escrita só do vendedor dono
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "products_insert_auth" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (seller_username = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "products_update_own" ON public.products
  FOR UPDATE TO authenticated
  USING (seller_username = (auth.jwt() -> 'user_metadata' ->> 'username'))
  WITH CHECK (seller_username = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "products_delete_own" ON public.products
  FOR DELETE TO authenticated
  USING (seller_username = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- Produtos demo (seed): anon pode inserir (só com demo=true)
CREATE POLICY "products_insert_demo" ON public.products
  FOR INSERT TO anon
  WITH CHECK (demo = true);

CREATE POLICY "products_insert_demo_auth" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (demo = true);

-- VENDEDORES: leitura pública, cada um edita o próprio perfil
CREATE POLICY "sellers_select_all" ON public.sellers
  FOR SELECT USING (true);
CREATE POLICY "sellers_insert_self" ON public.sellers
  FOR INSERT TO authenticated
  WITH CHECK (username = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "sellers_update_self" ON public.sellers
  FOR UPDATE TO authenticated
  USING (username = (auth.jwt() -> 'user_metadata' ->> 'username'))
  WITH CHECK (username = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- PEDIDOS: só o comprador vê/gerencia os próprios
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT TO authenticated
  USING (buyer = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (buyer = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE TO authenticated
  USING (buyer = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- Vendedores podem ver pedidos com seus produtos
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

-- CARTEIRA: só o dono
CREATE POLICY "wallets_all_own" ON public.wallets
  FOR ALL TO authenticated
  USING (username = (auth.jwt() -> 'user_metadata' ->> 'username'))
  WITH CHECK (username = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- TRANSAÇÕES: só o dono
CREATE POLICY "wallet_tx_all_own" ON public.wallet_transactions
  FOR ALL TO authenticated
  USING (username = (auth.jwt() -> 'user_metadata' ->> 'username'))
  WITH CHECK (username = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- FAVORITOS: só o dono
CREATE POLICY "favorites_all_own" ON public.favorites
  FOR ALL TO authenticated
  USING (username = (auth.jwt() -> 'user_metadata' ->> 'username'))
  WITH CHECK (username = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- AVALIAÇÕES: leitura pública, escreve quem está logado, deleta o autor
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (author = (auth.jwt() -> 'user_metadata' ->> 'username'));
CREATE POLICY "reviews_delete_own" ON public.reviews
  FOR DELETE TO authenticated
  USING (author = (auth.jwt() -> 'user_metadata' ->> 'username'));

-- ============================================================
-- 4. SEED — vendedores demo
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
   '["Oficial","Verificado","Garantia"]'::jsonb);

-- ============================================================
-- 5. CHECAGEM (deve listar 7 tabelas)
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

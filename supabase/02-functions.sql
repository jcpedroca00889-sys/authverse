-- ============================================================
-- MONKEY LARANJA — Funções auxiliares para a carteira
-- Rode DEPOIS do 01-setup.sql no SQL Editor do Supabase.
-- ============================================================

-- Crédito (depósito)
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

-- Débito (gasto) — retorna saldo restante ou NULL se saldo insuficiente
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
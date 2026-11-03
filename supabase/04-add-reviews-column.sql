-- ============================================================
-- MONKEY LARANJA — Adiciona coluna reviews no products
-- Rode APÓS o 01-setup.sql
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
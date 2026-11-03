-- ============================================================
-- MONKEY LARANJA — PATCH 09: fechar a migração para tabela
-- Rode INTEIRO no SQL Editor do Supabase (depois do 08).
-- ------------------------------------------------------------
-- O que este patch faz:
--   1. app_me passa a devolver created_at / display_name (perfil);
--   2. Nova RPC app_change_password (troca de senha via tabela,
--      validando a senha atual com bcrypt e invalidando outras
--      sessões) — substitui o supabase.auth.updateUser.
-- ============================================================

-- ── 1. app_me v2: perfil completo do usuário --------

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
    'username',     v_row.username,
    'display_name', v_row.display_name,
    'created_at',   v_row.created_at,
    'last_login_at', v_row.last_login_at
  );
END
$$;

-- ── 2. Troca de senha (tabela, sem Supabase Auth) ----

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

GRANT EXECUTE ON FUNCTION public.app_change_password(text, text, text) TO anon, authenticated;

-- ── CHECAGEM ----------
SELECT p.proname
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('app_me', 'app_change_password')
ORDER BY p.proname;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export const checkUsername = (v: string) =>
  !v ? 'Informe um username.'
  : v.length < 3 ? 'Mínimo de 3 caracteres.'
  : v.length > 20 ? 'Máximo de 20 caracteres.'
  : !USERNAME_RE.test(v) ? 'Use apenas letras, números e _.'
  : '';

export const checkPassword = (v: string) =>
  v.length < 8 ? 'Mínimo de 8 caracteres.' : v.length > 72 ? 'Máximo de 72 caracteres.' : '';

/** 0 (vazia) a 4 (épica) */
export function strength(v: string) {
  if (v.length < 8) return v ? 1 : 0;
  let s = 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) s++;
  return s;
}

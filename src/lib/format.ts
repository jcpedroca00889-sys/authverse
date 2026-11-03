/** Formata um valor em reais (pt-BR). */
export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Data curta pt-BR (dd/mm/aaaa). */
export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Data amigável (ex.: "12 de out. de 2026"). */
export const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

/** Iniciais de um nome para o avatar. */
export const initials = (name: string) =>
  name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')

/** Percentual de desconto entre preço antigo e atual. */
export const discountOf = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

/** RNG determinístico (mulberry32) para os dados demo. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Remove tudo que não for dígito. */
export const digitsOnly = (value: string) => value.replace(/\D/g, '')

/** Máscara progressiva de CPF (000.000.000-00) enquanto o usuário digita. */
export function maskCpf(value: string) {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Valida CPF pelos dígitos verificadores (rejeita 000.000.000-00 e afins). */
export function isValidCpf(value: string) {
  const cpf = digitsOnly(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const checkDigit = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10])
}

/** Gera um ID curto (para pedidos/anúncios criados no cliente). */
export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
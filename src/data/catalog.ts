/* ─────────────────────────────────────────────────────────────
 * CATÁLOGO DEMONSTRATIVO MONKEY LARANJA 🍌
 *
 * ⚠️  Todos os produtos, vendedores, avaliações e estatísticas
 * abaixo são DADOS FICTÍCIOS de demonstração, usados para exibir
 * a experiência do marketplace. Em produção, esses dados virão de
 * uma API + banco de dados reais (ver src/services/catalog.ts).
 * ───────────────────────────────────────────────────────────── */

import type { Game, GameSlug, Product, Review, Seller } from '../lib/types'
import { mulberry32 } from '../lib/format'

/* ── JOGOS ─────────────────────────────────────────────────── */

export const GAMES: Game[] = [
  { slug: 'roblox', name: 'Roblox', short: 'Roblox', emoji: '🧱', gradient: ['#E2231A', '#991B1B', '#450A0A'], accent: '#ef4444' },
  { slug: 'free-fire', name: 'Free Fire', short: 'Free Fire', emoji: '🔥', gradient: ['#FF9500', '#E23B00', '#7C1D00'], accent: '#ff8a3d' },
  { slug: 'valorant', name: 'Valorant', short: 'Valorant', emoji: '🎯', gradient: ['#FF4655', '#8B1E2D', '#2E0A11'], accent: '#ff5f6d' },
  { slug: 'fortnite', name: 'Fortnite', short: 'Fortnite', emoji: '⚡', gradient: ['#9D4DFF', '#5B21B6', '#1F0B3F'], accent: '#c084fc' },
  { slug: 'minecraft', name: 'Minecraft', short: 'Minecraft', emoji: '⛏️', gradient: ['#4CAF50', '#2E7D32', '#0F2A12'], accent: '#6ee7a0' },
  { slug: 'gta-v', name: 'GTA V', short: 'GTA V', emoji: '⭐', gradient: ['#c9c9d6', '#5b5b72', '#171720'], accent: '#ffd43b' },
  { slug: 'steam', name: 'Steam', short: 'Steam', emoji: '🎮', gradient: ['#66C0F4', '#1B2838', '#0B1117'], accent: '#66c0f4' },
  { slug: 'blox-fruits', name: 'Blox Fruits', short: 'Blox Fruits', emoji: '🍉', gradient: ['#FF4D8D', '#C2185B', '#4D0B22'], accent: '#ff8ab0' },
  { slug: 'grow-a-garden', name: 'Grow a Garden', short: 'Grow a Garden', emoji: '🌸', gradient: ['#7BC96F', '#3E8E41', '#123618'], accent: '#9fe08f' },
  { slug: 'outros', name: 'Outros jogos', short: 'Outros', emoji: '🕹️', gradient: ['#64748B', '#334155', '#111827'], accent: '#94a3b8' },
]

export const gameBySlug = (slug: GameSlug): Game => GAMES.find((g) => g.slug === slug) ?? GAMES[9]

/* ── CATEGORIAS DE PRODUTO ─────────────────────────────────── */

export const CATEGORIES = ['Contas', 'Itens', 'Moedas', 'Skins', 'Gamepass', 'Serviços', 'Pet', 'Créditos'] as const

/* ── VENDEDORES (fictícios) ────────────────────────────────── */

export const SELLERS: Seller[] = [
  { username: 'NeoZed_Gaming', displayName: 'NeoZed Gaming', verified: true, rating: 5.0, ratingCount: 1284, salesCount: 9120, memberSince: '2023-02-14', responseTime: '~5 min', description: 'Loja focada em contas e itens de Roblox e Free Fire com entrega automática 24h.', tags: ['Entrega automática', 'Suporte ágil'] },
  { username: 'BananaPro', displayName: 'Banana Pro', verified: true, rating: 4.9, ratingCount: 862, salesCount: 6350, memberSince: '2022-11-03', responseTime: '~10 min', description: 'O especialista em Blox Fruits e Grow a Garden. Frutas, pets e moedas com garantia.', tags: ['Garantia 7 dias', 'Verificado'] },
  { username: 'PixelHunter', displayName: 'Pixel Hunter', verified: false, rating: 4.8, ratingCount: 410, salesCount: 2890, memberSince: '2024-01-20', responseTime: '~30 min', description: 'Contas Valorant e Fortnite com skins selecionadas. Atendimento via chat.', tags: ['Skins raras'] },
  { username: 'RoyalBloxx', displayName: 'Royal Bloxx', verified: true, rating: 4.9, ratingCount: 743, salesCount: 5210, memberSince: '2023-06-11', responseTime: '~15 min', description: 'Roblox premium: limiteds, gamepasses e robux com histórico impecável.', tags: ['Verificado', 'Limiteds'] },
  { username: 'ComboKing', displayName: 'Combo King', verified: false, rating: 4.7, ratingCount: 215, salesCount: 1410, memberSince: '2024-05-02', responseTime: '~1 h', description: 'Pacotes combinados de moedas e créditos para vários jogos.', tags: ['Combos'] },
  { username: 'TurboGG', displayName: 'Turbo GG', verified: false, rating: 4.6, ratingCount: 168, salesCount: 980, memberSince: '2024-08-15', responseTime: '~2 h', description: 'Entrega manual rápida para GTA V e Steam. Suporte dedicado.', tags: ['Entrega manual', 'Suporte'] },
  { username: 'SkyMerchant', displayName: 'Sky Merchant', verified: true, rating: 5.0, ratingCount: 502, salesCount: 3740, memberSince: '2023-09-30', responseTime: '~7 min', description: 'Comércio digital premium. Todos os títulos com selo de garantia.', tags: ['Verificado', 'Garantia'] },
  { username: 'IronVendi', displayName: 'Iron Vendi', verified: false, rating: 4.5, ratingCount: 96, salesCount: 640, memberSince: '2025-01-08', responseTime: '~3 h', description: 'Anúncios honestos, fotos reais e preço justo. Novo na plataforma.', tags: ['Novo'] },
  { username: 'ZeykaStore', displayName: 'Zeyka Store', verified: false, rating: 4.8, ratingCount: 258, salesCount: 1750, memberSince: '2024-03-22', responseTime: '~25 min', description: 'Skins e itens para Free Fire e Fortnite a preços competitivos.', tags: ['Skins'] },
  { username: 'ML_Oficial', displayName: 'Monkey Laranja Oficial', verified: true, rating: 5.0, ratingCount: 3421, salesCount: 18400, memberSince: '2022-08-01', responseTime: '~3 min', description: 'Loja oficial da MONKEY LARANJA. Créditos, moedas e itens com garantia total.', tags: ['Oficial', 'Verificado', 'Garantia'] },
]

export const sellerByUsername = (username: string): Seller | undefined =>
  SELLERS.find((s) => s.username === username)

/* ── AVALIAÇÕES (fictícias) ────────────────────────────────── */

const REVIEW_POOL: Array<Pick<Review, 'author' | 'rating' | 'comment'>> = [
  { author: 'Relampago_07', rating: 5, comment: 'Entrega automática na hora, exatamente como anunciado. Recomendo!' },
  { author: 'NinaGamer', rating: 5, comment: 'Melhor loja que já comprei, vendedor muito atencioso. 🍌' },
  { author: 'KidBala', rating: 5, comment: 'Chegou super rápido e funcionando perfeitamente. Nota 10.' },
  { author: 'DrakooX', rating: 4, comment: 'Tudo certo com a entrega. Demorou uns minutinhos mas valeu a pena.' },
  { author: 'PipokaGamer', rating: 5, comment: 'Atendimento rápido e produto do jeito que estava na foto. Voltarei a comprar!' },
  { author: 'L3o_Mestre', rating: 5, comment: 'Compra tranquila e segura. Selo de entrega automática é real.' },
  { author: 'CookieMonster', rating: 4, comment: 'Muito bom! Só queria que tivesse mais unidades disponíveis.' },
  { author: 'RafaBlox', rating: 5, comment: 'Vendedor verificadíssimo, preço justo e entrega imediata. 🐵' },
  { author: 'TiaDoCafe', rating: 5, comment: 'Meu neto ficou feliz demais com a conta. Obrigada!' },
  { author: 'XDGames', rating: 5, comment: 'Terceira compra aqui. Nunca tive problema. Confiança total.' },
  { author: 'ViniRei', rating: 4, comment: 'Boa entrega, produto conforme descrito. Daria 5 se respondesse mais rápido.' },
  { author: 'LunaPixel', rating: 5, comment: 'Chegou em segundos. Simplesmente o melhor preço da plataforma.' },
]

/* ── DESCRIÇÕES (fictícias) ────────────────────────────────── */

const DESC_BY_CATEGORY: Record<string, string> = {
  Contas:
    'Conta 100% original, criada manualmente e com acesso completo. Você recebe e-mail e senha na entrega e pode alterar tudo em seguida. Revisada item por item antes do anúncio — sem surpresas.',
  Itens:
    'Item disponível para entrega imediata após a confirmação do pedido. Garantia da MONKEY LARANJA cobre qualquer problema relatado em até 7 dias.',
  Moedas:
    'Moedas entregues por método seguro em poucos minutos. Ideal para quem quer avançar no jogo sem perder tempo.',
  Skins:
    'Skin rara com visual exclusivo, selecionada por especialistas. Entrega automática ou manual conforme o anúncio.',
  Gamepass:
    'Gamepass válido, com acesso liberado na sua conta após a compra. Suporte incluso para ativação.',
  Serviços:
    'Serviço prestado por vendedor experiente com acompanhamento de progresso. Prazo de entrega informado no anúncio.',
  Pet: 'Pet raro com atributos destacados. Entrega e treinamento acompanhados até a ativação completa.',
  Créditos:
    'Créditos oficiais ou de revenda autorizada, entregues com comprovante. Saldo cai direto na conta informada.',
}

const DETAILS_POOL: Record<string, string[]> = {
  Contas: ['Acesso único', 'E-mail e senha inclusos', 'Alteração de dados liberada', 'Histórico limpo'],
  Itens: ['Entrega por troca segura', 'Garantia de 7 dias', 'Suporte na ativação'],
  Moedas: ['Entrega em até 15 minutos', 'Método seguro', 'Comprovante disponível'],
  Skins: ['Visual raro', 'Inventário comprovado', 'Entrega na hora'],
  Gamepass: ['Ativação assistida', 'Válido por tempo ilimitado', 'Suporte incluso'],
  Serviços: ['Prazo combinado', 'Atualizações no chat', 'Resultado garantido'],
  Pet: ['Atributos raros', 'Treinamento incluso', 'Garantia de 7 dias'],
  Créditos: ['Saldo comprovado', 'Entrega rápida', 'Comprovante de envio'],
}

/* ── TEMPLATES DE VARIAÇÕES ────────────────────────────────── */

const PACK_VARIANTS = [
  { name: 'Mini', subtitle: 'Experimente', priceMult: 0.3, minQty: 1, maxQty: 1, emoji: '🔸', badge: '' },
  { name: 'Pequeno', subtitle: 'Para começar', priceMult: 0.6, minQty: 1, maxQty: 3, emoji: '🔶', badge: '' },
  { name: 'Médio', subtitle: 'Mais popular', priceMult: 1.0, minQty: 1, maxQty: 5, emoji: '🟠', badge: 'Popular' },
  { name: 'Grande', subtitle: 'Melhor custo-benefício', priceMult: 1.6, minQty: 1, maxQty: 10, emoji: '🔶', badge: 'Econômico' },
  { name: 'Gigante', subtitle: 'Para quem quer tudo', priceMult: 2.8, minQty: 1, maxQty: 20, emoji: '🌟', badge: 'Premium' },
]

const DURATION_VARIANTS = [
  { name: 'Diário', subtitle: '1 dia de acesso', period: 'diario' as const, priceMult: 0.12, minQty: 1, maxQty: 30, emoji: '☀' },
  { name: 'Semanal', subtitle: '7 dias de acesso', period: 'semanal' as const, priceMult: 0.45, minQty: 1, maxQty: 10, emoji: '📅' },
  { name: 'Mensal', subtitle: '30 dias de acesso', period: 'mensal' as const, priceMult: 1.0, minQty: 1, maxQty: 6, emoji: '📆' },
  { name: 'Trimestral', subtitle: '90 dias de acesso', period: 'trimestral' as const, priceMult: 2.5, minQty: 1, maxQty: 2, emoji: '📊' },
  { name: 'Anual', subtitle: '12 meses de acesso', period: 'anual' as const, priceMult: 8.0, minQty: 1, maxQty: 1, emoji: '⭐', badge: 'Econômico' },
  { name: 'Vitalício', subtitle: 'Acesso permanente', period: 'vitalicio' as const, priceMult: 18.0, minQty: 1, maxQty: 1, emoji: '💎', badge: 'Melhor valor' },
]

const TIER_VARIANTS = [
  { name: 'Bronze', subtitle: 'Acesso básico', priceMult: 0.5, minQty: 1, maxQty: 1, emoji: '🥉', badge: '' },
  { name: 'Prata', subtitle: 'Acesso intermediário', priceMult: 1.0, minQty: 1, maxQty: 1, emoji: '🥈', badge: 'Popular' },
  { name: 'Ouro', subtitle: 'Acesso avançado', priceMult: 1.8, minQty: 1, maxQty: 1, emoji: '🥇', badge: '' },
  { name: 'Platina', subtitle: 'Acesso premium total', priceMult: 3.2, minQty: 1, maxQty: 1, emoji: '💠', badge: 'Premium' },
  { name: 'Diamante', subtitle: 'Acesso VIP exclusivo', priceMult: 5.5, minQty: 1, maxQty: 1, emoji: '💎', badge: 'VIP' },
]

/* ── PRODUTOS CURADOS (destaques da vitrine) ───────────────── */

const CURATED: Array<Partial<Product> & { title: string; game: GameSlug; category: string; price: number }> = [
  {
    title: 'Conta Roblox com itens raros',
    game: 'roblox', category: 'Contas', price: 249.9, oldPrice: 329.9, emoji: '🧑‍🚀',
    delivery: 'automatic', featured: true, stock: 3, art: 0,
    tags: ['Limited', 'Robux', 'Raro'],
    variants: TIER_VARIANTS.map((v) => ({
      ...v,
      price: Math.round(249.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(329.9 * v.priceMult * 100) / 100,
      includes: v.name === 'Bronze' ? ['Itens básicos']
        : v.name === 'Prata' ? ['Itens básicos', 'Robux extra']
        : v.name === 'Ouro' ? ['Tudo incluso', 'Suporte VIP']
        : ['Tudo incluso', 'Suporte VIP', 'Garantia extra'],
    })),
    description:
      'Conta Roblox completa criada em 2019, com itens limited raros, robux em conta e histórico limpo. Perfeita para quem quer destaque nos jogos. Entrega automática: você recebe o acesso assim que o pedido é confirmado.',
  },
  {
    title: 'Blox Fruits — frutas míticas',
    game: 'blox-fruits', category: 'Itens', price: 189.0, oldPrice: 240.0, emoji: '🍉',
    delivery: 'automatic', featured: true, stock: 5, art: 1,
    tags: ['Mítica', 'Entrega rápida'],
    description:
      'Conjunto com frutas míticas e lendárias para Blox Fruits, escolhidas pela nossa equipe. Entrega por troca segura em minutos. Acompanha suporte até a ativação completa.',
  },
  {
    title: 'Conta Valorant com skins',
    game: 'valorant', category: 'Contas', price: 459.9, oldPrice: 599.9, emoji: '🎯',
    delivery: 'manual', featured: true, stock: 2, art: 2,
    tags: ['Skins', 'Epic', 'Legendary'],
    variants: TIER_VARIANTS.slice(0, 4).map((v) => ({
      ...v,
      price: Math.round(459.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(599.9 * v.priceMult * 100) / 100,
      includes: v.name === 'Bronze' ? ['Skin básica']
        : v.name === 'Prata' ? ['Skin rara']
        : v.name === 'Ouro' ? ['Skin lendária', 'Acessórios']
        : ['Skin lendária', 'Acessórios', 'Knife rara'],
    })),
    description:
      'Conta Valorant com coleção de skins épicas e lendárias, incluindo acessórios de eventos exclusivos. Verificação de histórico limpa. Entrega manual em até 30 minutos com suporte dedicado.',
  },
  {
    title: 'Conta Free Fire com skins raras',
    game: 'free-fire', category: 'Contas', price: 199.9, oldPrice: 259.9, emoji: '🔥',
    delivery: 'automatic', featured: true, stock: 4, art: 3,
    tags: ['Skins raras', 'Diamantes'],
    variants: TIER_VARIANTS.slice(0, 3).map((v) => ({
      ...v,
      price: Math.round(199.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(259.9 * v.priceMult * 100) / 100,
    })),
    description:
      'Conta Free Fire com skins raras, emotes exclusivos e saldo de diamantes. Nível avançado e histórico limpo. Entrega automática com tudo o que você precisa para começar a jogar.',
  },
  {
    title: 'Pet raro Grow a Garden',
    game: 'grow-a-garden', category: 'Pet', price: 79.9, oldPrice: 99.9, emoji: '🐾',
    delivery: 'automatic', featured: true, stock: 6, art: 4,
    tags: ['Pet raro', 'Treinado'],
    description:
      'Pet raro da Grow a Garden, já treinado e pronto para ajudar no seu jardim. Entrega automática em poucos minutos. Garantia total da plataforma.',
  },
  {
    title: 'Gamepass Roblox exclusivo',
    game: 'roblox', category: 'Gamepass', price: 34.9, oldPrice: 49.9, emoji: '📦',
    delivery: 'automatic', featured: true, stock: 20, art: 5,
    tags: ['Gamepass', 'Exclusivo'],
    variants: DURATION_VARIANTS.map((v) => ({
      ...v,
      price: Math.round(34.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(49.9 * v.priceMult * 100) / 100,
    })),
    description:
      'Gamepass exclusivo criado sob encomenda para a sua experiência no Roblox. Ativação assistida e suporte até a liberação completa.',
  },
  {
    title: 'Itens raros Minecraft',
    game: 'minecraft', category: 'Itens', price: 49.9, oldPrice: 69.9, emoji: '⛏️',
    delivery: 'manual', featured: true, stock: 8, art: 6,
    tags: ['Raro', 'Java & Bedrock'],
    variants: PACK_VARIANTS.map((v) => ({
      ...v,
      price: Math.round(49.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(69.9 * v.priceMult * 100) / 100,
      includes: v.name === 'Mini' ? ['1 item raro']
        : v.name === 'Pequeno' ? ['3 itens raros']
        : v.name === 'Médio' ? ['5 itens raros', 'Ferramentas encantadas']
        : v.name === 'Grande' ? ['10 itens raros', 'Ferramentas', 'Armaduras']
        : ['20+ itens', 'Tudo incluso'],
    })),
    description:
      'Pacote de itens raros para Minecraft (Java e Bedrock): ferramentas encantadas, materiais raros e heads colecionáveis. Entrega por troca combinada.',
  },
  {
    title: 'Moedas de jogos — créditos variados',
    game: 'steam', category: 'Créditos', price: 59.9, oldPrice: 79.9, emoji: '🪙',
    delivery: 'automatic', featured: true, stock: 15, art: 7,
    tags: ['Créditos', 'Saldo'],
    variants: PACK_VARIANTS.map((v) => ({
      ...v,
      price: Math.round(59.9 * v.priceMult * 100) / 100,
      oldPrice: Math.round(79.9 * v.priceMult * 100) / 100,
      includes: v.name === 'Mini' ? ['Bônus de 5%']
        : v.name === 'Pequeno' ? ['Bônus de 10%']
        : v.name === 'Médio' ? ['Bônus de 15%']
        : v.name === 'Grande' ? ['Bônus de 20%']
        : ['Bônus de 30%'],
    })),
    description:
      'Créditos e moedas para uma seleção de jogos da Steam e outras plataformas. Entrega automática com comprovante. Consulte o suporte para a lista completa.',
  },
]

/* ── TEMPLATES DO GERADOR ──────────────────────────────────── */

const TITLE_TEMPLATES: Record<GameSlug, string[]> = {
  roblox: [
    'Conta Roblox com robux em conta',
    'Conta Roblox antiga premium',
    'Robux — entrega automática',
    'Conta Roblox com avatar famoso',
    'Gamepass de desenvolvedor',
  ],
  'free-fire': [
    'Conta Free Fire nível alto',
    'Diamantes Free Fire via recarga',
    'Conta Free Fire com emotes raros',
    'Conta Free Fire com armas lendárias',
    'Pacote de diamantes + skins',
  ],
  valorant: [
    'Conta Valorant com knife rara',
    'Pontos Valorant (VP)',
    'Conta Valorant com battle pass',
    'Conta Valorant Radiante',
    'Skins Valorant por troca',
  ],
  fortnite: [
    'Conta Fortnite com V-Bucks',
    'Conta Fortnite com skins OG',
    'V-Bucks — entrega na hora',
    'Conta Fortnite nível alto',
    'Pacote de skins + passe',
  ],
  minecraft: [
    'Conta Minecraft Java original',
    'Conta Minecraft com capes',
    'Itens de mineração raros',
    'Servidor Minecraft — montagem',
    'Skins exclusivas Minecraft',
  ],
  'gta-v': [
    'Conta GTA V Online rica',
    'Dinheiro GTA V via entrega',
    'Conta GTA V com garagens',
    'Conta GTA V nível alto',
    'Pacote de mods GTA V',
  ],
  steam: [
    'Chave Steam de jogo AAA',
    'Saldo Steam via presente',
    'Conta Steam com biblioteca',
    'Chave Steam indie + desconto',
    'Créditos Steam',
  ],
  'blox-fruits': [
    'Frutas lendárias Blox Fruits',
    'Conta Blox Fruits nível alto',
    'Frutas míticas — combo',
    'Beli Blox Fruits em massa',
    'Gamepass Blox Fruits',
  ],
  'grow-a-garden': [
    'Moedas Grow a Garden',
    'Conta Grow a Garden completa',
    'Plantas raras Grow a Garden',
    'Pack de jardinagem avançada',
    'Pet lendário Grow a Garden',
  ],
  outros: [
    'Conta jogo alternativo raro',
    'Moedas de jogo alternativo',
    'Chave de jogo alternativo',
    'Item raro de jogo alternativo',
    'Serviço de boosting',
  ],
}

const EMOJI_BY_CATEGORY: Record<string, string> = {
  Contas: '🧑‍💻', Itens: '🎒', Moedas: '🪙', Skins: '🎨', Gamepass: '📦', Serviços: '🔧', Pet: '🐾', Créditos: '💳',
}

/* ── GERADOR DETERMINÍSTICO ────────────────────────────────── */

function buildCatalog(): Product[] {
  const rng = mulberry32(1337)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const between = (min: number, max: number) => Math.round((min + rng() * (max - min)) * 100) / 100

  const products: Product[] = []

  // Produtos curados
  let n = 0
  for (const c of CURATED) {
    n += 1
    const sellers = SELLERS.filter((s) => s.verified)
    const seller = pick(sellers)
    products.push({
      id: `p${String(n).padStart(3, '0')}`,
      ...c,
      sellerUsername: seller.username,
      rating: seller.rating,
      ratingCount: Math.max(6, Math.round(seller.ratingCount * (0.08 + rng() * 0.15))),
      salesCount: Math.max(8, Math.round(seller.salesCount * (0.03 + rng() * 0.1))),
      createdAt: new Date(Date.now() - Math.floor(rng() * 20) * 864e5).toISOString(),
      status: 'available',
      demo: true,
      details: DETAILS_POOL[c.category] ?? [],
      reviews: REVIEW_POOL.slice(0, 3).map((r, i) => ({
        id: `${c.title}-r${i}`,
        author: r.author,
        rating: r.rating,
        comment: r.comment,
        date: new Date(Date.now() - (2 + i * 3) * 864e5).toISOString(),
      })),
    } as Product)
  }

  // Produtos gerados
  const slugList: GameSlug[] = ['roblox', 'free-fire', 'valorant', 'fortnite', 'minecraft', 'gta-v', 'steam', 'blox-fruits', 'grow-a-garden', 'outros']
  const PRICE_RANGES: Record<GameSlug, [number, number]> = {
    roblox: [15, 350], 'free-fire': [10, 300], valorant: [40, 900], fortnite: [20, 600],
    minecraft: [5, 150], 'gta-v': [30, 450], steam: [15, 400], 'blox-fruits': [10, 400],
    'grow-a-garden': [8, 120], outros: [5, 250],
  }
  for (const slug of slugList) {
    const count = 4 + Math.floor(rng() * 3) // 4-6 por jogo
    const [priceMin, priceMax] = PRICE_RANGES[slug]

    for (let i = 0; i < count; i++) {
      n += 1
      const title = pick(TITLE_TEMPLATES[slug])
      const category = pick(['Contas', 'Itens', 'Moedas', 'Skins', 'Gamepass', 'Serviços', 'Pet', 'Créditos'])
      const seller = pick(SELLERS)
      let price = between(priceMin, priceMax)
      let oldPrice: number | undefined
      // ~35% dos gerados entram em promoção real
      if (rng() < 0.35) oldPrice = Math.round(price * (1.15 + rng() * 0.35) * 100) / 100
      const delivery = rng() < 0.72 ? 'automatic' : 'manual'
      const starRating = Math.round((seller.rating - 0.2 + rng() * 0.4) * 10) / 10

      // Gera variações para alguns tipos de produto
      let variants: Product['variants']
      const variantChance = rng()
      if ((category === 'Moedas' || category === 'Créditos') && variantChance < 0.6) {
        variants = PACK_VARIANTS.map((v) => ({
          ...v,
          price: Math.round(price * v.priceMult * 100) / 100,
          oldPrice: oldPrice ? Math.round(oldPrice * v.priceMult * 100) / 100 : undefined,
        }))
      } else if ((category === 'Gamepass' || category === 'Serviços') && variantChance < 0.55) {
        const durVariants = DURATION_VARIANTS.filter(() => rng() > 0.3)
        if (durVariants.length >= 2) {
          variants = durVariants.map((v) => ({
            ...v,
            price: Math.round(price * v.priceMult * 100) / 100,
            oldPrice: oldPrice ? Math.round(oldPrice * v.priceMult * 100) / 100 : undefined,
          }))
        }
      } else if (category === 'Contas' && variantChance < 0.4) {
        const tierVariants = TIER_VARIANTS.filter(() => rng() > 0.35)
        if (tierVariants.length >= 2) {
          variants = tierVariants.map((v) => ({
            ...v,
            price: Math.round(price * v.priceMult * 100) / 100,
            oldPrice: oldPrice ? Math.round(oldPrice * v.priceMult * 100) / 100 : undefined,
            includes: v.name === 'Bronze' ? ['Acesso básico'] : v.name === 'Prata' ? ['Acesso completo'] : ['Acesso VIP', 'Suporte'],
          }))
        }
      }

      products.push({
        id: `p${String(n).padStart(3, '0')}`,
        title,
        game: slug,
        category,
        price,
        oldPrice,
        delivery,
        description: DESC_BY_CATEGORY[category] ?? DESC_BY_CATEGORY.Itens,
        details: DETAILS_POOL[category] ?? [],
        sellerUsername: seller.username,
        rating: Math.min(5, starRating),
        ratingCount: Math.max(3, Math.round(rng() * seller.ratingCount * 0.2)),
        salesCount: Math.max(2, Math.round(rng() * seller.salesCount * 0.15)),
        createdAt: new Date(Date.now() - Math.floor(rng() * 45) * 864e5).toISOString(),
        status: rng() < 0.08 ? 'low' : 'available',
        stock: 1 + Math.floor(rng() * 18),
        emoji: EMOJI_BY_CATEGORY[category] ?? '🎁',
        art: n % 8,
        tags: pick(['Popular', 'Novo', 'Raro', 'Em alta', 'Oferta', 'Entrega rápida', 'Garantia']).split(' '),
        reviews: REVIEW_POOL.slice(0, 1 + Math.floor(rng() * 3)).map((r, j) => ({
          id: `g${n}-r${j}`,
          author: r.author,
          rating: r.rating,
          comment: r.comment,
          date: new Date(Date.now() - (1 + j * 5) * 864e5).toISOString(),
        })),
        demo: true,
      }) as Product
      // Adiciona variantes ao produto gerado
      if (variants) {
        products[products.length - 1].variants = variants
      }
    }
  }

  return products
}

export const PRODUCTS_SEED: Product[] = buildCatalog()

/* ── AÇÕES DO CATÁLOGO DEMO ────────────────────────────────── */

export const discountPct = (p: Product) =>
  p.oldPrice && p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0
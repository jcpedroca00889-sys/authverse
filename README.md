# 🐒 MONKEY LARANJA — Login & Registro

Página de autenticação **premium com identidade cartoon**: tema laranja/preto/amarelo, mascote macaco animado e microinterações — construída com **React + TypeScript + Vite + Tailwind CSS + Framer Motion**.

## ✨ Recursos

- 🎨 Paleta oficial: laranja `#FF7900`, amarelo dourado `#FFD43B`, fundos escuros e cartão marrom
- 🐒 **Mascote Monkey interativo** (SVG puro):
  - Dá boas-vindas ao abrir ✅
  - **Olha para o campo** ao focar o usuário 👀
  - **Cobre os olhos com as mãos** enquanto você digita a senha 🙈
  - **Comemora** ao logar 🎉
- 💨 Fundo vivo: partículas brilhantes, bananas volantes, estrelas, folhas tropicais e glows laranja
- 🖱️ Botão "ENTRAR NA CONTA" com gradiente, glow pulsante, elevação no hover e explosão de partículas no clique
- 👤 Login/registro com **username + senha** (sem e-mail), contas salvas no **localStorage**
- ✅ Validação completa com feedback de erro animado (shake nos erros)
- 🎆 Confete + comemoração na tela de sucesso
- 📱 Responsivo e acessível · ♿ `prefers-reduced-motion`
- 🧩 Componentes reutilizáveis em TypeScript

## 🚀 Rodando

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` (neste ambiente: `http://localhost:5177`)

## 📦 Build

```bash
npm run build   # gera dist/
npm run preview # serve o build
```

## 🗂️ Estrutura

```
auth-app/
├── index.html                ← fontes Baloo 2 + Inter, título e favicon 🍌
├── vite.config.js            ← React + Tailwind CSS v4
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx               ← cenário, card, logo e estados globais
    ├── index.css             ← tema Tailwind (paleta + animações)
    ├── lib/mockAuth.ts       ← contas locais (localStorage) + sessão
    └── components/
        ├── Monkey.tsx        ← mascote SVG reativo (5 emoções)
        ├── Background.tsx    ← partículas, emojis, folhas e glows
        └── AuthForm.tsx      ← formulários, validação, burst e confete
```

## 🔜 Próximos passos

- **Backend real**: adicionar Supabase/Firebase quando quiser contas seguras (hash de senha, banco de dados)
- **Hospedar na Vercel**: projeto já pronto (Vite → `dist`)

## 🚑 Erro 429 — "email rate limit exceeded"

Ao criar conta, o Supabase Auth (`/auth/v1/signup`) responde **429**. Isso não é bug do front:
o projeto está usando o **serviço de email embutido do Supabase** (sem SMTP próprio), cujo limite
padrão é de **~2 emails por hora**. Cada `signUp` com "Confirm email" ligado dispara um email novo,
então após 2 contas criadas (ou 2 tentativas com o mesmo username) o envio é bloqueado.

Soluções, da mais simples para a mais completa:

1. **Desligar a confirmação de email** (recomendado para este app, que usa username + senha e não
   precisa de verificação de email):
   `Dashboard → Authentication → Sign In / Providers → Email → desmarque "Confirm email" → Save`.
   Depois disso o `signUp` já devolve uma sessão válida e **nenhum email é enviado** — o 429
   desaparece por completo.

2. **Esperar o limite resetar**: o bloqueio dura aproximadamente 1 hora (contador por projeto).

3. **Configurar um SMTP próprio** (Resend, Brevo, SendGrid, Amazon SES…) em
   `Authentication → Emails → SMTP Settings`, com domínio verificado. Além de acabar com o limite
   de 2/hora, é o único caminho se você realmente quiser confirmação por email em produção.

4. **Ajustar os limites** em `Authentication → Rate Limits` (isso limita tentativas por IP, mas
   *não* o teto do SMTP embutido — por isso o item 1 ou 3 continua necessário).

> [!NOTE]
> O app já trata os cenários acima: erros 429 viram uma mensagem amigável, contas pendentes de
> confirmação mostram um aviso em vez de fingir que o usuário está logado, e usuários que já
> existem são detectados sem gastar outro email.

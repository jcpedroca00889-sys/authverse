# AUTHVERSE

Sistema de autenticação + loja digital com front-end em React + Vite + Tailwind e back-end em Node.js + Express. Cadastro, login, sessão por cookie HttpOnly, carrinho de produtos e painel da loja.

## Tecnologias

- **Front-end:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Back-end:** Node.js, Express, bcrypt, jsonwebtoken (JWT), cookie-parser, express-rate-limit, helmet
- **Deploy:** Vercel (front-end estático + API serverless)

## Estrutura

```
authverse/
├── backend/                 # API Express
│   ├── server.js            # ponto de entrada (app exportado + listen condicional)
│   ├── controllers/         # authController, productController
│   ├── routes/              # authRoutes, productRoutes
│   ├── middleware/          # auth, rateLimit, errors
│   ├── services/            # authService
│   ├── database/            # userStore, productStore (arquivos JSON)
│   └── package.json
├── frontend/                # App React + Vite
│   ├── src/
│   │   ├── components/      # AuthForm, HoloCard, ProductCard, StoreNav...
│   │   ├── pages/           # AuthPage, Store
│   │   ├── services/        # api.ts, store.ts, validation.ts
│   │   ├── hooks/           # useAuth, usePrefs
│   │   ├── animations/      # variants.ts
│   │   └── styles/          # index.css
│   ├── package.json
│   └── dist/                # build de produção (ignorado pelo git)
├── api/                     # adaptador serverless da Vercel
│   └── index.mjs
├── vercel.json              # configuração da Vercel
├── .env.example             # variáveis de ambiente (copie para .env)
├── .gitignore
└── package.json             # scripts raiz (concurrently para dev local)
```

## 1. Rodar localmente

### Pré-requisitos
- Node.js 18+ instalado

### Instalação

```bash
# na raiz do projeto
npm install          # dependências raiz
npm install --prefix backend
npm install --prefix frontend
```

### Variáveis de ambiente

Copie o exemplo e preencha o `JWT_SECRET`:

```bash
cp .env.example .env
```

Gere um segredo forte:

```bash
# Linux / macOS / Git Bash
openssl rand -hex 48

# PowerShell (Windows)
[System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48) | ForEach-Object { [BitConverter]::ToString($_).Replace('-','').ToLower() }
```

Cole o resultado no `.env`:

```
PORT=4000
NODE_ENV=development
JWT_SECRET=seu-segredo-aqui-com-pelo-menos-48-caracteres
```

### Iniciar em desenvolvimento

```bash
npm run dev
```

Isso sobe:
- **Back-end (API):** http://localhost:4000
- **Front-end (Vite):** http://localhost:5173 ← abra aqui no Chrome

O front-end faz proxy de `/api` para a porta 4000 automaticamente.

## 2. Enviar para o GitHub

```bash
git init
git add .
git commit -m "feat: authverse pronto para GitHub + Vercel"

git remote add origin https://github.com/SEU-USUARIO/authverse.git
git branch -M main
git push -u origin main
```

> **Não commite o arquivo `.env` nem a pasta `node_modules`.** Eles já estão no `.gitignore`.

## 3. Hospedar na Vercel

1. Acesse [vercel.com](https://vercel.com), importe o repositório do GitHub.
2. No passo de configuração do projeto, deixe as opções padrão da Vercel (ela detecta o `vercel.json` na raiz).
3. Nas **Environment Variables** do projeto na Vercel, adicione:
   - `JWT_SECRET` → mesmo valor forte que você gerou localmente
   - `NODE_ENV` → `production`
   - `PORT` → `4000` (opcional)
4. Dê o **Deploy**.

O que acontece no deploy:
- O front-end é buildado com Vite e servido como arquivos estáticos (`frontend/dist`)
- A API roda como função serverless da Vercel (`api/index.mjs`) nas rotas `/api/*`
- Rotas não encontradas caem no `index.html` (SPA)

## Segurança (já aplicada)

- `JWT_SECRET` é **obrigatório em produção** (a aplicação não inicia sem ele)
- Cookies de sessão são `httpOnly`, `secure` (somente HTTPS) e `sameSite=strict`
- `helmet` define cabeçalhos de segurança
- `express-rate-limit` limita requisições à API
- `.env` e `.jwt_secret` estão no `.gitignore` (nunca vão ao GitHub)

## Atenção: produtos em JSON

Por enquanto os produtos ficam em `backend/database/products.json`. Isso é acessível pela API (que exige sessão autenticada). Para o futuro, a migração para **Supabase** é simples: basta trocar o `productStore.js` pela chamada ao Supabase; o restante da API continua igual.

---

Pronto. Depois de fazer o `push`, o repositório está no GitHub e você pode conectar na Vercel em poucos minutos. Qualquer erro no deploy, é só me avisar com o log que aparece na Vercel.
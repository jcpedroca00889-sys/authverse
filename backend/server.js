import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção. Defina a variável de ambiente.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '2kb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', notFound);

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

export default app;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`AUTHVERSE API on http://localhost:${PORT}`));
}

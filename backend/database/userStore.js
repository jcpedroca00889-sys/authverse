import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'users.json');
let queue = Promise.resolve();

async function read() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return { users: [] };
    throw e;
  }
}

// Escrita atômica: grava em arquivo temporário e renomeia (nunca deixa JSON pela metade).
async function write(data) {
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

// Fila: serializa escritas para evitar condição de corrida entre cadastros simultâneos.
function locked(fn) {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
}

export const findByUsername = async (username) =>
  (await read()).users.find((u) => u.username.toLowerCase() === username.toLowerCase());

export const findById = async (id) => (await read()).users.find((u) => u.id === id);

export const create = (username, passwordHash) =>
  locked(async () => {
    const db = await read();
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw Object.assign(new Error('Username em uso'), { code: 'USERNAME_TAKEN' });
    }
    const user = { id: randomUUID(), username, password: passwordHash, createdAt: new Date().toISOString() };
    db.users.push(user);
    await write(db);
    return user;
  });

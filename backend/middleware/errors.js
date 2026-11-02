export class HttpError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}
export const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);
export const notFound = (_req, _res, next) => next(new HttpError(404, 'Rota não encontrada.'));
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') err = new HttpError(400, 'Requisição inválida.');
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: { message: status === 500 ? 'Erro interno do servidor.' : err.message, field: err.field } });
}

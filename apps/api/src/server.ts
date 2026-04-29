import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pool } from '@ai-logger/database';
import { logRoutes } from './routes/logs.js';
import { authRoutes } from './routes/auth.js';

async function main() {
  const app = Fastify({
    logger: true,
  });

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  // Register routes
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(logRoutes, { prefix: '/logs' });

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await pool.end();
  });

  const port = parseInt(process.env.API_PORT || '3001', 10);
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Server listening on port ${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

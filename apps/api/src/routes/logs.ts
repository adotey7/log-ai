import { FastifyInstance } from 'fastify';
import { pool } from '@ai-logger/database';
import { z } from 'zod';
import { verifyToken } from '../lib/jwt.js';
import { explainError } from '../services/ai.js';

const createLogSchema = z.object({
  message: z.string().min(1),
  stack: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  language: z.string().optional(),
  viewport: z.object({ width: z.number(), height: z.number() }).optional(),
  timestamp: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});

interface ListLogsQuery {
  search?: string;
  limit?: string;
  offset?: string;
}

function buildListLogsQuery(query: ListLogsQuery) {
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`message ILIKE $${params.length}`);
  }

  params.push(parseInt(query.limit ?? '20', 10));
  const limitIndex = params.length;

  params.push(parseInt(query.offset ?? '0', 10));
  const offsetIndex = params.length;

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM logs ${whereClause} ORDER BY created_at DESC LIMIT $${limitIndex} OFFSET $${offsetIndex}`;

  return { sql, params };
}

export async function logRoutes(app: FastifyInstance) {
  // Public: Create a log
  app.post('/', async (request, reply) => {
    const body = createLogSchema.parse(request.body);

    const result = await pool.query(
      `INSERT INTO logs (message, stack, url, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        body.message,
        body.stack || null,
        body.url || null,
        JSON.stringify({
          userAgent: body.userAgent,
          language: body.language,
          viewport: body.viewport,
          timestamp: body.timestamp,
          context: body.context,
        }),
      ]
    );

    return reply.status(201).send({ id: result.rows[0].id });
  });

  // Protected: Get all logs
  app.get('/', async (request, reply) => {
    await verifyToken(request);

    const query = request.query as ListLogsQuery;
    const { sql, params } = buildListLogsQuery(query);
    const result = await pool.query(sql, params);
    return result.rows;
  });

  // Protected: Get single log
  app.get('/:id', async (request, reply) => {
    await verifyToken(request);

    const { id } = request.params as { id: string };
    const result = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Log not found' });
    }

    return result.rows[0];
  });

  // Protected: Trigger AI explanation
  app.post('/:id/explain', async (request, reply) => {
    await verifyToken(request);

    const { id } = request.params as { id: string };

    const logResult = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);
    if (logResult.rows.length === 0) {
      return reply.status(404).send({ error: 'Log not found' });
    }

    const log = logResult.rows[0];

    // If already explained, return cached
    if (log.explanation) {
      return {
        explanation: log.explanation,
        causes: log.causes,
        fix: log.fix,
      };
    }

    const explanation = await explainError(log.message, log.stack);

    await pool.query(
      `UPDATE logs SET explanation = $1, causes = $2, fix = $3 WHERE id = $4`,
      [explanation.explanation, JSON.stringify(explanation.causes), explanation.fix, id]
    );

    return explanation;
  });
}

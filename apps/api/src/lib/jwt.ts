import { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  email: string;
}

class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
  }
}

export function verifyToken(request: FastifyRequest): TokenPayload {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET || 'dev-secret';

  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

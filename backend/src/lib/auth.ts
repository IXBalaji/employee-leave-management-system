import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

export interface TokenPayload {
  sub: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

import crypto from 'crypto';

import { env } from '../config/env';
import { UserRole } from '../models/auth.dto';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  exp: number;
}

/**
 * Generates a signed token with custom HMAC-SHA256 signature
 * Structure: base64url(payload).signature
 *
 * @param payload Token payload without expiry
 * @param expirySeconds Expiry time in seconds
 */
export function generateToken(payload: Omit<TokenPayload, 'exp'>, expirySeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expirySeconds;
  const fullPayload: TokenPayload = { ...payload, exp };
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
  hmac.update(payloadB64);
  const signatureB64 = hmac.digest('base64url');

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a token's HMAC-SHA256 signature and checks its expiration timestamp
 *
 * @param token The token string to verify
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    const payloadB64 = parts[0];
    const signatureB64 = parts[1];
    if (!payloadB64 || !signatureB64) {
      return null;
    }

    // Re-verify signature
    const hmac = crypto.createHmac('sha256', env.JWT_SECRET);
    hmac.update(payloadB64);
    const expectedSignatureB64 = hmac.digest('base64url');

    if (signatureB64 !== expectedSignatureB64) {
      return null;
    }

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsedPayload = JSON.parse(payloadStr) as unknown;
    const payload = parsedPayload as TokenPayload;

    // Check expiration
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSeconds) {
      return null; // Expired
    }

    return payload;
  } catch (error) {
    return null;
  }
}

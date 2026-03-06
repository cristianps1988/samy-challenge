import jwt from 'jsonwebtoken';
import { TokenService, TokenPayload } from "@application/ports/providers/token.service.port.js";
import { env } from "../config/env.js";

function parseJwtExpiration(expiration: string): number {
  const pattern = /^(\d+)(s|m|h|d|w)$/;
  const match = expiration.match(pattern);

  if (!match) {
    throw new Error(`Invalid JWT expiration format: ${expiration}. Use format like '1s', '5m', '24h', '7d', '4w'`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const unitToSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };

  return value * unitToSeconds[unit];
}

export class JwtTokenService implements TokenService {
  private readonly expirationInSeconds: number;

  constructor() {
    this.expirationInSeconds = parseJwtExpiration(env.JWT_EXPIRATION);
  }

  generateToken(payload: TokenPayload): string {
    const tokenPayload = {
      email: payload.email,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: this.expirationInSeconds,
    });
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

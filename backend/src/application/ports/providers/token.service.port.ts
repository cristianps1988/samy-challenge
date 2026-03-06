export interface TokenPayload {
  email: string;
  iat?: number;
}

export interface TokenService {
  generateToken(payload: TokenPayload): string;

  verifyToken(token: string): TokenPayload;
}

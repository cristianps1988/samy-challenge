import { env } from './config/env.js';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  private format(level: LogLevel, data: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    if (typeof data === 'object' && data !== null) {
      console.log(prefix, JSON.stringify(data, null, 2));
    } else {
      console.log(prefix, data);
    }
  }

  info(data: unknown): void {
    this.format('info', data);
  }

  error(data: unknown): void {
    this.format('error', data);
  }

  warn(data: unknown): void {
    this.format('warn', data);
  }

  debug(data: unknown): void {
    if (this.isDevelopment) {
      this.format('debug', data);
    }
  }
}

export const logger = new Logger();

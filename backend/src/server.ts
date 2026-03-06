import { app } from './infrastructure/app.js';
import { env } from './infrastructure/config/env.js';
import { logger } from './infrastructure/logger.js';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info({
    message: `Server running on port ${PORT}`,
    environment: env.NODE_ENV,
    cors_origin: env.CORS_ORIGIN,
  });
});

const gracefulShutdown = (signal: string) => {
  logger.info({ message: `${signal} received, shutting down gracefully...` });

  server.close((err) => {
    if (err) {
      logger.error({ message: 'Error closing server', error: err.message });
      process.exit(1);
    }

    logger.info({ message: 'Server closed successfully' });
    process.exit(0);
  });

  setTimeout(() => {
    logger.error({ message: 'Forced shutdown after timeout' });
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error({ message: 'Uncaught exception', error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ message: 'Unhandled promise rejection', reason });
  process.exit(1);
});

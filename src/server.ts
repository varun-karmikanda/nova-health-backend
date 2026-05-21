import { connectDB } from './config/db';
import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

(async () => {
  await connectDB();
  const app = buildApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started successfully');
  });

  // Process event handlers for unexpected errors
  process.on('unhandledRejection', (reason: unknown) => {
    logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err: Error) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    server.close(() => {
      process.exit(1);
    });
  });
})();

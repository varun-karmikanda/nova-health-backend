import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error-handler.middleware';
import { requestId } from './middlewares/request-id.middleware';
import { apiRouter } from './routes';

export function buildApp(): Express {
  const app = express();

  // Basic security and cross-origin setup
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors());

  // Parse JSON payloads with body limits
  app.use(express.json({ limit: '100kb' }));

  // Attach request ID and logger
  app.use(requestId());

  // Serve API documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Mount API endpoints
  app.use('/api/v1', apiRouter);

  // Global error handler - MUST be last
  app.use(errorHandler);

  return app;
}

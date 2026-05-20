import pino, { Logger, LoggerOptions } from 'pino';

import { env } from './env';

const loggerOptions: LoggerOptions = {
  level: env.LOG_LEVEL,

  // Strip sensitive fields from all log output — applies recursively
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.creditCard',
      '*.ssn',
    ],
    censor: '[REDACTED]',
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
};

if (env.NODE_ENV !== 'production') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss Z' },
  };
}

export const logger: Logger = pino(loggerOptions);

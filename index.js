const pino = require('pino');
const { randomUUID } = require('crypto');

function createLogger(context = {}) {
  return pino({
    base: {
      service: context.serviceName || 'unknown',
      container: context.container || 'generic',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: process.env.NODE_ENV === 'production' ? undefined : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname',
      },
    }
  });
}

function getRequestId(req) {
  return req?.headers?.['x-request-id'] || randomUUID();
}

module.exports = {
  createLogger,
  getRequestId,
};

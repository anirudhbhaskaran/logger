const pino = require('pino');
const { randomUUID } = require('crypto');

function createLogger({ serviceName = 'unknown', container = 'generic' }) {
  const baseLogger = pino({
    base: {
      service: serviceName,
      container,
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

  function logRequest({ req, status = 200, error = null, stack = null }) {
    const requestId = getRequestId(req);
    baseLogger.info({
      requestId,
      service: serviceName,
      route: req?.url,
      method: req?.method,
      headers: req?.headers,
      params: req?.params,
      body: req?.body,
      error: error ? error.message : null,
      stack,
      status
    });
  }

  function logError({ req, error, status = 500 }) {
    const requestId = getRequestId(req);
    baseLogger.error({
      requestId,
      service: serviceName,
      route: req?.url,
      method: req?.method,
      headers: req?.headers,
      params: req?.params,
      body: req?.body,
      error: error.message,
      stack: error.stack,
      status
    });
  }

  return {
    logRequest,
    logError,
    raw: baseLogger
  };
}

function getRequestId(req) {
  return req?.headers?.['x-request-id'] || randomUUID();
}

module.exports = {
  createLogger,
  getRequestId,
};

const pino = require('pino');
const { randomUUID } = require('crypto');

function createLogger({ serviceName = 'unknown', container = 'generic', route = 'any' }) {
  const baseLogger = pino({
    base: {
      service: serviceName,
      container,
      route
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: './transport.js',
      options: {},
    }
  });

  function logRequest({ req, msg=null, status = 200, error = null, stack = null }) {
    const requestId = getRequestId(req);
    baseLogger.info({
      timestamp: new Date().toISOString(),
      requestId,
      service: serviceName,
      container: container,
      route: route,
      method: req?.method,
      headers: req?.headers,
      params: req?.params,
      body: req?.body,
      error: error ? error.message : null,
      stack,
      status,
      msg: msg,
      type: "__internal"
    });
  }

  function logError({ req, error, status = 500 }) {
    const requestId = getRequestId(req);
    baseLogger.error({
      timestamp: new Date().toISOString(),
      requestId,
      service: serviceName,
      container: container,
      route: route,
      method: req?.method,
      headers: req?.headers,
      params: req?.params,
      body: req?.body,
      error: error.message,
      stack: error.stack,
      status,
      type: "__internal"
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

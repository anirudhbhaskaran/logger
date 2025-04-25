// pino-pocketbase-transport.js
import { createWriteStream } from 'node:fs';
import { Writable } from 'node:stream';
import axios from 'axios';

const PB_URL = process.env.POCKETBASE_LOGGER_URL;
const PB_COLLECTION = process.env.PB_COLLECTION;

async function loginAsAdmin() {
    const res = await axios.post(`${PB_URL}/api/admins/auth-with-password`, {
        identity: "test@example.com",
        password: "1234567890"
    });
    return res.data.token;
}

export default async function (opts) {
  return Writable({
    objectMode: true,
    write: async (logObj, enc, cb) => {
      try {
        const log = JSON.parse(logObj);

        const payload = {
          timestamp: new Date(log.time || Date.now()).toISOString(),
          requestId: log.requestId || '',
          service: log.service || '',
          container: log.container || '',
          route: log.route || '',
          method: log.method || '',
          headers: log.headers || {},
          params: log.params || {},
          body: log.body || {},
          error: log.error || '',
          stack: log.stack || '',
          status: log.status || 0,
          message: log.msg || '',
          type: log.type || '__external'
        };

        const token = await loginAsAdmin();
        await axios.post(`${PB_URL}/api/collections/${PB_COLLECTION}/records`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        cb();
      } catch (err) {
        console.error('[PB TRANSPORT ERROR]', err.message);
        cb(); // Don't crash on logging errors
      }
    }
  });
}

const NodeCache = require('node-cache');
const config = require('../config');

// `checkperiod: 0` disables node-cache's internal sweep interval. Without
// this, the timer holds the event loop open and prevents the test process
// (and any short-lived script) from exiting cleanly. Expired entries are
// still purged lazily on read because node-cache validates TTL on .get().
const newsCache = new NodeCache({
    stdTTL: config.cache.ttlSeconds,
    checkperiod: 0,
    useClones: false,
});

const buildKey = (parts) =>
    parts
        .filter((p) => p !== undefined && p !== null && p !== '')
        .map((p) => String(p).trim().toLowerCase())
        .join('::');

module.exports = {
    newsCache,
    buildKey,
};

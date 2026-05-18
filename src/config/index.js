require('dotenv').config();

const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
        secret: process.env.JWT_SECRET || 'change-me-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    },
    news: {
        apiKey: process.env.NEWS_API_KEY || '',
        baseUrl: process.env.NEWS_API_BASE_URL || 'https://newsapi.org/v2',
        pageSize: parseInt(process.env.NEWS_PAGE_SIZE, 10) || 20,
    },
    cache: {
        ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 15 * 60,
        refreshIntervalMs:
            parseInt(process.env.CACHE_REFRESH_INTERVAL_MS, 10) || 15 * 60 * 1000,
        enableBackgroundRefresh:
            (process.env.CACHE_BACKGROUND_REFRESH || 'false').toLowerCase() === 'true',
    },
};

module.exports = config;

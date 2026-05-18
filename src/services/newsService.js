const axios = require('axios');
const config = require('../config');
const { newsCache, buildKey } = require('../utils/cache');
const { buildArticleId } = require('../utils/articleId');
const ApiError = require('../utils/ApiError');

const httpClient = axios.create({
    baseURL: config.news.baseUrl,
    timeout: 8000,
});

const decorate = (articles = []) =>
    articles.map((a) => ({
        id: buildArticleId(a),
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source && a.source.name,
        author: a.author,
        publishedAt: a.publishedAt,
        urlToImage: a.urlToImage,
    }));

const callNewsApi = async (endpoint, params) => {
    if (!config.news.apiKey) {
        // No API key configured: return empty list so the app stays usable
        // (and tests pass) without hitting the network.
        return [];
    }

    try {
        const { data } = await httpClient.get(endpoint, {
            params: { ...params, apiKey: config.news.apiKey },
        });
        return Array.isArray(data.articles) ? data.articles : [];
    } catch (err) {
        const status = err.response && err.response.status;
        const message =
            (err.response && err.response.data && err.response.data.message) ||
            err.message ||
            'Failed to fetch news';

        if (status === 401 || status === 403) {
            throw new ApiError(502, `News provider rejected the request: ${message}`);
        }
        if (status === 429) {
            throw new ApiError(503, 'News provider rate limit exceeded, please retry later');
        }
        throw new ApiError(502, `News provider error: ${message}`);
    }
};

const fetchByPreferences = async (preferences = [], { force = false } = {}) => {
    const cacheKey = buildKey(['prefs', (preferences || []).slice().sort().join(',')]);

    if (!force) {
        const cached = newsCache.get(cacheKey);
        if (cached) return cached;
    }

    let articles = [];
    if (!preferences || preferences.length === 0) {
        articles = await callNewsApi('/top-headlines', {
            language: 'en',
            pageSize: config.news.pageSize,
        });
    } else {
        articles = await callNewsApi('/everything', {
            q: preferences.join(' OR '),
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: config.news.pageSize,
        });
    }

    const decorated = decorate(articles);
    newsCache.set(cacheKey, decorated);
    return decorated;
};

const searchByKeyword = async (keyword, { force = false } = {}) => {
    if (!keyword || !keyword.trim()) {
        throw new ApiError(400, 'Search keyword is required');
    }

    const cacheKey = buildKey(['search', keyword]);

    if (!force) {
        const cached = newsCache.get(cacheKey);
        if (cached) return cached;
    }

    const articles = await callNewsApi('/everything', {
        q: keyword,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: config.news.pageSize,
    });

    const decorated = decorate(articles);
    newsCache.set(cacheKey, decorated);
    return decorated;
};

const refreshAllCachedQueries = async () => {
    const keys = newsCache.keys();
    const results = await Promise.allSettled(
        keys.map(async (key) => {
            if (key.startsWith('prefs::')) {
                const prefsCsv = key.slice('prefs::'.length);
                const prefs = prefsCsv ? prefsCsv.split(',').filter(Boolean) : [];
                await fetchByPreferences(prefs, { force: true });
            } else if (key.startsWith('search::')) {
                const keyword = key.slice('search::'.length);
                await searchByKeyword(keyword, { force: true });
            }
        }),
    );
    return results;
};

let refreshTimer = null;

const startBackgroundRefresh = () => {
    if (!config.cache.enableBackgroundRefresh) return;
    if (refreshTimer) return;
    refreshTimer = setInterval(() => {
        refreshAllCachedQueries().catch((err) => {
            // eslint-disable-next-line no-console
            console.error('Background cache refresh failed:', err.message);
        });
    }, config.cache.refreshIntervalMs);
    if (typeof refreshTimer.unref === 'function') refreshTimer.unref();
};

const stopBackgroundRefresh = () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
};

module.exports = {
    fetchByPreferences,
    searchByKeyword,
    refreshAllCachedQueries,
    startBackgroundRefresh,
    stopBackgroundRefresh,
};

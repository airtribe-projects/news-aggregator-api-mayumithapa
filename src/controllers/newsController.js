const newsService = require('../services/newsService');
const userStore = require('../store/userStore');
const ApiError = require('../utils/ApiError');

const findArticleInCache = (articleId) => {
    // Look through all cached query results for a matching article so the
    // user can mark anything they've seen as read/favorite.
    const { newsCache } = require('../utils/cache');
    for (const key of newsCache.keys()) {
        const list = newsCache.get(key) || [];
        const match = list.find((a) => a.id === articleId);
        if (match) return match;
    }
    return undefined;
};

const getNews = async (req, res) => {
    const articles = await newsService.fetchByPreferences(req.user.preferences || []);
    res.status(200).json({ news: articles });
};

const searchNews = async (req, res) => {
    const { keyword } = req.params;
    const articles = await newsService.searchByKeyword(keyword);
    res.status(200).json({ keyword, news: articles });
};

const markRead = async (req, res) => {
    const { id } = req.params;
    const article = findArticleInCache(id) || { id };
    userStore.markRead(req.user.id, id, article);
    res.status(200).json({
        message: 'Article marked as read',
        articleId: id,
    });
};

const markFavorite = async (req, res) => {
    const { id } = req.params;
    const article = findArticleInCache(id) || { id };
    userStore.markFavorite(req.user.id, id, article);
    res.status(200).json({
        message: 'Article marked as favorite',
        articleId: id,
    });
};

const listRead = async (req, res) => {
    res.status(200).json({ news: userStore.listRead(req.user.id) });
};

const listFavorites = async (req, res) => {
    res.status(200).json({ news: userStore.listFavorites(req.user.id) });
};

module.exports = {
    getNews,
    searchNews,
    markRead,
    markFavorite,
    listRead,
    listFavorites,
};

const crypto = require('crypto');

// External news articles don't have stable IDs of their own, so we derive
// a deterministic short hash from the article URL (falling back to title).
const buildArticleId = (article = {}) => {
    const seed = article.url || article.title || JSON.stringify(article);
    return crypto.createHash('sha1').update(String(seed)).digest('hex').slice(0, 16);
};

module.exports = { buildArticleId };

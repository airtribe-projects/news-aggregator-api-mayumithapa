// Simple in-memory user store. Keyed by lowercased email for fast lookup.
// Each user record holds the hashed password, preferences, and per-user
// article tracking maps (read / favorite).

const users = new Map();
let nextId = 1;

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const createUser = ({ name, email, passwordHash, preferences = [] }) => {
    const key = normalizeEmail(email);
    const user = {
        id: nextId++,
        name,
        email: key,
        passwordHash,
        preferences,
        readArticles: new Map(),
        favoriteArticles: new Map(),
        createdAt: new Date().toISOString(),
    };
    users.set(key, user);
    return user;
};

const findByEmail = (email) => users.get(normalizeEmail(email));

const findById = (id) => {
    for (const user of users.values()) {
        if (user.id === id) return user;
    }
    return undefined;
};

const updatePreferences = (id, preferences) => {
    const user = findById(id);
    if (!user) return undefined;
    user.preferences = preferences;
    return user;
};

const markRead = (id, articleId, article) => {
    const user = findById(id);
    if (!user) return undefined;
    user.readArticles.set(articleId, {
        article,
        readAt: new Date().toISOString(),
    });
    return user.readArticles.get(articleId);
};

const markFavorite = (id, articleId, article) => {
    const user = findById(id);
    if (!user) return undefined;
    user.favoriteArticles.set(articleId, {
        article,
        favoritedAt: new Date().toISOString(),
    });
    return user.favoriteArticles.get(articleId);
};

const listRead = (id) => {
    const user = findById(id);
    if (!user) return [];
    return Array.from(user.readArticles.values());
};

const listFavorites = (id) => {
    const user = findById(id);
    if (!user) return [];
    return Array.from(user.favoriteArticles.values());
};

// Test helper, not exposed via routes.
const _reset = () => {
    users.clear();
    nextId = 1;
};

module.exports = {
    createUser,
    findByEmail,
    findById,
    updatePreferences,
    markRead,
    markFavorite,
    listRead,
    listFavorites,
    _reset,
};

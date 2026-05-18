const express = require('express');
const newsController = require('../controllers/newsController');
const authenticate = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(newsController.getNews));

// Static segments must be declared BEFORE the dynamic ':id' routes to avoid
// 'read'/'favorites' being captured as an article id.
router.get('/read', asyncHandler(newsController.listRead));
router.get('/favorites', asyncHandler(newsController.listFavorites));
router.get('/search/:keyword', asyncHandler(newsController.searchNews));

router.post('/:id/read', asyncHandler(newsController.markRead));
router.post('/:id/favorite', asyncHandler(newsController.markFavorite));

module.exports = router;

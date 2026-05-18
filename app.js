const express = require('express');
const config = require('./src/config');
const usersRouter = require('./src/routes/users');
const newsRouter = require('./src/routes/news');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const newsService = require('./src/services/newsService');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/users', usersRouter);
app.use('/news', newsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Only listen when run directly. When required by tests, supertest binds an
// ephemeral port itself, so we skip listen() to avoid a port conflict.
if (require.main === module) {
    app.listen(config.port, (err) => {
        if (err) {
            // eslint-disable-next-line no-console
            return console.log('Something bad happened', err);
        }
        // eslint-disable-next-line no-console
        console.log(`Server is listening on ${config.port}`);
        newsService.startBackgroundRefresh();
    });
}

module.exports = app;

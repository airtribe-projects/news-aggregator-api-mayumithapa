# News Aggregator API

A RESTful Node.js / Express service that lets users register, store news
preferences, and fetch personalized news articles from an external provider
([NewsAPI](https://newsapi.org)). Includes JWT-based authentication, input
validation, request-level error handling, in-memory caching, and optional
read/favorite tracking and search.

> Airtribe Backend Engineering Launchpad — Assignment 2

---

## Features

- `POST /users/signup` — register with name, email, password, and preferences.
  Passwords are hashed with `bcryptjs`.
- `POST /users/login` — verify credentials and issue a signed JWT.
- `GET /users/preferences` / `PUT /users/preferences` — read or update the
  signed-in user's news preferences. Protected by JWT middleware.
- `GET /news` — fetch news articles for the signed-in user based on their
  preferences. Results are cached in-process to reduce upstream calls.
- `GET /news/search/:keyword` — keyword search against the news provider.
- `POST /news/:id/read` / `GET /news/read` — mark and list read articles.
- `POST /news/:id/favorite` / `GET /news/favorites` — mark and list favorites.
- Optional background cache refresh, controlled by env flag.
- Centralized error handling with structured JSON responses.

---

## Project structure

```
.
├── app.js                       # express app + listener
├── src/
│   ├── config/                  # env-driven config
│   ├── controllers/             # request handlers
│   ├── middleware/              # auth, validation, error handling
│   ├── routes/                  # express routers
│   ├── services/                # NewsAPI integration + caching
│   ├── store/                   # in-memory user store
│   ├── utils/                   # cache, asyncHandler, ApiError, ids
│   └── validators/              # Joi schemas
├── test/server.test.js          # tap + supertest test suite
├── .env.example
├── package.json
└── README.md
```

---

## Getting started

### Prerequisites
- Node.js **>= 18** (tested on Node 22)
- npm

### Installation

```bash
git clone https://github.com/airtribe-projects/news-aggregator-api-mayumithapa.git
cd news-aggregator-api-mayumithapa
npm install
cp .env.example .env   # then fill in JWT_SECRET and (optionally) NEWS_API_KEY
```

> On Windows PowerShell use `Copy-Item .env.example .env`.

### Run

```bash
npm run dev      # nodemon, auto-reload
# or
npm start        # plain node
```

Server defaults to <http://localhost:3000>. A health probe is available at
`GET /health`.

### Test

```bash
npm test
```

Tests use `tap` + `supertest` and exercise the API surface end-to-end. They do
not require a `NEWS_API_KEY` — the `/news` endpoint gracefully returns an empty
list when no key is configured.

---

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `JWT_SECRET` | `change-me-in-production` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | `1d` | JWT lifetime (any `ms`-style string) |
| `BCRYPT_SALT_ROUNDS` | `10` | Cost factor for `bcryptjs` |
| `NEWS_API_KEY` | _(empty)_ | NewsAPI key. When empty, `/news` returns `[]`. |
| `NEWS_API_BASE_URL` | `https://newsapi.org/v2` | Override for testing/mocking |
| `NEWS_PAGE_SIZE` | `20` | Articles per request |
| `CACHE_TTL_SECONDS` | `900` | News cache TTL |
| `CACHE_REFRESH_INTERVAL_MS` | `900000` | Background refresh cadence |
| `CACHE_BACKGROUND_REFRESH` | `false` | Set `true` to enable periodic refresh |

---

## API reference

All authenticated routes expect `Authorization: Bearer <token>`.

### `POST /users/signup`
Register a new user.
```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```
**200** — `{ "message": "...", "user": { ... } }`
**400** — validation error (missing/invalid fields)
**409** — email already exists

### `POST /users/login`
```json
{ "email": "clark@superman.com", "password": "Krypt()n8" }
```
**200** — `{ "message": "...", "token": "<JWT>", "user": { ... } }`
**401** — invalid credentials

### `GET /users/preferences`
**200** — `{ "preferences": ["movies", "comics"] }`
**401** — missing/invalid token

### `PUT /users/preferences`
```json
{ "preferences": ["movies", "comics", "games"] }
```
**200** — `{ "message": "...", "preferences": [...] }`

### `GET /news`
Returns articles matched against the user's preferences.
**200** — `{ "news": [ { id, title, description, url, source, ... } ] }`

### `GET /news/search/:keyword`
**200** — `{ "keyword": "...", "news": [ ... ] }`

### `POST /news/:id/read` · `POST /news/:id/favorite`
Mark an article (by the id returned in `/news`) as read or favorited.
**200** — `{ "message": "...", "articleId": "..." }`

### `GET /news/read` · `GET /news/favorites`
List the current user's read or favorite articles.
**200** — `{ "news": [ { article, readAt|favoritedAt } ] }`

---

## Error response shape

```json
{
  "error": "Invalid request payload",
  "details": {
    "fields": [
      { "field": "email", "message": "\"email\" is required" }
    ]
  }
}
```

---

## Notes & limitations
- User data is stored **in-memory** for assignment purposes and is reset when
  the process restarts. Swap `src/store/userStore.js` for a real database
  (Mongo, Postgres, etc.) in production.
- The cache is process-local (`node-cache`). For multi-instance deployments
  use Redis or another shared store.
- The background refresh loop is disabled by default; enable it with
  `CACHE_BACKGROUND_REFRESH=true`.

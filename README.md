# PMI Ecommerce Backend

Express API with a feature-based layout: routes stay thin, business logic lives in modules, and errors are handled in one place.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

- `GET /` — API info
- `GET /api/health` — health check

## Layout

```
src/
  server.js              # process entry, graceful shutdown
  app.js                 # Express app (middleware + routes)
  config/env.js          # environment
  routes/index.js        # mount /api modules
  middleware/            # 404 + error handler
  utils/                 # AppError, asyncHandler, response shape
  modules/<feature>/     # routes + controller (+ service/model later)
```

Add a feature as `src/modules/<name>/`, then mount it in `src/routes/index.js`.

# PMI Ecommerce Backend

Express API with a feature-based layout: routes stay thin, business logic lives in modules, and errors are handled in one place.

## Run

```bash
npm install
copy .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL database, then:

```bash
npx prisma migrate dev --name init
npm run dev
```

- `GET /` — API info
- `GET /api/health` — health + database ping

Prisma Client is generated on `npm install`. Use `src/db/prisma.js` in services — never create a second `PrismaClient`.

## Layout

```
src/
  server.js              # process entry, graceful shutdown
  app.js                 # Express app (middleware + routes)
  config/env.js          # environment
  db/prisma.js           # singleton Prisma Client
  db/mapPrismaError.js   # Prisma → HTTP errors
  routes/index.js        # mount /api modules
  middleware/            # 404 + error handler
  utils/                 # AppError, asyncHandler, response shape
  modules/<feature>/     # routes + controller (+ service/model later)
```

Add a feature as `src/modules/<name>/`, then mount it in `src/routes/index.js`.

Put tables in `prisma/schema.prisma`, then `npm run prisma:migrate`. Query them through `src/db/prisma.js`.

<!-- //module and package -->

node_modules/ Installed packages
index.js /Main server file
package.json /Project configuration
package-lock.json /Dependency lockfile

<!-- //common comand to migarte model in database -->

npx prisma validate
npx prisma migrate dev --name init
npx prisma generate

<!-- prisma validate checks your Prisma schema.
prisma migrate dev creates and applies a database migration.
prisma generate generates the Prisma Client used by your application. -->

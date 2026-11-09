# PMI Ecommerce Backend

Express + Prisma API designed to match the existing Next.js frontend contract in `pmi-ecom-fe` (`src/lib/api.ts`).

## Setup

```bash
npm install
copy .env.example .env
# set DATABASE_URL to your PostgreSQL database
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

API base: `http://localhost:5000/api`

Point the frontend at it:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In development, OTP codes are logged to the server console and returned in responses when `EXPOSE_OTP=true`.

## Architecture

```
src/
  app.js / server.js
  config/env.js
  db/prisma.js
  middleware/auth.js, errorHandler.js, notFound.js
  modules/
    auth/      OTP register/login, firebase, profile
    product/   categories, products, search, banners
    cart/      add/update/remove/list
    order/     address, purchases, latest order
    event/     home, upcoming, event details
    cms/       stores, terms, compliance, gallery
  utils/       apiResponse, serializers, pagination, validate
```

## Auth flow

1. `POST /api/register/otp/send` or `POST /api/login/otp/send`
2. `POST /api/*/otp/verify` → `{ data: { token, user } }`
3. Frontend stores JWT in `auth_token` cookie and sends `Authorization: Bearer <token>`

## Response shape

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": { "field": ["..."] } }
```

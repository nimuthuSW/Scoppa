# sċoppa — e-commerce store

A full-stack store built with Next.js 16 (App Router), Prisma 7 + SQLite/Turso, Auth.js (NextAuth v5), Stripe Checkout, and Tailwind CSS 4.

**Features**: product catalog with categories + search, stock-aware cart (localStorage), credentials auth, Stripe-powered checkout with server-side price/stock validation, order history, webhook-driven order fulfillment, and a role-gated admin panel (product CRUD + order status management).

## Local development

```bash
npm install
cp .env.example .env       # then fill in the values
npx prisma migrate dev     # create the local SQLite db
npm run db:seed            # seed products + admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [.env.example](.env.example). You need at minimum `DATABASE_URL`, `AUTH_SECRET`, and the two Stripe keys. `ADMIN_EMAIL`/`ADMIN_PASSWORD` control the admin account the seed script creates.

### Testing payments locally

Use Stripe test keys and card `4242 4242 4242 4242` (any future expiry / any CVC). Orders are confirmed on the checkout success page even without a webhook; to also test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

## How checkout works

1. `POST /api/checkout` re-reads every cart item from the database (the client only sends product ids + quantities), validates stock, creates a `pending` order, and starts a Stripe Checkout Session.
2. Stripe redirects back to `/checkout/success`, which verifies the session is paid, then confirms the order and decrements stock (idempotently — the webhook can do the same job first).
3. `checkout.session.expired` webhooks cancel abandoned pending orders.

## Deploying (Vercel + Turso)

1. **Database** — create a [Turso](https://turso.tech) database, then set `DATABASE_URL=libsql://...` and `DATABASE_AUTH_TOKEN`. Apply the schema by running `npm run db:migrate` (and optionally `npm run db:seed`) locally with those production values.
2. **Vercel** — import the repo; `postinstall` runs `prisma generate` automatically. Set all env vars from `.env.example` (use **live** Stripe keys and a strong, fresh `AUTH_SECRET` + `ADMIN_PASSWORD`).
3. **Stripe webhook** — in the Stripe dashboard add an endpoint for `https://your-domain.com/api/webhooks/stripe` subscribed to `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and set the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Admin

Sign in with the seeded admin account and open `/admin` (also linked in the navbar) to manage products and order statuses.

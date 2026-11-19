# The Gentlemen's Atelier

AI-assisted, multi-vendor menswear marketplace. Next.js (frontend + backend) · TypeScript · Tailwind CSS ·
Neon (PostgreSQL) via Prisma · JWT auth with RBAC · Cloudinary image storage · Gemini AI chatbot · PayHere
sandbox checkout.

This project is built to run on **localhost only**   there is no deployment step.

## 1. Prerequisites

- Node.js 20+
- A free [Neon](https://neon.tech) Postgres database
- A free [Cloudinary](https://cloudinary.com) account
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- A [PayHere](https://www.payhere.lk) **sandbox** merchant account (sandbox mode only, no real payments)

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in every value   every key, secret, and URL used by this
project is read from environment variables, never hardcoded in source:

```
cp .env.example .env.local
```

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon dashboard → **Pooled connection** string (used by the running app) |
| `DIRECT_URL` | Neon dashboard → **Direct connection** string (used only by `prisma migrate`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Two different long random strings, e.g. `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | How long each token lasts, e.g. `15m` and `7d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary dashboard → Account Details |
| `GEMINI_API_KEY` | Google AI Studio → Get API key |
| `GEMINI_MODEL` | Any current Gemini model name, e.g. `gemini-flash-lite-latest` |
| `PAYHERE_MERCHANT_ID` / `PAYHERE_MERCHANT_SECRET` | PayHere sandbox merchant dashboard |
| `PAYHERE_MODE` | `sandbox` (keep this for local/academic use) |
| `PAYHERE_TRUST_RETURN_REDIRECT` | `true` for local demo   see payment note below |
| `NEXT_PUBLIC_APP_URL` | Leave as `http://localhost:3000` |

### Auth model

The app uses a short-lived JWT **access token** plus a long-lived JWT **refresh token**, both in
httpOnly cookies. `proxy.ts` silently rotates an expired access token from a still-valid refresh
token on page navigation; client-side API calls go through `lib/apiFetch.ts`, which retries once via
`/api/auth/refresh` on a `401` before giving up. Logging out clears both cookies.

### Payment verification note

PayHere's `notify_url` webhook is a server-to-server callback   it can never reach `localhost`. This
project is built to run on localhost only, so there is no real way to verify a sandbox payment
server-side here. `PAYHERE_TRUST_RETURN_REDIRECT=true` makes the app trust the PayHere sandbox popup's
own in-browser "payment approved" signal (`onCompleted`) and flips the order status immediately   this
is intentionally insecure and for local academic demonstration only. A real deployment would set this
to `false` and rely solely on the signed `notify_url` webhook (already implemented and signature-verified
in `app/api/payments/payhere/notify/route.ts`) from a publicly reachable URL.

## 3. Install, migrate, seed

```
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seeded accounts (change the passwords once you're in):

- Admin   `admin@gentlemensatelier.com` / `Admin@12345`
- Vendor (pre-approved, with 5 sample products)   `vendor@gentlemensatelier.com` / `Vendor@12345`

New customer and vendor accounts can also be created from `/register`. New vendors start as **PENDING**
and must be approved by the Admin under **Admin → Vendors** before their products appear in the store.

## 4. Testing checkout (PayHere sandbox)

Checkout opens the real PayHere sandbox popup. Use PayHere's published sandbox test card
(`4916217501611292`, any future expiry, any CVC) to simulate a successful payment   no money moves.
On success the order's payment status flips to **APPROVED**, stock is decremented, and the order
status advances automatically.

## 5. Project layout

- `app/(storefront)`   public site: home, products, product detail, cart drawer, checkout, login/register, account
- `app/admin`   admin dashboard (users, vendor approvals, categories, products, orders, audit log)
- `app/vendor`   vendor dashboard (store profile, products, incoming orders)
- `app/api`   all backend route handlers (auth, products, cart, orders, payments, chat, uploads)
- `prisma/schema.prisma`   database schema; `prisma/seed.ts`   seed script
- `lib/`   auth/JWT (access+refresh), RBAC, Cloudinary, Gemini, PayHere, validation helpers, `apiFetch` client wrapper
- `proxy.ts`   route-level auth/RBAC gate with silent access-token rotation (Next.js 16's renamed `middleware`)

## Notes

- No machine-learning recommendation engine is used anywhere in this project by design   the homepage
  "Featured" and "New Arrivals" sections are plain database queries. The only AI feature is the Gemini
  shopping assistant chat widget.
- Payments are processed only through the PayHere **sandbox**   this is an academic demo and no real
  transaction ever occurs.

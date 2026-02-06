# Pubs with Playgrounds — Venue Finder (Next.js + Supabase)

This is the front-end website for searching venues near you.

## 1) Setup
1. Create a Supabase project
2. Create tables using the SQL in `/db/supabase.sql` (see zip root)
3. Set env vars:

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages
- `/` list view (near-me + suburb search + filters)
- `/map` map view
- `/add` submission form

## Notes
- Submissions go into `venue_submissions` (pending). Approve using the moderation script in `/importer/moderate.mjs`.


## Stripe (optional self-serve payments)
This project includes Stripe Checkout + webhook endpoints:
- POST `/api/stripe/checkout`
- POST `/api/stripe/webhook`

Add these env vars in Vercel (server-side):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_FEATURED_MONTHLY`
- `STRIPE_PRICE_FEATURED_ANNUAL`
- `STRIPE_PRICE_CLAIMED_PLUS`
- `NEXT_PUBLIC_APP_URL` (e.g. https://pubswithplaygrounds.com.au)

Webhook needs Supabase admin env vars (server-side only):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`



## Admin moderation (recommended)
This project includes an admin UI:
- `/admin/login`
- `/admin`

It is protected by an admin password cookie set by `/api/admin/login`.

Add this env var in Vercel (server-side):
- `ADMIN_PASSWORD` (choose a strong one)

Admin APIs also require (server-side):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`


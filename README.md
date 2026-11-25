# eCore Business Website

Responsive B2B business information, marketing database, and lead generation
website built with Next.js, TypeScript, Tailwind CSS, and React.

## Architecture

- `src/app/` contains marketing pages and App Router API handlers.
- `src/components/` contains reusable marketing, form, and admin UI.
- `src/lib/` contains server-only MongoDB/JSON storage, authentication, rate
  limiting, email, and private object-storage helpers.
- `src/models/` contains the Mongoose models and indexes used by production.
- `src/types/local-store.ts` defines the persisted record types.
- `src/utils/` contains Zod validation schemas and shared API contracts.
- `public/` contains static artwork. Sample files remain in private S3-compatible
  storage and are not placed in `public/`.
- `scripts/` contains local admin setup, seed utilities, and tests.

Production uses MongoDB through Mongoose. Contact submissions, enquiries,
download requests, newsletter subscriptions, products, services, admin users,
sessions, rate limits, and site content are stored in separate MongoDB
collections with unique, query, and expiry indexes.

Local development without `MONGODB_URI` uses JSON files under `data/` and
`.local-data/`. Writes are serialized within the local Node process and saved
through atomic file replacement; malformed files are reported without
overwriting their contents. Existing enquiry and download-request records are
copied from the legacy store on first use.

In local development, products, services, site content, admin credentials and
sessions, and rate-limit counters remain in `.local-data/store.json`. Both
storage locations are ignored by Git.

Admin passwords use salted scrypt hashes. Session cookies contain opaque tokens;
only SHA-256 token hashes are persisted. Role checks and same-origin checks
remain enforced by the API. MongoDB admin email addresses, product names,
service slugs, and newsletter addresses are unique; expired sessions and rate
limit buckets are removed by MongoDB TTL indexes.

## Important storage limitation

**JSON storage is for local development only.** Production mode uses MongoDB
and rejects local JSON storage. A serverless filesystem is not durable or
shared between instances, and the local store is not a production database.

The JSON files are plaintext and may contain personal customer information and
password hashes. Restrict access to your computer, do not copy them into source
control, and do not put production data in them. Local JSON data is not
automatically uploaded to MongoDB.

## Run locally

Requirements: Node.js 22–24 and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `MONGODB_URI`,
create a local admin account from another terminal:

```powershell
npm run create:admin -- admin@example.com "Admin Name" superadmin
```

Enter and confirm a 12–128 character password at the hidden prompts. Sign in at
`/admin/login`. The account is saved in `.local-data/store.json`. If
`MONGODB_URI` is set, admin setup and seed scripts target that database instead.

Seed the default products, services, FAQs, testimonials, and contact details:

```powershell
npm run seed:products
npm run seed:admin-content
```

The contact form saves to `data/contact.json`; the general enquiry endpoint
saves to `data/enquiries.json`. SMTP notification is sent only when valid SMTP
settings are configured; otherwise the API reports that the notification is
delayed. Valid sample requests are saved even when their sample file is
unavailable; the response clearly tells the customer that the team will follow
up instead of presenting a fake download link. Actual sample uploads and
downloads still require private S3-compatible storage credentials. Never use
`NEXT_PUBLIC_*` variables for secrets.

Set `MONGODB_URI` in an ignored `.env.local` file to use MongoDB during local
development. Never commit the URI or expose it through a `NEXT_PUBLIC_*`
variable.

## API overview

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/contact` | Public, rate-limited | Validate and save a contact submission |
| `POST /api/enquiries` | Public, rate-limited | Validate and save a general enquiry |
| `GET /api/enquiries` | Session | Search and paginate contact submissions and enquiries |
| `GET/PATCH/DELETE /api/enquiries/[id]` | Session / admin | Read, update, or delete an enquiry |
| `POST /api/newsletter` | Public, rate-limited | Save a deduplicated newsletter subscription |
| `POST /api/admin/login` | Public, rate-limited | Issue a session cookie |
| `POST /api/admin/logout` | Session | Revoke the current session |
| `GET /api/admin/session` | Session | Return the current admin identity |
| `GET /api/admin/dashboard` | Session | CRM statistics and seven-day activity |
| `GET/POST /api/products` | Public / admin | List active products or create one |
| `GET/PATCH/DELETE /api/products/[id]` | Public / admin | Read, update, or deactivate a product |
| `GET /api/admin/products` | Admin | Search and manage all products |
| `GET/POST /api/admin/services` | Admin | Search, list, and create services |
| `PATCH/DELETE /api/admin/services/[id]` | Admin | Edit or deactivate a service |
| `GET/PATCH /api/admin/content` | Admin | Manage FAQs, testimonials, and contact details |
| `POST /api/download-requests` | Public, rate-limited | Save a sample request and issue a link when available |
| `GET /api/download-requests` | Session | Search sample requests |
| `GET /api/downloads/[token]` | Signed token | Redirect to a short-lived private-file URL |

Public forms retain server-side Zod validation, honeypots, and rate limiting.
Product/service deletion deactivates records. Uploaded files remain private and
are validated before attachment to products.

## Validation

```powershell
npm run typecheck
npm run lint
npm run test:security
npm run test:json
npm run test:database
npm run test:email
npm run build
```

`test:json` checks validation, public form routes, per-file persistence,
duplicate newsletter handling, corrupt-file safety, and concurrent writes in an
isolated temporary directory. `test:email` uses a local SMTP stub and sends no
external email.

## Deployment

For Vercel production, configure `MONGODB_URI`, `SITE_URL`, and a strong
`DOWNLOAD_TOKEN_SECRET` in Project Settings → Environment Variables. `SITE_URL`
must be the HTTPS origin of the production site. If `SITE_URL` is omitted, the
app can use Vercel's system-provided production domain when system environment
variables are enabled. Vercel production builds fail early when MongoDB is not
configured. Keep SMTP and S3 credentials unset until those services are
configured; enquiry submissions are still saved in MongoDB when SMTP is
unavailable, and private file upload/download requires S3-compatible storage.

Seed initial products, services, and public content with the seed scripts after
setting the intended `MONGODB_URI`. Create the first production administrator
with `npm run create:admin` in an interactive terminal. Local JSON data is not
automatically migrated; back up and review any data before importing it.

## Data flow

```text
Browser
  ├─ Next.js pages and admin dashboard
  ├─ Axios → route handlers → Zod validation / shared rate limits
  │    ├─ production → MongoDB Atlas via Mongoose
  │    └─ local development without MONGODB_URI → ignored JSON files
  ├─ SMTP TLS → enquiry notification mailbox (optional)
  └─ signed URLs → private S3-compatible storage for product files
```

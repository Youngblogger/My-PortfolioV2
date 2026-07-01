# CODEMAFIA Ecosystem — Backend Documentation

## Architecture Overview

```
nextjs-frontend (Vercel/shared hosting)
    |
    | HTTPS + Bearer Token
    |
laravel-backend (cPanel shared hosting)
    |
    | Eloquent ORM
    |
mysql-database (cPanel MySQL 8+)
```

- **Frontend**: Next.js 16 app (`/src`) → calls `NEXT_PUBLIC_API_URL` (e.g. `https://api.codemafia.ng/api/v1`)
- **Backend**: Laravel 12 app (`/backend`) → serves JSON API + manages DB, payments, emails
- **Auth**: Laravel Sanctum token-based. Login/register returns a token stored in `localStorage`.
- **Payments**: Paystack (primary) and Flutterwave (fallback) via unified `PaymentService`.

---

## Quick Start

### Prerequisites
- PHP 8.3+
- Composer 2.x
- MySQL 8+ or MariaDB 10.6+
- Node.js 20+ (for frontend)

### Backend Setup

```bash
cd backend
cp .env.example.laravel .env
# Edit .env with your DB credentials, API keys, etc.
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
php artisan serve
```

### Frontend Setup

```bash
# From project root
cp frontend.env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm install
npm run dev
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Required |
|---|---|---|
| `APP_KEY` | Laravel encryption key | Yes |
| `APP_URL` | Backend URL | Yes |
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port (3306) | Yes |
| `DB_DATABASE` | Database name | Yes |
| `DB_USERNAME` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes (frontend) |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook signature | Yes |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key | Optional |
| `FLUTTERWAVE_ENCRYPTION_KEY` | Flutterwave encryption key | Optional |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Flutterwave webhook secret | Optional |
| `MAIL_*` | SMTP credentials | Optional |
| `SANCTUM_STATEFUL_DOMAINS` | SPA domains (comma-separated) | If SPA auth |

### Frontend (`.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

Responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get token |
| GET | `/auth/user` | Yes | Get authenticated user |
| POST | `/auth/logout` | Yes | Revoke current token |

### Courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/courses` | No | List published courses |
| GET | `/courses/{slug}` | No | Get course by slug (with modules & tiers) |
| GET | `/courses/stack/{stackId}` | No | Filter courses by stack |

### Checkout & Enrollments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/checkout` | Yes | Initiate checkout (returns payment URL) |
| POST | `/enrollments` | Yes | Free enrollment (no payment) |
| GET | `/enrollments` | Yes | Get user's enrollment by ID |

### Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/initialize` | Yes | Initialize payment transaction |
| GET | `/payments/verify` | Yes | Verify payment status |
| POST | `/payments/webhook/{gateway}` | No | Paystack/Flutterwave webhook |

### Invoices & Receipts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/invoice` | Yes | Get invoice by enrollment ID |
| GET | `/invoice/pdf` | Yes | Download invoice as PDF |
| GET | `/receipt` | Yes | Get receipt by enrollment ID |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Yes | Get current user profile |
| PATCH | `/users` | Yes | Update profile |
| GET | `/users/dashboard` | Yes | Get dashboard data |

### Other

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/coupons/validate` | Yes | Validate a coupon code |
| POST | `/contact` | No | Submit contact form |
| POST | `/request-quote` | No | Request a project quote |

---

## CORS Configuration

This application uses a two-layer CORS strategy for production reliability.

### Layer 1: Laravel HandleCors (config/cors.php)

The `config/cors.php` file controls how Laravel's built-in `HandleCors` middleware responds to CORS preflight requests and adds headers to normal responses.

Key settings:
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
    'https://codemafia.ng',
    'https://www.codemafia.ng',
],
'supports_credentials' => true,
```

**Never use `'*'` with `supports_credentials => true`** — the browser will reject the response.

The frontend sends `credentials: "include"` on all fetch requests (see `src/lib/api.ts`), so `supports_credentials` **must** be `true` and origins **must** be explicit.

### Layer 2: Apache .htaccess (public/.htaccess)

The `.htaccess` file sets CORS headers at the Apache level using `Header always set`. This catches **all** responses including:
- PHP fatal errors (white screen of death)
- 404/500 error pages
- Static files served directly by Apache
- Requests that never reach Laravel

```apache
SetEnvIf Origin "http://localhost:3000$" CORSHostAllowed=true
SetEnvIf Origin "https://codemafia\.ng$" CORSHostAllowed=true
SetEnvIf Origin "https://www\.codemafia\.ng$" CORSHostAllowed=true
Header always set Access-Control-Allow-Origin %{HTTP_ORIGIN}e env=CORSHostAllowed
```

### Adding a New Allowed Origin

You must update **both** layers:

1. `backend/config/cors.php` — add to `allowed_origins`
2. `backend/public/.htaccess` — add a `SetEnvIf Origin` line
3. `backend/.htaccess` — add a `SetEnvIf Origin` line (root-level fallback)

Optionally use the `FRONTEND_URL` environment variable in `cors.php` for the primary frontend URL.

### CORS Verification Commands

Test preflight (OPTIONS) requests against every endpoint type:

```bash
# Public GET endpoint
curl -X OPTIONS "https://codemafia.ng/api/v1/courses" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -I

# Authenticated POST endpoint
curl -X OPTIONS "https://codemafia.ng/api/v1/checkout" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -I

# Public auth endpoint
curl -X OPTIONS "https://codemafia.ng/api/v1/auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -I

# Test actual GET request with credentials
curl "https://codemafia.ng/api/v1/courses" \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -I
```

Expected response headers for all OPTIONS requests:
```
HTTP/2 204
access-control-allow-origin: http://localhost:3000
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-headers: Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-TOKEN
access-control-allow-credentials: true
access-control-max-age: 86400
vary: Origin
```

### Troubleshooting

If CORS still fails after deployment:

1. **Clear config cache**: `php artisan optimize:clear && php artisan config:cache`
2. **Verify the .htaccess is being processed**: Add `Header always set X-Debug "htaccess-loaded"` and check for it in the response
3. **Check for Cloudflare**: Ensure Cloudflare is not stripping `Origin` headers or caching OPTIONS responses (set page rule: `api.codemafia.ng/*` → Cache Level: Bypass)
4. **Verify the hosting server is Apache**: Some shared hosts use LiteSpeed which supports `.htaccess` but may have different header handling. Contact your host to confirm.

## Deployment

### cPanel Shared Hosting

1. Upload the `backend/` directory contents to your hosting (e.g. via Git or FTP)
2. Point your subdomain's document root to `backend/public/`
3. Run `composer install --optimize-autoloader --no-dev`
4. Configure `.env` with database credentials and API keys
5. Run `php artisan key:generate`
6. Run `php artisan migrate --force`
7. Run `php artisan config:cache` and `php artisan route:cache`
8. Set up cron job: `* * * * * php /path/to/artisan schedule:run`

### Using the deploy script

```bash
bash deploy.sh /path/to/deployment
```

See `deploy.sh` for full automation details.

---

## Maintenance

### Backup Database
```bash
php artisan db:backup
# Or via cPanel: phpMyAdmin export
```

### Clear Cache
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Update
```bash
git pull
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Testing

```bash
cd backend
cp .env.example.testing .env.testing
php artisan key:generate --env=testing
php artisan migrate --env=testing
php artisan test
```

Or run specific test suites:

```bash
php artisan test --filter AuthTest
php artisan test --filter CourseTest
php artisan test --filter CheckoutTest
php artisan test --filter PaymentTest
```

---

## Operations Runbook

### Deployment

```bash
# Backend
cd /var/www/codemafia/backend
cp .env.production .env        # edit DB credentials, keys
chmod +x deploy.sh && ./deploy.sh

# Frontend
cd /var/www/codemafia
cp .env.production .env.local
npm run build && npm start -p 3000
```

### Rollback

```bash
./rollback.sh <tag-or-commit>
```

Rolling back does NOT automatically restore the database. If migration rollback is required:

```bash
php artisan migrate:rollback --step=1
# or restore from backup:
gunzip < /var/backups/codemafia/codemafia_YYYYMMDD_HHMMSS.sql.gz | mysql codemafia
```

### Monitoring

A health endpoint is available at `GET /api/v1/health`. Expected response:

```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "app_env": "production",
    "app_debug": false,
    "database": "connected",
    "storage_symlink": "exists",
    "cache": "reachable",
    "queue_driver": "database"
  }
}
```

The `monitor.sh` script checks every 5 minutes via cron:

```cron
*/5 * * * * /var/www/codemafia/backend/monitor.sh
```

### Backup

Daily database + storage backups run at 3 AM:

```cron
0 3 * * * /var/www/codemafia/backend/backup.sh
```

Backups are stored in `/var/backups/codemafia/` for 30 days.

### Queue Worker (Supervisor)

```bash
sudo cp /var/www/codemafia/backend/supervisor.conf /etc/supervisor/conf.d/codemafia.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start codemafia-queue:*
sudo supervisorctl status
```

### Log Locations

| Log | Path | Retention |
|-----|------|-----------|
| Laravel errors | `backend/storage/logs/laravel-YYYY-MM-DD.log` | 30 days (daily rotation) |
| Queue worker | `/var/log/codemafia-queue.log` | 10 rotations of 50MB |
| Failed jobs | `php artisan queue:failed` | Keep indefinitely |
| Web server | `/var/log/nginx/error.log` | OS-configured |
| Monitor | `/var/log/codemafia-monitor.log` | OS-configured |

### Incident Response

| Severity | Response Time | Examples |
|----------|--------------|---------|
| Critical | < 15 min | Site down, payments failing, data loss |
| High | < 1 hour | Emails not sending, queue stopped, degraded performance |
| Medium | < 4 hours | Broken UI, non-critical API errors |
| Low | < 24 hours | Styling issues, typo, minor warnings |

**Critical Incident Steps:**

1. Verify with `curl https://codemafia.ng/api/v1/health`
2. Check `storage/logs/laravel*.log` for stack traces
3. Check queue: `php artisan queue:status` and `php artisan queue:failed`
4. Check DB: `php artisan db:show`
5. If needed, put app in maintenance: `php artisan down --retry=60`
6. Fix, test, then: `php artisan up`
7. Log the incident in the audit trail

### Payment Recovery

If a payment succeeds at the gateway but fails to process in the app:

1. Find the transaction reference in the gateway dashboard
2. Run: `php artisan tinker --execute="(new App\Services\Payments\PaymentService)->verifyPayment('paystack', 'REFERENCE')"`
3. If the gateway confirms success, trigger `ServiceOrderService::processVerifiedPayment()`
4. Verify the user's dashboard shows the payment and enrollment/order is active

### Customer Support Workflow

| Issue | Action |
|-------|--------|
| User can't register | Check `/api/v1/auth/register` logs, verify email not taken |
| User can't login | Check `/api/v1/auth/login` logs, trigger password reset |
| Payment failed | Check Paystack dashboard + `storage/logs/laravel*.log` |
| Course not accessible | Verify enrollment status in admin, check `enrollments` table |
| Email not received | Check `storage/logs/laravel*.log` for mail errors |
| Project status wrong | Update via admin panel, check `service_orders` table |
| Certificate missing | Generate via Admin > Academy > Certificates |

---

## Launch Readiness Checklist

- [ ] `APP_ENV=production` and `APP_DEBUG=false`
- [ ] SSL certificate valid and HTTPS enforced
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] Queue worker running via Supervisor
- [ ] Scheduler running via cron
- [ ] `QUEUE_CONNECTION=database`
- [ ] `SESSION_DRIVER=database`
- [ ] Database backups configured (daily + offsite)
- [ ] Monitoring active (health endpoint + monitor.sh cron)
- [ ] Paystack live keys configured
- [ ] Email SMTP credentials verified
- [ ] Storage symlink exists: `php artisan storage:link`
- [ ] All caches loaded: `config:cache`, `route:cache`, `view:cache`, `event:cache`
- [ ] robots.txt disallows admin/auth/api paths
- [ ] sitemap.xml submitted to Google Search Console
- [ ] Analytics tracking active
- [ ] Social share previews working
- [ ] Favicon and brand assets loading
- [ ] No debug logging: `LOG_LEVEL=error`
- [ ] Admin accounts created and tested
- [ ] Test transactions processed and refunded

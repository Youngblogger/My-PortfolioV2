# CORS Troubleshooting Guide

## Root Cause (Proven)

The production `.env` sets `FRONTEND_URL=https://codemafia.ng`.

In `config/cors.php`:
```php
// OLD (broken):
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),  // → 'https://codemafia.ng'
    'https://codemafia.ng',
    'https://www.codemafia.ng',
];
// Result: http://localhost:3000 is NOT in the list
```

Laravel's `HandleCors::isAllowedOrigin()` checks the request origin against this list.
`http://localhost:3000` is absent → `Access-Control-Allow-Origin` is **never set**.
Browser sees no ACAO header → **CORS failure**.

## The Fix (already applied)

```php
// FIXED:
'allowed_origins' => [
    'http://localhost:3000',  // ALWAYS present, env-independent
    env('FRONTEND_URL', 'https://codemafia.ng'),
    'https://codemafia.ng',
    'https://www.codemafia.ng',
];
```

## Immediate Action (must deploy)

### 1. Deploy code changes

Upload these changed files to production:
- `config/cors.php` ← **the critical fix**
- `public/.htaccess` ← CORS safety net + diagnostic header
- `.htaccess` ← root-level CORS fallback
- `config/session.php` ← missing session config
- `docs/CLOUDFLARE.md` ← reference
- `verify-cors.sh` ← verification script

### 2. Clear Laravel config cache

```bash
cd /path/to/backend
php artisan optimize:clear
php artisan config:cache
```

**This is mandatory.** Without it, the OLD config remains cached and our fix does nothing.

### 3. Verify with curl

Test from your development machine:

```bash
# 1. Preflight check for OPTIONS
curl -v -X OPTIONS "https://codemafia.ng/api/v1/courses" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" 2>&1 | grep -i "access-control"

# Expected output:
# < access-control-allow-origin: http://localhost:3000
# < access-control-allow-credentials: true
# < access-control-allow-methods: ...
# < access-control-allow-headers: ...
# < access-control-max-age: 86400
# < vary: Origin

# 2. Verify the debug header to confirm .htaccess is loaded:
curl -I "https://codemafia.ng/api/v1/courses" \
  -H "Origin: http://localhost:3000" 2>&1 | grep -i "x-cors-debug"

# Expected:
# < x-cors-debug: htaccess-loaded
```

### 4. If OPTIONS returns 204 BUT missing ACAO

The Laravel HandleCors responded (204) but didn't set ACAO. This means `isAllowedOrigin()` returned false — confirm `config/cors.php` has `http://localhost:3000` in `allowed_origins`.

### 5. If OPTIONS returns 301/302/307/308

An HTTP redirect is happening before Laravel executes.
Common causes:
- HTTP→HTTPS redirect by Cloudflare or server
- www→non-www redirect
- Trailing slash redirect (`.htaccess` line 3-5)
- `APP_URL` redirect in Laravel

Check the `Location` header to see where it redirects.

### 6. If OPTIONS returns 405/501

Apache or Cloudflare is rejecting the OPTIONS method.
- Cloudflare: check "Always Use HTTPS", WAF rules, Transform Rules
- Apache: check ModSecurity rules, `Limit` directives

### 7. If no OPTIONS response at all (connection timeout)

DNS issue, server down, or firewall blocking the port.

## Cloudflare Checklist

If Cloudflare is proxied (orange cloud), perform these checks:

```bash
# Check if Cloudflare is proxied
nslookup codemafia.ng
# If result shows Cloudflare IPs (104.x.x.x, 172.x.x.x), it's proxied
```

If Cloudflare is present, ensure:
1. **SSL/TLS**: Full (strict)
2. **Caching**: Page Rule for `codemafia.ng/api/*` → Cache Level: Bypass
3. **WAF**: No rule blocking OPTIONS or requests with `Origin` header
4. **Transform Rules**: No rule stripping `Access-Control-Allow-Origin` or `Vary`
5. **Always Use HTTPS**: ON (but ensure it doesn't redirect OPTIONS)

## Server Type Detection

```bash
# Check what server is responding
curl -I "https://codemafia.ng" 2>&1 | grep -i "server"

# Apache:   Server: Apache
# LiteSpeed: Server: LiteSpeed
# Nginx:    Server: nginx
# Cloudflare: Server: cloudflare (if proxied, the origin server header is hidden)
```

If the server is **LiteSpeed**, note that:
- `.htaccess` is supported but some directives may behave differently
- `SetEnvIf` + `Header env=` may require specific LiteSpeed version
- Contact your hosting provider to confirm `.htaccess` override support

If the server is **Nginx**:
- `.htaccess` is NOT supported
- CORS must be configured in the Nginx server block
- Contact your hosting provider for Nginx config changes

## Complete Verification

Run the automated verification script:

```bash
bash verify-cors.sh https://codemafia.ng/api/v1 http://localhost:3000
```

This tests 19 endpoint combinations and reports pass/fail for each.

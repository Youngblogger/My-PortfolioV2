# Cloudflare Configuration for CODEMAFIA API

If the API domain (`codemafia.ng` or `api.codemafia.ng`) is proxied through Cloudflare,
the following settings are required for CORS to work correctly.

## 1. SSL/TLS

Set to **Full (strict)** — Cloudflare must trust the origin server's certificate.

```
SSL/TLS → Overview → Full (strict)
```

## 2. Caching

**CORS preflight (OPTIONS) requests must never be cached.**

Create a Page Rule:
```
URL: codemafia.ng/api/v1/*
Setting: Cache Level → Bypass
```

Or in the **Caching → Configuration** tab, set:
```
Browser Cache TTL: 0 (for development) or a short duration (e.g., 14400 for 4 hours)
```

## 3. Security

CORS headers include `Access-Control-Allow-Credentials: true`. Cloudflare must not
strip or rewrite the `Origin` header.

- **WAF**: Ensure your WAF rules don't block OPTIONS requests or requests with
  `Origin` headers from your frontend domain.
- **Rate Limiting**: If you rate-limit the API, exempt `OPTIONS` requests or set
  a very high limit for preflight (they are small, header-only requests).

## 4. DNS

```
Type: A
Name: @ (or api)
IPv4: <your shared hosting IP>
Proxy status: Proxied (orange cloud)
```

## 5. Testing Cloudflare

If CORS works when bypassing Cloudflare (DNS only / grey cloud) but fails when
proxied, the issue is likely Cloudflare-specific:

1. **Check Cloudflare's "Always Use HTTPS"** — ensure it's ON so that redirect
   doesn't break the CORS origin match.
2. **Check for "Auto Minify"** — it shouldn't affect API responses, but disable
   it for the API subdomain to be safe.
3. **Verify response headers** — use `curl` with Cloudflare's proxy IP:

```bash
curl -X OPTIONS "https://codemafia.ng/api/v1/courses" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "CF-Connecting-IP: 1.2.3.4" \
  -I
```

Look for the `cf-ray` and `server: cloudflare` headers in the response.

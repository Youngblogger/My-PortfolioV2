#!/bin/bash
# CODEMAFIA CORS Production Diagnostic
# Run this from your LOCAL machine (NOT on the server)
#
# Usage: bash cors-diagnostic.sh [api_base_url] [origin]
#
# Defaults:
#   API:    https://codemafia.ng/api/v1
#   Origin: http://localhost:3000

API="${1:-https://codemafia.ng/api/v1}"
ORIGIN="${2:-http://localhost:3000}"
TOKEN="${3:-}"

echo "================================================"
echo "  CORS Production Diagnostic"
echo "  API:    $API"
echo "  Origin: $ORIGIN"
echo "================================================"
echo ""

# Test 1: Determine actual server type
echo "─── Test 1: Server Identification ───"
curl -sI "${API}/courses" 2>/dev/null | grep -i "^server:" || echo "  server: unknown"
curl -sI "${API}/courses" 2>/dev/null | grep -i "^x-cors-debug:" || echo "  x-cors-debug: NOT FOUND"
echo ""

# Test 2: OPTIONS preflight on public endpoint
echo "─── Test 2: OPTIONS /courses ───"
RESPONSE=$(curl -s -D - -o /dev/null -X OPTIONS "${API}/courses" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET" 2>/dev/null)
STATUS=$(echo "$RESPONSE" | head -1)
echo "  Status: $STATUS"
echo "$RESPONSE" | grep -i "^access-control-allow-origin:" || echo "  access-control-allow-origin: MISSING"
echo "$RESPONSE" | grep -i "^access-control-allow-credentials:" || echo "  access-control-allow-credentials: MISSING"
echo "$RESPONSE" | grep -i "^access-control-allow-methods:" || echo "  access-control-allow-methods: MISSING"
echo "$RESPONSE" | grep -i "^access-control-allow-headers:" || echo "  access-control-allow-headers: MISSING"
echo "$RESPONSE" | grep -i "^access-control-max-age:" || echo "  access-control-max-age: MISSING"
echo "$RESPONSE" | grep -i "^vary:" || echo "  vary: MISSING"
echo "$RESPONSE" | grep -i "^x-cors-debug:" || echo "  x-cors-debug: MISSING"
echo "$RESPONSE" | grep -i "^location:" || echo "  no redirect"
echo ""

# Check if OPTIONS was redirected
if echo "$RESPONSE" | grep -qi "^HTTP.*30[12378]"; then
  echo "  ⚠️  REDIRECT DETECTED — browser will abort preflight"
  LOCATION=$(echo "$RESPONSE" | grep -i "^location:" | head -1)
  echo "  Location: $LOCATION"
fi
echo ""

# Test 3: Actual GET request
echo "─── Test 3: GET /courses ───"
RESPONSE=$(curl -s -D - -o /dev/null "${API}/courses" \
  -H "Origin: ${ORIGIN}" 2>/dev/null)
STATUS=$(echo "$RESPONSE" | head -1)
echo "  Status: $STATUS"
echo "$RESPONSE" | grep -i "^access-control-allow-origin:" || echo "  access-control-allow-origin: MISSING"
echo "$RESPONSE" | grep -i "^content-type:" || echo "  content-type: MISSING"
echo ""

# Test 4: OPTIONS on auth endpoint
echo "─── Test 4: OPTIONS /auth/login ───"
RESPONSE=$(curl -s -D - -o /dev/null -X OPTIONS "${API}/auth/login" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" 2>/dev/null)
STATUS=$(echo "$RESPONSE" | head -1)
echo "  Status: $STATUS"
echo "$RESPONSE" | grep -i "^access-control-allow-origin:" || echo "  access-control-allow-origin: MISSING"
echo ""

# Test 5: Full verbose output of the primary failing request
echo "─── Test 5: Full verbose trace of OPTIONS /courses/mobile ───"
curl -v -X OPTIONS "${API}/courses/mobile" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET" 2>&1 | grep -E "^(> |< |\* )"
echo ""

# Test 6: Check for Cloudflare
echo "─── Test 6: Cloudflare Check ───"
RESPONSE=$(curl -sI "${API}/courses" 2>/dev/null)
if echo "$RESPONSE" | grep -qi "^cf-ray:"; then
  echo "  ✅ Cloudflare IS proxied (orange cloud)"
  echo "  Check Cloudflare dashboard for:"
  echo "    ● Cache Rules — bypass for api/*"
  echo "    ● Transform Rules — ensure ACAO not stripped"
  echo "    ● WAF — ensure OPTIONS not blocked"
  echo "    ● SSL/TLS — Full (strict)"
else
  echo "  ✅ No Cloudflare detected (DNS-only / grey cloud)"
fi
echo ""

# Test 7: DNS resolution
echo "─── Test 7: DNS ───"
nslookup "$(echo "$API" | sed 's|https://||;s|/.*||')" 2>/dev/null || host "$(echo "$API" | sed 's|https://||;s|/.*||')" 2>/dev/null || echo "  DNS lookup failed (nslookup/host not available)"
echo ""

# Test 8: OPTIONS on a non-existent route
echo "─── Test 8: OPTIONS on non-existent route (/api/v1/nonexistent) ───"
RESPONSE=$(curl -s -D - -o /dev/null -X OPTIONS "${API}/nonexistent" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET" 2>/dev/null)
STATUS=$(echo "$RESPONSE" | head -1)
echo "  Status: $STATUS"
echo "$RESPONSE" | grep -i "^access-control-allow-origin:" || echo "  access-control-allow-origin: MISSING"
echo ""

# Test 9: OPTIONS on checkout (authenticated endpoint)
echo "─── Test 9: OPTIONS /checkout ───"
RESPONSE=$(curl -s -D - -o /dev/null -X OPTIONS "${API}/checkout" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" 2>/dev/null)
STATUS=$(echo "$RESPONSE" | head -1)
echo "  Status: $STATUS"
echo "$RESPONSE" | grep -i "^access-control-allow-origin:" || echo "  access-control-allow-origin: MISSING"
echo ""

echo "================================================"
echo "  Diagnostic Complete"
echo ""
echo "  INTERPRETATION:"
echo ""
echo "  If Test 2 shows missING ACAO:"
echo "    The Laravel HandleCors is NOT emitting the header."
echo "    → Run 'php artisan cors:diagnose' ON THE SERVER"
echo "    → Confirm allowed_origins includes ${ORIGIN}"
echo ""
echo "  If Test 2 shows redirect (3xx):"
echo "    Something is redirecting OPTIONS requests."
echo "    → Check Cloudflare, .htaccess, APP_URL"
echo ""
echo "  If Test 2 shows 204 with ACAO but browser still fails:"
echo "    → Clear browser preflight cache"
echo "    → Check for mixed content or certificate issues"
echo "================================================"

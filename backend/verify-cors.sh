#!/bin/bash
# CODEMAFIA CORS Verification Script
# Usage: bash verify-cors.sh [api_base_url] [frontend_origin]
#
# Defaults:
#   API:    https://codemafia.ng/api/v1
#   Origin: http://localhost:3000

API_BASE="${1:-https://codemafia.ng/api/v1}"
ORIGIN="${2:-http://localhost:3000}"
TOKEN="${3:-}"
PASS=0
FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

check_cors() {
    local method=$1
    local path=$2
    local req_method=$3
    local desc=$4

    local url="${API_BASE}${path}"

    # Build curl args
    local curl_args=(
        -X "$method"
        -H "Origin: $ORIGIN"
        -I
        -s
        -o /dev/null
        -w "%{http_code}|%{header_json}"
    )

    if [ "$method" = "OPTIONS" ]; then
        curl_args+=(-H "Access-Control-Request-Method: ${req_method:-GET}")
    fi

    if [ -n "$TOKEN" ]; then
        curl_args+=(-H "Authorization: Bearer $TOKEN")
    fi

    local result
    result=$(curl "${curl_args[@]}" "$url" 2>/dev/null)
    local http_code
    http_code=$(echo "$result" | cut -d'|' -f1)

    # Fetch headers separately for inspection
    local origin_header
    origin_header=$(curl -s -I -X "$method" \
        -H "Origin: $ORIGIN" \
        ${TOKEN:+-H "Authorization: Bearer $TOKEN"} \
        ${method:+-H "Access-Control-Request-Method: ${req_method:-GET}"} \
        "$url" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")

    local creds_header
    creds_header=$(curl -s -I -X "$method" \
        -H "Origin: $ORIGIN" \
        ${TOKEN:+-H "Authorization: Bearer $TOKEN"} \
        "${method:+-H "Access-Control-Request-Method: ${req_method:-GET}"}" \
        "$url" 2>/dev/null | grep -i "access-control-allow-credentials" || echo "")

    printf "%-8s %-40s " "$method" "$path"

    local errors=""

    # Check HTTP status code
    if [ "$method" = "OPTIONS" ]; then
        if [ "$http_code" = "204" ] || [ "$http_code" = "200" ]; then
            : # OK
        else
            errors="${errors}status=${http_code}(expected 204/200) "
        fi
    else
        if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
            : # OK (401 means auth required, but CORS should work)
        else
            errors="${errors}status=${http_code} "
        fi
    fi

    # Check CORS headers
    if [ -z "$origin_header" ]; then
        errors="${errors}missing-Access-Control-Allow-Origin "
    fi

    if echo "$origin_header" | grep -qi "$ORIGIN"; then
        : # Origin matched
    elif echo "$origin_header" | grep -qi "\*"; then
        errors="${errors}wildcard-origin-with-credentials "
    fi

    if [ -z "$creds_header" ]; then
        errors="${errors}missing-Access-Control-Allow-Credentials "
    fi

    if [ -n "$errors" ]; then
        red "FAIL [${errors}]"
        FAIL=$((FAIL + 1))
    else
        green "PASS"
        PASS=$((PASS + 1))
    fi
}

echo "========================================"
echo "  CODEMAFIA CORS Verification"
echo "  API:    $API_BASE"
echo "  Origin: $ORIGIN"
echo "========================================"
echo ""

# Preflight (OPTIONS) tests
echo "--- Preflight (OPTIONS) Tests ---"
check_cors "OPTIONS" "/courses" "GET" "Public GET"
check_cors "OPTIONS" "/courses/full-stack-mern" "GET" "Course detail GET"
check_cors "OPTIONS" "/courses/stack/frontend" "GET" "Stack filter GET"
check_cors "OPTIONS" "/auth/login" "POST" "Login POST"
check_cors "OPTIONS" "/auth/register" "POST" "Register POST"
check_cors "OPTIONS" "/contact" "POST" "Contact POST"
check_cors "OPTIONS" "/request-quote" "POST" "Quote POST"
check_cors "OPTIONS" "/auth/user" "GET" "Auth user GET"
check_cors "OPTIONS" "/auth/logout" "POST" "Logout POST"
check_cors "OPTIONS" "/checkout" "POST" "Checkout POST"
check_cors "OPTIONS" "/enrollments" "POST" "Enrollment POST"
check_cors "OPTIONS" "/payments/initialize" "POST" "Payment init POST"
check_cors "OPTIONS" "/payments/verify" "GET" "Payment verify GET"
check_cors "OPTIONS" "/users/dashboard" "GET" "Dashboard GET"
check_cors "OPTIONS" "/users" "GET" "User GET"
check_cors "OPTIONS" "/coupons/validate" "POST" "Coupon POST"
check_cors "OPTIONS" "/invoice" "GET" "Invoice GET"
check_cors "OPTIONS" "/invoice/pdf" "GET" "Invoice PDF GET"
check_cors "OPTIONS" "/receipt" "GET" "Receipt GET"

echo ""
echo "--- Actual Request Tests ---"
check_cors "GET" "/courses" "" "List courses"
check_cors "GET" "/courses/full-stack-mern" "" "Course detail"
check_cors "POST" "/contact" "" "Contact (no auth)"

if [ -n "$TOKEN" ]; then
    echo ""
    echo "--- Authenticated Request Tests ---"
    check_cors "GET" "/auth/user" "" "Auth user"
    check_cors "GET" "/users/dashboard" "" "Dashboard"
    check_cors "GET" "/users" "" "User profile"
fi

echo ""
echo "========================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi

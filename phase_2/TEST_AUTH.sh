#!/bin/bash

# Authentication Testing Script
# Tests the complete auth flow: signup → login → session → logout

set -e

BASE_URL="http://localhost:8000/api/v1/auth"
COOKIES_FILE="/tmp/auth_cookies.txt"

echo "=========================================="
echo "Authentication Testing Script"
echo "=========================================="
echo ""

# Test 1: Signup
echo "[1] Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser'$(date +%s)'@example.com",
    "password": "TestPass123"
  }')

USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
USER_EMAIL=$(echo "$SIGNUP_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Signup failed!"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo "✅ Signup successful!"
echo "   User ID: $USER_ID"
echo "   Email: $USER_EMAIL"
echo ""

# Test 2: Login
echo "[2] Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/sign-in/email" \
  -H "Content-Type: application/json" \
  -c "$COOKIES_FILE" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"TestPass123\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "   Token: ${TOKEN:0:20}..."
echo "   Cookies saved to: $COOKIES_FILE"
echo ""

# Test 3: Check cookies file
echo "[3] Checking Cookies..."
if [ -f "$COOKIES_FILE" ]; then
  echo "✅ Cookies file created"
  echo "   Contents:"
  cat "$COOKIES_FILE" | grep -v "^#" || echo "   (No cookies found in file)"
  echo ""
fi

# Test 4: Get Session
echo "[4] Testing Get Session (with cookies)..."
SESSION_RESPONSE=$(curl -s -X GET "$BASE_URL/get-session" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE")

SESSION_USER=$(echo "$SESSION_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SESSION_USER" ]; then
  echo "❌ Get session failed!"
  echo "$SESSION_RESPONSE"
  exit 1
fi

echo "✅ Get session successful!"
echo "   Session user: $SESSION_USER"
echo ""

# Test 5: Test Protected Endpoint (with Bearer token in header)
echo "[5] Testing Protected Endpoint (with Bearer token)..."
PROTECTED_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$PROTECTED_RESPONSE" | tail -1)
BODY=$(echo "$PROTECTED_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Protected endpoint accessible!"
  echo "   HTTP Status: $HTTP_CODE"
  echo "   Response: $BODY"
else
  echo "❌ Protected endpoint failed!"
  echo "   HTTP Status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 6: Test Protected Endpoint (with cookies)
echo "[6] Testing Protected Endpoint (with cookies)..."
COOKIE_PROTECTED=$(curl -s -X GET "http://localhost:8000/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$COOKIE_PROTECTED" | tail -1)
BODY=$(echo "$COOKIE_PROTECTED" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Cookie-based access works!"
  echo "   HTTP Status: $HTTP_CODE"
else
  echo "❌ Cookie-based access failed!"
  echo "   HTTP Status: $HTTP_CODE"
  echo "   Response: $BODY"
fi
echo ""

# Test 7: Logout
echo "[7] Testing Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/logout" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Logout successful!"
else
  echo "⚠️  Logout returned: $HTTP_CODE"
fi
echo ""

# Test 8: Verify session is gone
echo "[8] Verifying Session is Cleared..."
SESSION_AFTER=$(curl -s -X GET "$BASE_URL/get-session" \
  -H "Content-Type: application/json" \
  -b "$COOKIES_FILE")

if echo "$SESSION_AFTER" | grep -q '"user":null'; then
  echo "✅ Session cleared successfully!"
else
  echo "⚠️  Session may still be active (check response below)"
  echo "$SESSION_AFTER"
fi
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "✅ = Passed"
echo "⚠️  = Warning"
echo "❌ = Failed"
echo ""
echo "Cleanup: rm $COOKIES_FILE"

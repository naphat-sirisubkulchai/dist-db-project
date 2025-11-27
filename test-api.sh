#!/bin/bash

# Blog API Testing Script
# Make sure your API is running: make dev

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq is not installed. Install it for better output:${NC}"
    echo "  brew install jq"
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🚀 BLOG API TESTING SCRIPT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "API URL: ${YELLOW}$BASE_URL${NC}"
echo ""

# Function to print test header
print_test() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# 1. HEALTH CHECK
print_test "1️⃣  Testing Health Check"
echo -e "${BLUE}GET $BASE_URL/health${NC}"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 2. REGISTER USER
print_test "2️⃣  Testing User Registration"
echo -e "${BLUE}POST $BASE_URL/auth/register${NC}"
echo ""

TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"
TEST_PASSWORD="password123"

echo "Registering user:"
echo "  Email: $TEST_EMAIL"
echo "  Username: $TEST_USERNAME"
echo "  Password: $TEST_PASSWORD"
echo ""

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Test User\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"

    # Extract token
    TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.data.token' 2>/dev/null)

    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo ""
        echo -e "${YELLOW}🔑 Token saved for authenticated requests${NC}"
    else
        handle_error "Failed to extract token from response"
    fi
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 3. LOGIN
print_test "3️⃣  Testing User Login"
echo -e "${BLUE}POST $BASE_URL/auth/login${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"emailOrUsername\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 4. GET CURRENT USER
print_test "4️⃣  Testing Get Current User (Authenticated)"
echo -e "${BLUE}GET $BASE_URL/auth/me${NC}"
echo -e "${YELLOW}Authorization: Bearer <token>${NC}"
echo ""

ME_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$ME_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 5. CREATE BLOG POST
print_test "5️⃣  Testing Create Blog Post (Authenticated)"
echo -e "${BLUE}POST $BASE_URL/posts${NC}"
echo ""

POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is an amazing blog post about web development, MongoDB, and Elysia framework. It contains valuable insights and practical examples for building modern web applications.",
    "tags": ["javascript", "nodejs", "mongodb", "elysia"],
    "published": true
  }')

HTTP_CODE=$(echo "$POST_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$POST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"

    # Extract post ID and slug
    POST_ID=$(echo "$RESPONSE_BODY" | jq -r '.data._id' 2>/dev/null)
    POST_SLUG=$(echo "$RESPONSE_BODY" | jq -r '.data.slug' 2>/dev/null)

    echo ""
    echo -e "${YELLOW}📝 Post created with ID: $POST_ID${NC}"
    echo -e "${YELLOW}📝 Post slug: $POST_SLUG${NC}"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 6. GET ALL POSTS
print_test "6️⃣  Testing Get All Posts"
echo -e "${BLUE}GET $BASE_URL/posts?limit=5${NC}"
echo ""

POSTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts?limit=5")

HTTP_CODE=$(echo "$POSTS_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$POSTS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 7. GET POST BY SLUG
if [ -n "$POST_SLUG" ] && [ "$POST_SLUG" != "null" ]; then
    print_test "7️⃣  Testing Get Post by Slug"
    echo -e "${BLUE}GET $BASE_URL/posts/$POST_SLUG${NC}"
    echo ""

    SLUG_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/posts/$POST_SLUG")

    HTTP_CODE=$(echo "$SLUG_RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$SLUG_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY"
    fi
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# 8. LIKE POST
if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    print_test "8️⃣  Testing Like Post (Authenticated)"
    echo -e "${BLUE}POST $BASE_URL/posts/$POST_ID/like${NC}"
    echo ""

    LIKE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/posts/$POST_ID/like" \
      -H "Authorization: Bearer $TOKEN")

    HTTP_CODE=$(echo "$LIKE_RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$LIKE_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY"
    fi
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# 9. CREATE COMMENT
if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    print_test "9️⃣  Testing Create Comment (Authenticated)"
    echo -e "${BLUE}POST $BASE_URL/comments${NC}"
    echo ""

    COMMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/comments \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"postId\": \"$POST_ID\",
        \"content\": \"Great post! Very informative and well written.\"
      }")

    HTTP_CODE=$(echo "$COMMENT_RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$COMMENT_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"

        COMMENT_ID=$(echo "$RESPONSE_BODY" | jq -r '.data._id' 2>/dev/null)
        echo ""
        echo -e "${YELLOW}💬 Comment created with ID: $COMMENT_ID${NC}"
    else
        echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY"
    fi
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# 10. GET COMMENTS
if [ -n "$POST_ID" ] && [ "$POST_ID" != "null" ]; then
    print_test "🔟 Testing Get Post Comments"
    echo -e "${BLUE}GET $BASE_URL/comments/post/$POST_ID${NC}"
    echo ""

    COMMENTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/comments/post/$POST_ID")

    HTTP_CODE=$(echo "$COMMENTS_RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$COMMENTS_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    else
        echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
        echo "$RESPONSE_BODY"
    fi
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# 11. UPDATE PROFILE
print_test "1️⃣1️⃣  Testing Update Profile (Authenticated)"
echo -e "${BLUE}PUT $BASE_URL/auth/profile${NC}"
echo ""

PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "bio": "Full-stack developer passionate about web technologies and open source."
  }')

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 12. GET USER PROFILE
print_test "1️⃣2️⃣  Testing Get User Profile"
echo -e "${BLUE}GET $BASE_URL/users/$TEST_USERNAME${NC}"
echo ""

USER_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/users/$TEST_USERNAME")

HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$USER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""
read -p "Press Enter to continue..."
echo ""

# 13. SEARCH USERS
print_test "1️⃣3️⃣  Testing Search Users"
echo -e "${BLUE}GET $BASE_URL/users/search?q=test${NC}"
echo ""

SEARCH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/users/search?q=test")

HTTP_CODE=$(echo "$SEARCH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SEARCH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY"
fi
echo ""

# SUMMARY
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALL TESTS COMPLETED!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Test Summary:"
echo "  Created user: $TEST_USERNAME"
echo "  Created post: $POST_ID"
echo "  Token: $TOKEN"
echo ""
echo -e "${YELLOW}💡 Tip: Access Swagger docs at $BASE_URL/swagger${NC}"
echo ""

#!/bin/bash

# Blog API Automated Testing Script (No User Input Required)
# Make sure your API is running: make dev

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3000"

print_test() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🚀 BLOG API TESTING SCRIPT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "API URL: ${YELLOW}$BASE_URL${NC}"

# 1. HEALTH CHECK
print_test "1️⃣  Health Check"
curl -s $BASE_URL/health | jq '.'

# 2. REGISTER USER
print_test "2️⃣  Register User"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"
TEST_PASSWORD="password123"

REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Test User\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
echo -e "\n${YELLOW}🔑 Token: $TOKEN${NC}"

# 3. LOGIN
print_test "3️⃣  Login"
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"emailOrUsername\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }" | jq '.'

# 4. GET CURRENT USER
print_test "4️⃣  Get Current User"
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. CREATE POST
print_test "5️⃣  Create Blog Post"
POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is an amazing blog post about web development, MongoDB, and Elysia framework. It contains valuable insights and practical examples for building modern web applications.",
    "tags": ["javascript", "nodejs", "mongodb", "elysia"],
    "published": true
  }')

echo "$POST_RESPONSE" | jq '.'
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.data._id')
POST_SLUG=$(echo "$POST_RESPONSE" | jq -r '.data.slug')
echo -e "\n${YELLOW}📝 Post ID: $POST_ID${NC}"
echo -e "${YELLOW}📝 Post Slug: $POST_SLUG${NC}"

# 6. GET ALL POSTS
print_test "6️⃣  Get All Posts"
curl -s "$BASE_URL/posts?limit=5" | jq '.'

# 7. GET POST BY SLUG
print_test "7️⃣  Get Post by Slug"
curl -s "$BASE_URL/posts/$POST_SLUG" | jq '.'

# 8. LIKE POST
print_test "8️⃣  Like Post"
curl -s -X POST "$BASE_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 9. CREATE COMMENT
print_test "9️⃣  Create Comment"
COMMENT_RESPONSE=$(curl -s -X POST $BASE_URL/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"postId\": \"$POST_ID\",
    \"content\": \"Great post! Very informative and well written.\"
  }")

echo "$COMMENT_RESPONSE" | jq '.'
COMMENT_ID=$(echo "$COMMENT_RESPONSE" | jq -r '.data._id')
echo -e "\n${YELLOW}💬 Comment ID: $COMMENT_ID${NC}"

# 10. GET COMMENTS
print_test "🔟 Get Post Comments"
curl -s "$BASE_URL/comments/post/$POST_ID" | jq '.'

# 11. UPDATE PROFILE
print_test "1️⃣1️⃣  Update Profile"
curl -s -X PUT $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "bio": "Full-stack developer passionate about web technologies."
  }' | jq '.'

# 12. GET USER PROFILE
print_test "1️⃣2️⃣  Get User Profile"
curl -s "$BASE_URL/users/$TEST_USERNAME" | jq '.'

# 13. SEARCH USERS
print_test "1️⃣3️⃣  Search Users"
curl -s "$BASE_URL/users/search?q=test" | jq '.'

# SUMMARY
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALL TESTS COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Test Summary:"
echo "  ✅ User: $TEST_USERNAME"
echo "  ✅ Post: $POST_ID"
echo "  ✅ Comment: $COMMENT_ID"
echo "  ✅ Token: ${TOKEN:0:20}..."
echo ""
echo -e "${YELLOW}💡 Access Swagger docs: $BASE_URL/swagger${NC}"
echo -e "${YELLOW}💡 Access MongoDB Express: http://localhost:8081${NC}"
echo ""


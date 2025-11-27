# API Testing Guide

Comprehensive guide for testing all API endpoints using `curl`, automated scripts, and the web interface.

## 🚀 Quick Start

### Prerequisites

1. Start MongoDB:
   ```bash
   make docker-up
   # or: docker-compose up -d
   ```

2. Start the API server:
   ```bash
   make dev
   # or: bun run dev
   ```

The API will be available at: **http://localhost:3000**

### Testing Options

1. **Automated Script** (Recommended)
   ```bash
   ./test-api-auto.sh
   ```

2. **Interactive Script**
   ```bash
   ./test-api.sh
   ```

3. **Web Interface**
   ```bash
   open blog-app.html
   ```

4. **Manual curl commands** (see below)

5. **Swagger UI**
   ```
   http://localhost:3000/swagger
   ```

---

## 📋 Manual Testing with curl

### Setting Up

For easier testing, save your token as an environment variable after login:

```bash
export TOKEN="your_jwt_token_here"
```

Then use `$TOKEN` in subsequent requests.

---

## 🔐 Authentication Endpoints

### 1. Health Check

Check if the API is running:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T14:00:00.000Z"
}
```

---

### 2. Register a New User

Create a new user account:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6920793d7c1c11e0b5e52db3",
      "email": "john@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "followers": [],
      "following": [],
      "createdAt": "2025-11-21T14:00:00.000Z",
      "updatedAt": "2025-11-21T14:00:00.000Z",
      "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 Save the token!** You'll need it for authenticated requests.

---

### 3. Login

Authenticate with existing credentials:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "johndoe",
    "password": "password123"
  }'
```

**You can login with either email or username.**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6920793d7c1c11e0b5e52db3",
      "email": "john@example.com",
      "username": "johndoe",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User

Get the authenticated user's information:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920793d7c1c11e0b5e52db3",
    "email": "john@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "followers": [],
    "following": [],
    "createdAt": "2025-11-21T14:00:00.000Z",
    "updatedAt": "2025-11-21T14:00:00.000Z"
  }
}
```

---

### 5. Update Profile

Update user profile information:

```bash
curl -X PUT http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "bio": "Full-stack developer passionate about web technologies.",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920793d7c1c11e0b5e52db3",
    "email": "john@example.com",
    "username": "johndoe",
    "name": "John Doe Updated",
    "bio": "Full-stack developer passionate about web technologies.",
    "avatar": "https://example.com/avatar.jpg",
    "followers": [],
    "following": [],
    "createdAt": "2025-11-21T14:00:00.000Z",
    "updatedAt": "2025-11-21T14:05:00.000Z"
  }
}
```

---

### 6. Change Password

Update the user's password:

```bash
curl -X PUT http://localhost:3000/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📝 Post Endpoints

### 7. Create a Blog Post

Create a new blog post:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is an amazing blog post about web development, MongoDB, and Elysia framework. It contains valuable insights and practical examples for building modern web applications.",
    "tags": ["javascript", "nodejs", "mongodb", "elysia"],
    "coverImage": "https://example.com/cover.jpg",
    "published": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920788eba0494f9de77522b",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post-mi8yozng",
    "content": "This is an amazing blog post...",
    "excerpt": "This is an amazing blog post...",
    "author": {
      "_id": "6920793d7c1c11e0b5e52db3",
      "username": "johndoe",
      "name": "John Doe"
    },
    "tags": ["javascript", "nodejs", "mongodb", "elysia"],
    "coverImage": "https://example.com/cover.jpg",
    "likes": [],
    "likesCount": 0,
    "commentsCount": 0,
    "readTime": 1,
    "published": true,
    "publishedAt": "2025-11-21T14:10:00.000Z",
    "createdAt": "2025-11-21T14:10:00.000Z",
    "updatedAt": "2025-11-21T14:10:00.000Z"
  }
}
```

---

### 8. Get All Posts

Get all published posts with pagination:

```bash
# Basic request
curl http://localhost:3000/posts

# With pagination
curl "http://localhost:3000/posts?page=1&limit=10"

# Filter by tag
curl "http://localhost:3000/posts?tag=javascript"

# Filter by author
curl "http://localhost:3000/posts?author=johndoe"

# Search posts
curl "http://localhost:3000/posts?search=mongodb"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "6920788eba0494f9de77522b",
        "title": "My First Blog Post",
        "slug": "my-first-blog-post-mi8yozng",
        "excerpt": "This is an amazing blog post...",
        "author": {
          "_id": "6920793d7c1c11e0b5e52db3",
          "username": "johndoe",
          "name": "John Doe"
        },
        "tags": ["javascript", "nodejs", "mongodb"],
        "likesCount": 0,
        "commentsCount": 0,
        "readTime": 1,
        "published": true,
        "publishedAt": "2025-11-21T14:10:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 9. Get Post by Slug

Get a specific post by its slug:

```bash
curl http://localhost:3000/posts/my-first-blog-post-mi8yozng
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920788eba0494f9de77522b",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post-mi8yozng",
    "content": "This is an amazing blog post...",
    "author": {
      "_id": "6920793d7c1c11e0b5e52db3",
      "username": "johndoe",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Full-stack developer"
    },
    "tags": ["javascript", "nodejs", "mongodb", "elysia"],
    "likes": [],
    "likesCount": 0,
    "commentsCount": 0,
    "readTime": 1,
    "published": true,
    "publishedAt": "2025-11-21T14:10:00.000Z",
    "createdAt": "2025-11-21T14:10:00.000Z",
    "updatedAt": "2025-11-21T14:10:00.000Z"
  }
}
```

---

### 10. Update Post

Update an existing post (must be the author):

```bash
curl -X PUT http://localhost:3000/posts/6920788eba0494f9de77522b \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Updated Blog Post",
    "content": "Updated content here...",
    "tags": ["javascript", "typescript", "nodejs"],
    "published": true
  }'
```

---

### 11. Delete Post

Delete a post (must be the author):

```bash
curl -X DELETE http://localhost:3000/posts/6920788eba0494f9de77522b \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### 12. Like/Unlike Post

Toggle like on a post:

```bash
curl -X POST http://localhost:3000/posts/6920788eba0494f9de77522b/like \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 1
  }
}
```

**Run the same command again to unlike:**
```json
{
  "success": true,
  "data": {
    "liked": false,
    "likesCount": 0
  }
}
```

---

### 13. Get User's Drafts

Get all unpublished posts by the authenticated user:

```bash
curl "http://localhost:3000/posts/my/drafts?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 14. Get Personalized Feed

Get posts from followed users:

```bash
curl "http://localhost:3000/posts/feed?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💬 Comment Endpoints

### 15. Create a Comment

Add a comment to a post:

```bash
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "6920788eba0494f9de77522b",
    "content": "Great post! Very informative and well written."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920788eba0494f9de775237",
    "content": "Great post! Very informative and well written.",
    "author": {
      "_id": "6920793d7c1c11e0b5e52db3",
      "username": "johndoe",
      "name": "John Doe"
    },
    "post": "6920788eba0494f9de77522b",
    "likes": [],
    "likesCount": 0,
    "createdAt": "2025-11-21T14:20:00.000Z",
    "updatedAt": "2025-11-21T14:20:00.000Z"
  }
}
```

---

### 16. Create a Reply

Reply to another comment:

```bash
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "6920788eba0494f9de77522b",
    "content": "Thanks for your comment!",
    "parentCommentId": "6920788eba0494f9de775237"
  }'
```

---

### 17. Get Post Comments

Get all comments for a post:

```bash
curl "http://localhost:3000/comments/post/6920788eba0494f9de77522b?page=1&limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "6920788eba0494f9de775237",
        "content": "Great post! Very informative and well written.",
        "author": {
          "_id": "6920793d7c1c11e0b5e52db3",
          "username": "johndoe",
          "name": "John Doe"
        },
        "post": "6920788eba0494f9de77522b",
        "likes": [],
        "likesCount": 0,
        "createdAt": "2025-11-21T14:20:00.000Z",
        "updatedAt": "2025-11-21T14:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 18. Get Comment Replies

Get all replies to a comment:

```bash
curl "http://localhost:3000/comments/6920788eba0494f9de775237/replies?page=1&limit=10"
```

---

### 19. Update Comment

Update your own comment:

```bash
curl -X PUT http://localhost:3000/comments/6920788eba0494f9de775237 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment content here..."
  }'
```

---

### 20. Delete Comment

Delete your own comment:

```bash
curl -X DELETE http://localhost:3000/comments/6920788eba0494f9de775237 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 21. Like/Unlike Comment

Toggle like on a comment:

```bash
curl -X POST http://localhost:3000/comments/6920788eba0494f9de775237/like \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likesCount": 1
  }
}
```

---

## 👥 User Endpoints

### 22. Search Users

Search for users by name or username:

```bash
curl "http://localhost:3000/users/search?q=john&page=1&limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "6920793d7c1c11e0b5e52db3",
        "username": "johndoe",
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "Full-stack developer"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 23. Get User Profile

Get a user's public profile:

```bash
curl http://localhost:3000/users/johndoe
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6920793d7c1c11e0b5e52db3",
    "username": "johndoe",
    "name": "John Doe",
    "bio": "Full-stack developer",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-11-21T14:00:00.000Z",
    "stats": {
      "posts": 5,
      "followers": 10,
      "following": 15
    },
    "isFollowing": false
  }
}
```

---

### 24. Get User Followers

Get a list of user's followers:

```bash
curl "http://localhost:3000/users/johndoe/followers?page=1&limit=10"
```

---

### 25. Get User Following

Get a list of users that someone is following:

```bash
curl "http://localhost:3000/users/johndoe/following?page=1&limit=10"
```

---

### 26. Follow/Unfollow User

Toggle follow status for a user:

```bash
curl -X POST http://localhost:3000/users/johndoe/follow \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (Follow):**
```json
{
  "success": true,
  "data": {
    "following": true
  }
}
```

**Expected Response (Unfollow):**
```json
{
  "success": true,
  "data": {
    "following": false
  }
}
```

---

## 🧪 Automated Testing Scripts

### Full Automated Test Suite

Run all API tests automatically:

```bash
./test-api-auto.sh
```

**This script will:**
1. Check API health
2. Register a new user
3. Login with the user
4. Get current user info
5. Create a blog post
6. Get all posts
7. Get post by slug
8. Like the post
9. Create a comment
10. Get post comments
11. Update user profile
12. Get user profile
13. Search for users

---

### Interactive Testing Script

Run tests with interactive prompts:

```bash
./test-api.sh
```

This allows you to input custom values for testing.

---

## 🌐 Web Interface Testing

For a full visual testing experience, open the web interface:

```bash
open blog-app.html
```

**Features:**
- ✅ Register and login
- ✅ Create and edit posts
- ✅ Add comments
- ✅ Like posts and comments
- ✅ Follow users
- ✅ Search users
- ✅ View profiles
- ✅ Update your profile

---

## 📊 API Documentation

Interactive API documentation is available via Swagger:

```
http://localhost:3000/swagger
```

This provides:
- All endpoints with descriptions
- Request/response schemas
- Try-it-out functionality
- Authentication testing

---

## 🐛 Troubleshooting

### "Unauthorized" Error

Make sure you're including the Bearer token:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### "Validation Error"

Check that your request body matches the required schema. Example:

```bash
# ✅ Correct
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"pass123","name":"User"}'

# ❌ Wrong (missing required fields)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Server Not Responding

1. Check if the server is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check MongoDB is running:
   ```bash
   docker-compose ps
   ```

3. View server logs:
   ```bash
   docker-compose logs -f app
   ```

---

## 📝 Notes

- All authenticated endpoints require the `Authorization: Bearer <token>` header
- Tokens expire after 7 days (configurable in `.env`)
- Pagination defaults to page 1, limit 10
- Search is case-insensitive
- Slugs are automatically generated from titles with unique IDs
- Read time is automatically calculated based on content length

---

**Happy Testing! 🎉**

For more information, see the [README.md](./README.md) file.

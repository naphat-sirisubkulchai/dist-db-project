# Blog API - Medium-like Platform

A production-ready blog platform API built with **Elysia** and **MongoDB**, featuring Docker containerization, comprehensive testing, and a beautiful web interface.

## 🌟 Features

- **User Authentication** - JWT-based authentication with secure password hashing (bcrypt)
- **Blog Posts** - Create, read, update, delete blog posts with rich text content
- **Comments System** - Nested comments with replies support
- **Social Features** - Like posts/comments, follow users, personalized feed
- **Search** - Full-text search for posts and users
- **Pagination** - Efficient pagination for all list endpoints
- **Tags System** - Organize posts with multiple tags
- **User Profiles** - Complete user profiles with stats and bio
- **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- **Docker Support** - Fully containerized with docker-compose
- **Web Interface** - Beautiful Medium-like UI (blog-app.html)
- **Development Tools** - Makefile for common tasks, hot-reload development

## 🚀 Tech Stack

- **Runtime**: Bun (v1.1.34)
- **Framework**: Elysia (v1.1.23)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (@elysiajs/jwt)
- **Validation**: Zod schemas
- **API Docs**: Swagger (@elysiajs/swagger)
- **Containerization**: Docker & Docker Compose
- **Password Security**: bcryptjs

## 📁 Project Structure

```
.
├── src/
│   ├── config/           # Configuration files (env, database)
│   ├── models/           # MongoDB models (User, Post, Comment)
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── controllers/      # Request handlers
│   ├── routes/           # API route definitions
│   ├── middleware/       # Custom middleware (auth, etc.)
│   ├── utils/            # Utility functions
│   └── index.ts          # Application entry point
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Application container
├── Makefile             # Development commands
├── blog-app.html        # Medium-like web interface
├── test-api-auto.sh     # Automated API testing script
└── .env.example         # Environment variables template
```

## 🏗️ Architecture

This project follows the **Controller-Repository-Service** pattern:

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic and orchestration
- **Repositories** - Database operations and queries
- **Models** - Mongoose schemas and data validation
- **Routes** - API endpoint definitions with validation

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🎯 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) & Docker Compose
- Make (optional, for using Makefile commands)

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd dist-db-project
   bun install
   cp .env.example .env
   ```

2. **Configure environment**
   Edit `.env` file with your settings:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/blog
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   DEFAULT_PAGE_SIZE=10
   MAX_PAGE_SIZE=100
   ```

3. **Start MongoDB with Docker**
   ```bash
   make docker-up
   # or: docker-compose up -d
   ```

4. **Start development server**
   ```bash
   make dev
   # or: bun run dev
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/swagger
   - MongoDB Express: http://localhost:8081 (admin/admin123)
   - Web Interface: Open `blog-app.html` in your browser

## 📋 Makefile Commands

The project includes a comprehensive Makefile for easy development:

### Essential Commands

```bash
make help           # Show all available commands
make install        # Install dependencies
make dev            # Start development server with hot reload
make build          # Build the application
make start          # Start production server
```

### Docker Commands

```bash
make docker-up      # Start all containers
make docker-down    # Stop all containers
make docker-logs    # View all logs
make docker-clean   # Stop containers and remove volumes
make docker-rebuild # Rebuild everything from scratch
```

### Database Commands

```bash
make db-backup      # Backup MongoDB database
make db-restore     # Restore from latest backup
make shell-mongo    # Open MongoDB shell
```

### Development Workflow

```bash
make dev-start      # Complete dev setup + start Docker
make up             # Shortcut for docker-up
make down           # Shortcut for docker-down
make logs           # Shortcut for docker-logs
make restart        # Restart all containers
```

## 🔌 API Endpoints

### Authentication

```
POST   /auth/register      # Register new user
POST   /auth/login         # Login user
GET    /auth/me            # Get current user (requires auth)
PUT    /auth/profile       # Update profile (requires auth)
PUT    /auth/password      # Change password (requires auth)
```

### Posts

```
GET    /posts              # Get all posts (with pagination, filters)
GET    /posts/feed         # Get personalized feed (requires auth)
GET    /posts/:slug        # Get post by slug
POST   /posts              # Create post (requires auth)
PUT    /posts/:id          # Update post (requires auth)
DELETE /posts/:id          # Delete post (requires auth)
POST   /posts/:id/like     # Like/unlike post (requires auth)
GET    /posts/my/drafts    # Get user's drafts (requires auth)
```

### Comments

```
GET    /comments/post/:postId           # Get post comments
GET    /comments/:commentId/replies     # Get comment replies
POST   /comments                        # Create comment (requires auth)
PUT    /comments/:id                    # Update comment (requires auth)
DELETE /comments/:id                    # Delete comment (requires auth)
POST   /comments/:id/like               # Like/unlike comment (requires auth)
```

### Users

```
GET    /users/search                    # Search users
GET    /users/:username                 # Get user profile
GET    /users/:username/followers       # Get user followers
GET    /users/:username/following       # Get user following
POST   /users/:username/follow          # Follow/unfollow user (requires auth)
```

### System

```
GET    /                   # API info
GET    /health             # Health check
GET    /swagger            # API documentation
```

## 💻 API Usage Examples

See [API_TESTS.md](./API_TESTS.md) for comprehensive examples.

### Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "johndoe",
    "password": "password123"
  }'
```

### Create a post (requires authentication)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "tags": ["technology", "programming"],
    "published": true
  }'
```

## 🧪 Testing

### Automated Testing Script

Run the comprehensive automated test suite:

```bash
./test-api-auto.sh
```

This script tests all endpoints:
- ✅ Health check
- ✅ User registration
- ✅ User login
- ✅ Get current user
- ✅ Create blog post
- ✅ Get all posts
- ✅ Get post by slug
- ✅ Like post
- ✅ Create comment
- ✅ Get comments
- ✅ Update profile
- ✅ Get user profile
- ✅ Search users

### Interactive Testing Script

For manual testing with prompts:

```bash
./test-api.sh
```

### Web Interface Testing

Open `blog-app.html` in your browser for a full-featured web interface to test all functionality.

## 🌐 Web Interface

The project includes a beautiful Medium-like web interface (`blog-app.html`) with:

- ✨ Modern, clean design inspired by Medium
- 📱 Fully responsive layout
- 🔐 Complete authentication flow (register, login)
- ✍️ Rich post editor with tags
- 💬 Comments and nested replies
- ❤️ Like system for posts and comments
- 👤 User profiles with follow system
- 🔍 User search functionality
- 📊 User stats (posts, followers, following)

Simply open `blog-app.html` in your browser after starting the API server.

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/blog` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `DEFAULT_PAGE_SIZE` | Default pagination size | `10` |
| `MAX_PAGE_SIZE` | Maximum pagination size | `100` |

## 🔒 Best Practices Implemented

### Security
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT-based authentication with secure tokens
- ✅ Input validation with Zod schemas
- ✅ Non-root user in Docker container
- ✅ Environment-based configuration
- ✅ Secure error handling (no stack traces in production)

### Performance
- ✅ Database indexing for common queries
- ✅ Pagination for all list endpoints
- ✅ Connection pooling for MongoDB
- ✅ Lean queries for read-only operations
- ✅ Efficient slug generation with unique IDs

### Code Organization
- ✅ Controller-Repository-Service pattern
- ✅ Middleware for cross-cutting concerns
- ✅ Utility functions for reusable code
- ✅ Type-safe schemas with Mongoose & TypeScript
- ✅ Centralized error handling
- ✅ Modular route organization

### DevOps
- ✅ Multi-stage Docker builds
- ✅ Docker Compose for local development
- ✅ Health check endpoints
- ✅ Comprehensive logging
- ✅ Database backup/restore scripts
- ✅ Automated testing scripts

## 📦 Docker Services

### MongoDB
- **Port**: 27017
- **Database**: blog
- **Persistence**: Docker volume `mongodb_data`
- **Health check**: Automatic with mongosh

### MongoDB Express
- **Port**: 8081
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin123
- **Purpose**: Database management UI

### Application
- **Port**: 3000
- **Hot Reload**: Yes (development mode)
- **Base Image**: oven/bun:1.1.34-alpine

## 🛠️ Development

### Running in Development Mode

```bash
# Start MongoDB
make docker-up

# Start dev server with hot reload
make dev
```

### View Logs

```bash
# All services
make logs

# Specific service
docker-compose logs -f mongodb
docker-compose logs -f app
```

### Database Management

```bash
# MongoDB shell
make shell-mongo

# Backup database
make db-backup

# Restore from backup
make db-restore
```

## 🚀 Production Deployment

### Using Docker

1. Update environment variables in `.env`
2. Build and start containers:
   ```bash
   make prod-deploy
   # or: docker-compose up -d --build
   ```

### Manual Deployment

1. Install dependencies:
   ```bash
   bun install --production
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export MONGODB_URI=mongodb://your-mongo-host:27017/blog
   export JWT_SECRET=your-secret-key
   ```

3. Start the server:
   ```bash
   bun src/index.ts
   ```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T14:00:00.000Z"
}
```

### Container Stats

```bash
docker stats
```

## 🐛 Troubleshooting

### Reset Everything

```bash
make docker-clean
bun install
make docker-up
make dev
```

### Port Already in Use

```bash
# Stop all containers
make docker-down

# Check what's using the port
lsof -i :3000
lsof -i :27017

# Kill the process or change PORT in .env
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Clear MongoDB Data

```bash
make docker-clean
make docker-up
```

## 📚 Additional Documentation

- [API_TESTS.md](./API_TESTS.md) - Comprehensive API testing examples
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning or production!

## 💡 Acknowledgments

- Built with [Elysia](https://elysiajs.com/) - Fast and ergonomic web framework
- [MongoDB](https://www.mongodb.com/) - Flexible document database
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

---

**Built with ❤️ for learning and production use**

For issues, questions, or suggestions, please open an issue on GitHub.

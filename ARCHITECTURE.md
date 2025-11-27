# Architecture Documentation

## Project Structure

This project follows the **Controller-Repository-Service** pattern for clean separation of concerns and maintainability.

```
src/
├── config/              # Configuration files
│   ├── database.ts     # MongoDB connection setup
│   └── env.ts          # Environment variables configuration
├── models/              # MongoDB/Mongoose models
│   ├── User.ts         # User schema and model
│   ├── Post.ts         # Post schema and model
│   └── Comment.ts      # Comment schema and model
├── repositories/        # Data access layer (Database operations)
│   ├── user.repository.ts
│   ├── post.repository.ts
│   └── comment.repository.ts
├── services/            # Business logic layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── post.service.ts
│   └── comment.service.ts
├── controllers/         # HTTP request/response handling
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── post.controller.ts
│   └── comment.controller.ts
├── routes/              # API route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── post.routes.ts
│   └── comment.routes.ts
├── middleware/          # Custom middleware
│   └── auth.ts         # JWT authentication middleware
├── utils/               # Utility functions
│   └── helpers.ts      # Helper functions (slug generation, pagination, etc.)
└── index.ts             # Application entry point
```

## Architecture Layers

### 1. Models Layer
**Purpose**: Define data structures and database schemas

- Defines MongoDB schemas using Mongoose
- Implements data validation rules
- Sets up database indexes for performance
- Defines relationships between collections

**Example**: `src/models/User.ts`

```typescript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ... other fields
});
```

### 2. Repository Layer
**Purpose**: Handle all database operations (CRUD)

- Direct interaction with database models
- Encapsulates database queries
- Returns raw data from database
- No business logic here

**Responsibilities**:
- Create, Read, Update, Delete operations
- Database queries and filtering
- Database-specific operations

**Example**: `src/repositories/user.repository.ts`

```typescript
export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return await User.create(data);
  }
}
```

### 3. Service Layer
**Purpose**: Implement business logic

- Uses repositories to access data
- Implements business rules and workflows
- Handles complex operations involving multiple repositories
- Performs data transformation and validation

**Responsibilities**:
- Business logic implementation
- Data validation
- Orchestrating multiple repository calls
- Error handling

**Example**: `src/services/auth.service.ts`

```typescript
export class AuthService {
  async register(email: string, username: string, password: string) {
    // Check if user exists (using repository)
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Email already in use');

    // Business logic: hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (using repository)
    return await userRepository.create({ email, username, password: hashedPassword });
  }
}
```

### 4. Controller Layer
**Purpose**: Handle HTTP requests and responses

- Receives HTTP requests from routes
- Calls appropriate service methods
- Formats responses
- Handles request/response transformation

**Responsibilities**:
- Request data extraction
- Calling service layer methods
- Formatting successful responses
- HTTP-specific logic

**Example**: `src/controllers/auth.controller.ts`

```typescript
export class AuthController {
  async register(data: RegisterDTO, jwt: any) {
    const user = await authService.register(data.email, data.username, data.password);
    const token = await jwt.sign({ userId: user._id });
    return { success: true, data: { user, token } };
  }
}
```

### 5. Routes Layer
**Purpose**: Define API endpoints and apply middleware

- Maps HTTP methods/paths to controller methods
- Applies middleware (authentication, validation)
- Defines request/response schemas
- Groups related endpoints

**Example**: `src/routes/auth.routes.ts`

```typescript
export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, jwt }) => {
    return await authController.register(body, jwt);
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      username: t.String({ minLength: 3 }),
      password: t.String({ minLength: 6 }),
    })
  });
```

### 6. Middleware Layer
**Purpose**: Cross-cutting concerns

- Authentication and authorization
- Request validation
- Error handling
- Logging

**Example**: `src/middleware/auth.ts`

```typescript
export const requireAuth = new Elysia()
  .derive(({ user }) => {
    if (!user) throw new Error('Unauthorized');
    return { user };
  });
```

## Data Flow

### Request Flow (Top to Bottom)
```
HTTP Request
    ↓
Route (routes/)
    ↓
Middleware (middleware/)
    ↓
Controller (controllers/)
    ↓
Service (services/)
    ↓
Repository (repositories/)
    ↓
Model (models/)
    ↓
MongoDB Database
```

### Response Flow (Bottom to Top)
```
MongoDB Database
    ↓
Model (models/)
    ↓
Repository (repositories/) - Returns raw data
    ↓
Service (services/) - Applies business logic
    ↓
Controller (controllers/) - Formats response
    ↓
Middleware (middleware/)
    ↓
Route (routes/)
    ↓
HTTP Response
```

## Example: Creating a Blog Post

### 1. HTTP Request
```bash
POST /posts
Authorization: Bearer <token>
{
  "title": "My Post",
  "content": "Content here",
  "published": true
}
```

### 2. Route (`post.routes.ts`)
```typescript
.post('/', async ({ user, body }) => {
  return await postController.createPost(user.userId, body);
})
```

### 3. Controller (`post.controller.ts`)
```typescript
async createPost(userId: string, data: CreatePostDTO) {
  const post = await postService.createPost(userId, data);
  return { success: true, data: post };
}
```

### 4. Service (`post.service.ts`)
```typescript
async createPost(authorId: string, data: CreatePostDTO) {
  const slug = generateSlug(data.title);  // Business logic
  const post = await postRepository.create({
    ...data,
    slug,
    author: authorId,
    excerpt: data.content.substring(0, 300),
  });
  return post;
}
```

### 5. Repository (`post.repository.ts`)
```typescript
async create(data: Partial<IPost>): Promise<IPost> {
  const post = await Post.create(data);
  await post.populate('author', 'username name avatar');
  return post;
}
```

### 6. Model (`Post.ts`)
```typescript
const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  // ...
});
```

## Design Principles

### 1. Separation of Concerns
Each layer has a specific responsibility and doesn't mix concerns:
- **Routes**: HTTP routing
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Repositories**: Data access
- **Models**: Data structure

### 2. Dependency Direction
Dependencies flow in one direction:
```
Routes → Controllers → Services → Repositories → Models
```

### 3. Single Responsibility
Each class/module has one reason to change:
- Repository changes when database queries change
- Service changes when business logic changes
- Controller changes when API interface changes

### 4. Testability
Each layer can be tested independently:
- **Repositories**: Mock database
- **Services**: Mock repositories
- **Controllers**: Mock services
- **Routes**: Mock controllers

### 5. Reusability
- Services can be used by multiple controllers
- Repositories can be used by multiple services
- Business logic is centralized in services

## Benefits of This Architecture

1. **Maintainability**: Clear structure makes code easy to find and modify
2. **Scalability**: Easy to add new features without affecting existing code
3. **Testability**: Each layer can be unit tested independently
4. **Flexibility**: Easy to swap implementations (e.g., change database)
5. **Team Collaboration**: Clear boundaries allow multiple developers to work simultaneously
6. **Code Reusability**: Services and repositories can be reused across the application

## Common Patterns

### Error Handling
Errors bubble up from repositories through services to controllers:

```typescript
// Repository
async findById(id: string) {
  return await User.findById(id); // Returns null if not found
}

// Service
async getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw new Error('User not found'); // Business logic error
  return user;
}

// Controller
async getUser(id: string) {
  const user = await userService.getUserById(id);
  return { success: true, data: user };
}

// Route (error handled by Elysia middleware)
```

### Pagination
Handled in repository, used by service, exposed by controller:

```typescript
// Repository
async findAll(skip: number, limit: number) {
  return await Post.find().skip(skip).limit(limit);
}

// Service
async getPosts(page?: string, limit?: string) {
  const { page: p, limit: l, skip } = validatePagination(page, limit);
  const result = await postRepository.findPublished(skip, l);
  return createPaginationResponse(result.posts, result.total, p, l);
}

// Controller
async getAllPosts(query: { page?: string; limit?: string }) {
  return await postService.getPosts(query);
}
```

## Future Improvements

1. **DTOs (Data Transfer Objects)**: Explicit request/response types
2. **Dependency Injection**: Use IoC container for better testing
3. **Event System**: Decouple features using events
4. **Caching Layer**: Add caching at service layer
5. **API Versioning**: Support multiple API versions
6. **Request Validation**: Dedicated validation layer
7. **Background Jobs**: Add queue system for async tasks

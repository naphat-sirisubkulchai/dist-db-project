import { connectDatabase, disconnectDatabase } from './config/database';
import { User } from './models/User';
import { Post } from './models/Post';
import { Comment } from './models/Comment';
import { generateSlug } from './utils/helpers';
import bcrypt from 'bcryptjs';

// Sample users
const users = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Full-stack developer passionate about web technologies. Love building scalable applications with modern frameworks.',
    profileImage: 'https://i.pravatar.cc/150?img=12',
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Tech enthusiast and UI/UX designer. Creating beautiful and intuitive user experiences.',
    profileImage: 'https://i.pravatar.cc/150?img=5',
  },
  {
    username: 'bobsmith',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Senior software engineer with 10+ years of experience. Mentor and open-source contributor.',
    profileImage: 'https://i.pravatar.cc/150?img=33',
  },
  {
    username: 'alicejones',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Data scientist and machine learning engineer. Turning data into actionable insights.',
    profileImage: 'https://i.pravatar.cc/150?img=47',
  },
  {
    username: 'charlielee',
    email: 'charlie@example.com',
    password: 'password123',
    bio: 'DevOps engineer focused on cloud infrastructure and automation. AWS certified.',
    profileImage: 'https://i.pravatar.cc/150?img=68',
  },
];

// Sample posts
const posts = [
  {
    title: 'Getting Started with TypeScript',
    content: `
# Introduction to TypeScript

TypeScript has become an essential tool for modern web development. In this comprehensive guide, we'll explore why TypeScript is worth learning and how to get started.

## What is TypeScript?

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds optional static typing to JavaScript, which can help catch errors early in development.

## Why Use TypeScript?

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Enhanced autocomplete and intellisense
3. **Improved Maintainability**: Self-documenting code with type definitions
4. **Modern JavaScript Features**: Use latest ES features with backwards compatibility

## Getting Started

First, install TypeScript globally:

\`\`\`bash
npm install -g typescript
\`\`\`

Create your first TypeScript file:

\`\`\`typescript
// hello.ts
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

Compile and run:

\`\`\`bash
tsc hello.ts
node hello.js
\`\`\`

## Conclusion

TypeScript is a powerful tool that can significantly improve your development experience. Start small, learn gradually, and you'll soon appreciate the benefits it brings to your projects.
    `,
    excerpt: 'Learn the fundamentals of TypeScript and why it has become essential for modern web development.',
    tags: ['typescript', 'javascript', 'programming', 'tutorial'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  },
  {
    title: 'Building Scalable REST APIs with Node.js',
    content: `
# Building Production-Ready REST APIs

Creating a scalable and maintainable REST API requires careful planning and following best practices. Let's dive into the essential concepts.

## Architecture Patterns

### MVC Pattern

Model-View-Controller is a classic pattern that separates concerns:

- **Model**: Database schema and business logic
- **View**: Response formatting (JSON in our case)
- **Controller**: Request handling and routing

### Repository Pattern

The repository pattern abstracts data access logic, making your code more testable and maintainable.

## Best Practices

1. **Use proper HTTP status codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
   - 500: Server Error

2. **Implement proper error handling**
   Always return consistent error responses

3. **Add request validation**
   Validate incoming data before processing

4. **Use environment variables**
   Never hardcode sensitive information

## Code Example

\`\`\`javascript
// User route example
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
\`\`\`

## Conclusion

Building scalable APIs takes time and practice. Follow these patterns and you'll create robust, maintainable systems.
    `,
    excerpt: 'Learn how to build production-ready REST APIs with Node.js following industry best practices.',
    tags: ['nodejs', 'api', 'backend', 'rest'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  },
  {
    title: 'Modern CSS: Flexbox and Grid Layout',
    content: `
# Mastering Modern CSS Layouts

CSS has evolved tremendously with Flexbox and Grid. Let's explore how to create responsive layouts effortlessly.

## Flexbox Basics

Flexbox is perfect for one-dimensional layouts:

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
\`\`\`

## CSS Grid

Grid excels at two-dimensional layouts:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

## Responsive Design

Combine both for powerful responsive designs:

\`\`\`css
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
\`\`\`

## Tips and Tricks

1. Use \`gap\` instead of margins
2. Leverage \`auto-fit\` and \`auto-fill\`
3. Combine Grid for layout, Flexbox for components
4. Use CSS variables for consistency

Master these techniques and you'll never struggle with layouts again!
    `,
    excerpt: 'A comprehensive guide to creating modern, responsive layouts with Flexbox and CSS Grid.',
    tags: ['css', 'frontend', 'design', 'responsive'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
  },
  {
    title: 'React Hooks: A Deep Dive',
    content: `
# Understanding React Hooks

Hooks revolutionized React development. Let's explore the most important ones and when to use them.

## useState

The most basic hook for managing state:

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

## useEffect

Handle side effects in functional components:

\`\`\`jsx
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`

## useContext

Avoid prop drilling with context:

\`\`\`jsx
const theme = useContext(ThemeContext);
\`\`\`

## Custom Hooks

Create reusable logic:

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
\`\`\`

## Best Practices

1. Don't call hooks conditionally
2. Extract custom hooks for reusable logic
3. Use useCallback and useMemo wisely
4. Keep effects focused and simple

Happy coding!
    `,
    excerpt: 'Master React Hooks with practical examples and best practices for modern React development.',
    tags: ['react', 'javascript', 'hooks', 'frontend'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  },
  {
    title: 'Introduction to MongoDB and NoSQL',
    content: `
# MongoDB: A Modern Database Solution

MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents. Perfect for modern applications!

## Why MongoDB?

1. **Flexible Schema**: No rigid table structures
2. **Scalability**: Horizontal scaling built-in
3. **Performance**: Fast reads and writes
4. **Developer Friendly**: Works naturally with JavaScript

## Basic Operations

### Insert Document

\`\`\`javascript
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});
\`\`\`

### Query Documents

\`\`\`javascript
db.users.find({ age: { $gte: 25 } });
\`\`\`

### Update Document

\`\`\`javascript
db.users.updateOne(
  { email: "john@example.com" },
  { $set: { age: 31 } }
);
\`\`\`

## Data Modeling

Unlike SQL, MongoDB encourages embedding related data:

\`\`\`javascript
{
  title: "Blog Post",
  author: {
    name: "John",
    email: "john@example.com"
  },
  comments: [
    { text: "Great post!", author: "Jane" }
  ]
}
\`\`\`

## When to Use MongoDB

- Rapid development with changing requirements
- Large amounts of unstructured data
- Need for horizontal scaling
- Real-time analytics

MongoDB is a powerful tool in your development arsenal. Give it a try!
    `,
    excerpt: 'Explore MongoDB and learn when and how to use NoSQL databases in your applications.',
    tags: ['mongodb', 'database', 'nosql', 'backend'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  },
  {
    title: 'Async/Await in JavaScript: A Complete Guide',
    content: `
# Mastering Async/Await

Async/await makes asynchronous code look and behave like synchronous code. Let's master it!

## The Basics

\`\`\`javascript
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user;
}
\`\`\`

## Error Handling

Always use try/catch:

\`\`\`javascript
async function fetchUser(id) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
\`\`\`

## Parallel Execution

Use Promise.all for concurrent operations:

\`\`\`javascript
async function fetchMultipleUsers(ids) {
  const promises = ids.map(id => fetchUser(id));
  const users = await Promise.all(promises);
  return users;
}
\`\`\`

## Common Pitfalls

1. Forgetting to await
2. Not handling errors
3. Sequential instead of parallel execution
4. Using async/await in loops incorrectly

## Advanced Patterns

\`\`\`javascript
// Sequential
for (const id of ids) {
  await processUser(id);
}

// Parallel
await Promise.all(ids.map(id => processUser(id)));
\`\`\`

Master async/await and write cleaner, more maintainable code!
    `,
    excerpt: 'Learn to write clean asynchronous JavaScript code using async/await with practical examples.',
    tags: ['javascript', 'async', 'promises', 'tutorial'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
  },
  {
    title: 'Docker for Developers: Getting Started',
    content: `
# Docker Fundamentals for Developers

Docker has revolutionized how we build and deploy applications. Let's get you started!

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies.

## Basic Concepts

- **Image**: Blueprint for containers
- **Container**: Running instance of an image
- **Dockerfile**: Instructions to build an image
- **Docker Compose**: Define multi-container applications

## Your First Dockerfile

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Docker Compose Example

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"

  database:
    image: mongo:7.0
    ports:
      - "27017:27017"
\`\`\`

## Common Commands

\`\`\`bash
docker build -t myapp .
docker run -p 3000:3000 myapp
docker-compose up -d
docker ps
docker logs container_name
\`\`\`

## Benefits

1. Consistent environments
2. Easy deployment
3. Isolation
4. Scalability

Start containerizing your applications today!
    `,
    excerpt: 'Get started with Docker and learn how to containerize your applications for consistent development and deployment.',
    tags: ['docker', 'devops', 'containers', 'deployment'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
  },
  {
    title: 'JWT Authentication Explained',
    content: `
# Understanding JWT Authentication

JSON Web Tokens (JWT) are a popular way to handle authentication in modern web applications. Let's break it down!

## What is JWT?

A JWT is a compact, URL-safe token that contains claims about a user. It consists of three parts:

1. **Header**: Token type and algorithm
2. **Payload**: Claims (user data)
3. **Signature**: Verification

## How It Works

\`\`\`javascript
// Login
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify
const decoded = jwt.verify(token, process.env.JWT_SECRET);
\`\`\`

## Implementation Example

\`\`\`javascript
// Middleware
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

## Best Practices

1. **Use HTTPS**: Always transmit tokens over secure connections
2. **Short Expiration**: Don't make tokens last forever
3. **Secure Secret**: Use a strong, random secret
4. **Refresh Tokens**: Implement token refresh mechanism
5. **Don't Store Sensitive Data**: Keep payload minimal

## Security Considerations

- Store tokens securely (httpOnly cookies or secure storage)
- Implement token refresh
- Use strong signing algorithms (HS256, RS256)
- Validate tokens on every request

JWT is powerful but must be used correctly. Follow these practices for secure authentication!
    `,
    excerpt: 'Learn how to implement secure JWT authentication in your web applications with best practices.',
    tags: ['authentication', 'jwt', 'security', 'backend'],
    published: true,
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
  },
];

// Sample comments
const comments = [
  { text: 'Great article! Very helpful for beginners.', postIndex: 0 },
  { text: 'Thanks for the detailed explanation. The code examples really helped!', postIndex: 0 },
  { text: 'Could you cover advanced TypeScript features in a future post?', postIndex: 0 },
  { text: 'This is exactly what I needed. Clear and concise!', postIndex: 1 },
  { text: 'The repository pattern section was particularly useful. Thanks!', postIndex: 1 },
  { text: 'How do you handle authentication in your REST APIs?', postIndex: 1 },
  { text: 'Flexbox and Grid are game changers. Love this guide!', postIndex: 2 },
  { text: 'The responsive design tips are gold. Bookmarked!', postIndex: 2 },
  { text: 'Finally understood the difference between Flexbox and Grid. Thank you!', postIndex: 2 },
  { text: 'Custom hooks are so powerful once you understand them!', postIndex: 3 },
  { text: 'Could you write about useReducer next?', postIndex: 3 },
  { text: 'The useLocalStorage example is brilliant. Using it in my project!', postIndex: 3 },
  { text: 'MongoDB is amazing for rapid prototyping!', postIndex: 4 },
  { text: 'How do you handle migrations in MongoDB?', postIndex: 4 },
  { text: 'Great comparison with SQL databases.', postIndex: 4 },
  { text: 'Async/await makes JavaScript so much cleaner!', postIndex: 5 },
  { text: 'The Promise.all example was exactly what I was looking for!', postIndex: 5 },
  { text: 'Docker changed my development workflow completely!', postIndex: 6 },
  { text: 'Could you cover Kubernetes next?', postIndex: 6 },
  { text: 'JWT is perfect for stateless authentication!', postIndex: 7 },
  { text: 'How do you handle token refresh?', postIndex: 7 },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.username}`);
    }

    // Create posts
    console.log('📝 Creating posts...');
    const createdPosts = [];
    for (let i = 0; i < posts.length; i++) {
      const postData = posts[i];
      const author = createdUsers[i % createdUsers.length];

      const post = await Post.create({
        ...postData,
        slug: generateSlug(postData.title),
        author: author._id,
        publishedAt: postData.published ? new Date() : undefined,
      });
      createdPosts.push(post);
      console.log(`   ✓ Created post: ${post.title}`);
    }

    // Add likes to posts (random)
    console.log('❤️  Adding likes to posts...');
    for (const post of createdPosts) {
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1-4 likes
      const likers = createdUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, numLikes);

      for (const liker of likers) {
        post.likes.push(liker._id);
      }
      post.likesCount = post.likes.length;
      await post.save();
      console.log(`   ✓ Added ${numLikes} likes to: ${post.title}`);
    }

    // Create comments
    console.log('💬 Creating comments...');
    const createdComments = [];
    for (const commentData of comments) {
      const post = createdPosts[commentData.postIndex];
      const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];

      const comment = await Comment.create({
        content: commentData.text,
        author: author._id,
        post: post._id,
      });
      createdComments.push(comment);

      // Update post comment count
      post.commentsCount += 1;
      await post.save();

      console.log(`   ✓ Created comment on: ${post.title}`);
    }

    // Add some replies to comments
    console.log('💬 Adding comment replies...');
    for (let i = 0; i < 10; i++) {
      const parentComment = createdComments[Math.floor(Math.random() * createdComments.length)];
      const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];

      await Comment.create({
        content: `Thanks for your comment! I'm glad you found it helpful.`,
        author: author._id,
        post: parentComment.post,
        parentComment: parentComment._id,
      });

      // Update post comment count
      const post = await Post.findById(parentComment.post);
      if (post) {
        post.commentsCount += 1;
        await post.save();
      }

      console.log(`   ✓ Created reply to comment`);
    }

    // Add likes to comments (random)
    console.log('❤️  Adding likes to comments...');
    for (const comment of createdComments) {
      const numLikes = Math.floor(Math.random() * 3); // 0-2 likes
      const likers = createdUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, numLikes);

      for (const liker of likers) {
        comment.likes.push(liker._id);
      }
      comment.likesCount = comment.likes.length;
      await comment.save();
    }

    // Add followers (users following each other)
    console.log('👥 Creating follower relationships...');
    for (const user of createdUsers) {
      const numFollowing = Math.floor(Math.random() * 3) + 1; // 1-3 following
      const following = createdUsers
        .filter(u => u._id.toString() !== user._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, numFollowing);

      for (const followedUser of following) {
        user.following.push(followedUser._id);
        followedUser.followers.push(user._id);
        await followedUser.save();
      }
      await user.save();
      console.log(`   ✓ ${user.username} now follows ${numFollowing} users`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Posts: ${createdPosts.length}`);
    console.log(`   Comments: ${createdComments.length + 10} (including replies)`);
    console.log('\n🔐 Test credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('\n   (All users use password: password123)');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

// Run seed
seed();

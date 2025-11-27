// MongoDB initialization script
db = db.getSiblingDB('blog');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        }
      }
    }
  }
});

db.createCollection('posts');
db.createCollection('comments');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ tags: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ 'likes': 1 });
db.comments.createIndex({ post: 1 });
db.comments.createIndex({ author: 1 });

print('Database initialized successfully!');

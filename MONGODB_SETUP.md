# MongoDB Setup Options

## Option 1: Using Docker (Recommended)

Make sure Docker Desktop is running, then:

```bash
make dev
```

This automatically starts MongoDB in a Docker container.

## Option 2: MongoDB Atlas (Cloud - No Docker needed)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/blog`)
4. Update `.env`:
   ```
   MONGODB_URI=your-connection-string-here
   ```
5. Run: `bun run dev`

## Option 3: Install MongoDB Locally

### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Update .env to use local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/blog
```

Then run:
```bash
bun run dev
```

## Troubleshooting

**Docker commands hanging?**
- Make sure Docker Desktop is running
- Try restarting Docker Desktop
- Check Docker Desktop settings

**Can't connect to MongoDB?**
- Check if MongoDB is running: `docker ps` (should show blog-mongodb)
- Check port 27017 is available: `lsof -i :27017`
- Try stopping and restarting: `make dev-stop` then `make dev`

**Still having issues?**
Use MongoDB Atlas (Option 2) - it's the easiest and requires no local setup!

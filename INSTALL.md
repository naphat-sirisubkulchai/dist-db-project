# Installation Guide

This guide covers installation for all platforms (macOS, Windows, Linux).

## 🚀 Quick Install

### macOS

```bash
git clone <your-repo>
cd dist-db-project
make install
make dev
```

That's it! `make install` automatically:
- ✅ Installs MongoDB via Homebrew
- ✅ Starts MongoDB service
- ✅ Installs all project dependencies

### Windows

#### PowerShell (Recommended)

**Run PowerShell as Administrator**, then:

```powershell
git clone <your-repo>
cd dist-db-project
.\install.ps1
bun run dev
```

#### Batch File

**Run Command Prompt as Administrator**, then:

```cmd
git clone <your-repo>
cd dist-db-project
install.bat
bun run dev
```

### Linux

#### Ubuntu/Debian

```bash
git clone <your-repo>
cd dist-db-project

# Install MongoDB
sudo apt-get install mongodb -y
sudo systemctl start mongod
sudo systemctl enable mongod

# Install project dependencies
bun install
bun run dev
```

#### Using Docker (Any Linux)

```bash
git clone <your-repo>
cd dist-db-project
make docker-up
bun run dev
```

## 📦 What Gets Installed

### Automatic Installation Includes:

- **MongoDB 7.0** - Database server
  - macOS: via Homebrew
  - Windows: via Chocolatey
  - Linux: via package manager or Docker

- **Project Dependencies** - All npm packages via Bun

### You Need to Install Manually:

- **Bun** - JavaScript runtime
  - macOS: `brew install bun`
  - Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`
  - Linux: `curl -fsSL https://bun.sh/install | bash`

## 🔧 MongoDB Management

### macOS

```bash
make mongo-start    # Start MongoDB
make mongo-stop     # Stop MongoDB
make mongo-status   # Check status
```

### Windows

```powershell
net start MongoDB   # Start
net stop MongoDB    # Stop
Get-Service MongoDB # Status
```

### Linux

```bash
sudo systemctl start mongod   # Start
sudo systemctl stop mongod    # Stop
sudo systemctl status mongod  # Status
```

## 🐳 Alternative: Docker

If you prefer Docker over local MongoDB:

```bash
# Start MongoDB in Docker
docker run -d --name blog-mongodb -p 27017:27017 mongo:7.0

# Or use docker-compose
make docker-up

# Then start the app
make dev
```

## ⚙️ Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` if needed (defaults work fine):
   ```env
   PORT=4000  # Backend port
   MONGODB_URI=mongodb://localhost:27017/blog
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

3. For frontend (optional):
   ```bash
   cd frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
   ```

## 🎯 Next Steps

After installation:

1. **Start Backend:**
   ```bash
   make dev
   # Runs on http://localhost:4000
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm install  # First time only
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs: http://localhost:4000/swagger

## 🐛 Troubleshooting

### MongoDB won't start

**macOS:**
```bash
brew services restart mongodb-community@7.0
brew services list | grep mongodb
```

**Windows:**
```powershell
# Check if service exists
Get-Service MongoDB

# Restart
net stop MongoDB
net start MongoDB
```

**Linux:**
```bash
sudo systemctl restart mongod
sudo journalctl -u mongod -f  # View logs
```

### Port already in use

If port 3000 or 4000 is busy:

```bash
# Find and kill the process
lsof -i :3000  # or :4000
kill -9 <PID>
```

### Bun not found

Install Bun:
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

## 🆘 Getting Help

If you encounter issues:

1. Check MongoDB is running: `make mongo-status` (macOS)
2. Check port availability: `lsof -i :27017`
3. View detailed logs: `make logs` (if using Docker)
4. Restart everything: `make mongo-stop && make mongo-start && make dev`

Still stuck? [Open an issue](https://github.com/your-repo/issues)

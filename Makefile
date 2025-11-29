.PHONY: help install dev mongo-start mongo-stop mongo-status seed build start stop restart logs clean test lint format docker-build docker-up docker-down docker-logs docker-clean

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies and MongoDB
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Detecting operating system...$(NC)"
	@if [ "$$(uname)" = "Darwin" ]; then \
		echo "$(GREEN)macOS detected - Installing MongoDB via Homebrew...$(NC)"; \
		if ! command -v brew > /dev/null 2>&1; then \
			echo "$(RED)Homebrew not found! Please install it first:$(NC)"; \
			echo "  /bin/bash -c \"\$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""; \
			exit 1; \
		fi; \
		if ! brew list mongodb-community@7.0 > /dev/null 2>&1; then \
			echo "$(YELLOW)Installing MongoDB Community 7.0...$(NC)"; \
			brew tap mongodb/brew 2>/dev/null || true; \
			brew install mongodb-community@7.0; \
			echo "$(GREEN)Starting MongoDB service...$(NC)"; \
			brew services start mongodb/brew/mongodb-community@7.0; \
		else \
			echo "$(GREEN)MongoDB already installed!$(NC)"; \
			brew services start mongodb/brew/mongodb-community@7.0 2>/dev/null || true; \
		fi; \
	elif [ "$$(uname)" = "Linux" ]; then \
		echo "$(GREEN)Linux detected$(NC)"; \
		echo "$(YELLOW)Please install MongoDB manually or use Docker:$(NC)"; \
		echo "  sudo apt-get install mongodb (Ubuntu/Debian)"; \
		echo "  sudo yum install mongodb (RedHat/CentOS)"; \
		echo "  OR use: make docker-up"; \
	elif echo "$$(uname)" | grep -qi "mingw\|msys\|cygwin"; then \
		echo "$(GREEN)Windows detected$(NC)"; \
		echo "$(YELLOW)Please install MongoDB using one of these methods:$(NC)"; \
		echo "  1. Chocolatey: choco install mongodb"; \
		echo "  2. Download installer: https://www.mongodb.com/try/download/community"; \
		echo "  3. Use Docker: make docker-up"; \
	else \
		echo "$(YELLOW)Unknown OS - Please install MongoDB manually$(NC)"; \
		echo "  Visit: https://www.mongodb.com/docs/manual/installation/"; \
	fi
	@echo "$(GREEN)Installing Node dependencies...$(NC)"
	@bun install
	@echo "$(GREEN)Installation complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Update .env if needed"
	@echo "  2. Run: make dev"

dev: ## Run development server with hot reload
	@echo "$(GREEN)Starting development server...$(NC)"
	bun run dev

mongo-start: ## Start MongoDB service
	@echo "$(GREEN)Starting MongoDB...$(NC)"
	@brew services start mongodb/brew/mongodb-community@7.0

mongo-stop: ## Stop MongoDB service
	@echo "$(YELLOW)Stopping MongoDB...$(NC)"
	@brew services stop mongodb/brew/mongodb-community@7.0

mongo-status: ## Check MongoDB status
	@brew services list | grep mongodb

seed: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(NC)"
	@bun run seed
	@echo "$(GREEN)Database seeded successfully!$(NC)"

build: ## Build the application
	@echo "$(GREEN)Building application...$(NC)"
	bun run build

start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	bun run start

test: ## Run tests
	@echo "$(GREEN)Running tests...$(NC)"
	bun test

lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	bun run lint

format: ## Format code
	@echo "$(GREEN)Formatting code...$(NC)"
	bun run format

clean: ## Clean build artifacts and dependencies
	@echo "$(RED)Cleaning build artifacts...$(NC)"
	rm -rf dist node_modules bun.lockb

# Docker commands
docker-build: ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build

docker-up: ## Start Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Containers started successfully!$(NC)"
	@echo "API: http://localhost:3000"
	@echo "MongoDB Express: http://localhost:8081"

docker-down: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	docker-compose down

docker-restart: ## Restart Docker containers
	@echo "$(YELLOW)Restarting Docker containers...$(NC)"
	docker-compose restart

docker-logs: ## View Docker container logs
	docker-compose logs -f

docker-logs-app: ## View application logs only
	docker-compose logs -f app

docker-logs-mongo: ## View MongoDB logs only
	docker-compose logs -f mongodb

docker-clean: ## Stop containers and remove volumes
	@echo "$(RED)Stopping containers and removing volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)Cleanup complete!$(NC)"

docker-rebuild: docker-clean docker-build docker-up ## Rebuild and restart all containers

# Database commands
db-seed: ## Seed the database with sample data (implement your own seeder)
	@echo "$(GREEN)Seeding database...$(NC)"
	@echo "$(YELLOW)Note: Implement your seeding logic$(NC)"

db-backup: ## Backup MongoDB database
	@echo "$(GREEN)Backing up database...$(NC)"
	mkdir -p backups
	docker-compose exec -T mongodb mongodump --out=/tmp/backup --db=blog
	docker cp $$(docker-compose ps -q mongodb):/tmp/backup ./backups/$$(date +%Y%m%d_%H%M%S)
	@echo "$(GREEN)Backup completed!$(NC)"

db-restore: ## Restore MongoDB database from latest backup
	@echo "$(YELLOW)Restoring from latest backup...$(NC)"
	@latest=$$(ls -t backups | head -1); \
	docker cp backups/$$latest $$(docker-compose ps -q mongodb):/tmp/restore; \
	docker-compose exec mongodb mongorestore --db=blog /tmp/restore/blog
	@echo "$(GREEN)Restore completed!$(NC)"

# Utility commands
ps: ## Show running containers
	docker-compose ps

shell-app: ## Open shell in app container
	docker-compose exec app sh

shell-mongo: ## Open MongoDB shell
	docker-compose exec mongodb mongosh blog

# Development workflow
dev-setup: install ## Complete development setup
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then cp .env.example .env; echo "$(YELLOW)Created .env file from .env.example$(NC)"; fi
	@echo "$(GREEN)Development environment ready!$(NC)"
	@echo "$(YELLOW)Remember to update .env with your configuration$(NC)"

dev-start: dev-setup docker-up ## Full development start (setup + docker)
	@echo "$(GREEN)Development environment is running!$(NC)"
	@echo "Run 'make dev' in another terminal to start the development server"

prod-deploy: docker-build docker-up ## Deploy to production
	@echo "$(GREEN)Production deployment complete!$(NC)"

# Monitoring
stats: ## Show Docker container stats
	docker stats $$(docker-compose ps -q)

inspect-app: ## Inspect app container
	docker inspect $$(docker-compose ps -q app)

# Quick shortcuts
up: docker-up ## Alias for docker-up
down: docker-down ## Alias for docker-down
logs: docker-logs ## Alias for docker-logs
restart: docker-restart ## Alias for docker-restart

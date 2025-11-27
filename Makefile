.PHONY: help install dev build start stop restart logs clean test lint format docker-build docker-up docker-down docker-logs docker-clean

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

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	bun install

dev: ## Run development server with hot reload
	@echo "$(GREEN)Starting development server...$(NC)"
	bun run dev

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

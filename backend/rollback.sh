#!/bin/bash
# CODEMAFIA Rollback Procedure
# Usage: ./rollback.sh [tag-or-commit]
set -e

APP_DIR="/var/www/codemafia"
BACKUP_DIR="/var/backups/codemafia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ $# -eq 0 ]; then
    echo "Usage: $0 <target-commit-or-tag>"
    echo "Available tags:"
    git -C "$APP_DIR" tag --sort=-creatordate | head -10
    exit 1
fi

TARGET=$1

echo "=== CODEMAFIA Rollback to $TARGET ==="
echo "Started at: $TIMESTAMP"

# 1. Put application in maintenance mode
echo "[1/5] Putting application in maintenance mode..."
cd "$APP_DIR/backend"
php artisan down --retry=60

# 2. Backup current state
echo "[2/5] Backing up current state..."
cp .env ".env.rollback-${TIMESTAMP}"
php artisan db:dump --compressed > "$BACKUP_DIR/pre-rollback-${TIMESTAMP}.sql.gz" 2>/dev/null || true

# 3. Git rollback
echo "[3/5] Rolling back code..."
git -C "$APP_DIR" fetch --tags
git -C "$APP_DIR" checkout "$TARGET"

# 4. Restore dependencies
echo "[4/5] Restoring dependencies..."
composer install --no-dev --optimize-autoloader

# 5. Run migrations and cache
echo "[5/5] Running migrations and caching..."
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan optimize

# Bring application back up
php artisan up

echo "=== Rollback complete ==="
echo "Current commit: $(git -C $APP_DIR log --oneline -1)"
echo "To restore .env if needed: cp .env.rollback-${TIMESTAMP} .env"

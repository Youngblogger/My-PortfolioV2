#!/bin/bash
# CODEMAFIA Ecosystem - cPanel Deployment Script
# Usage: bash deploy.sh /path/to/deployment/directory

set -euo pipefail

DEPLOY_DIR="${1:-deploy}"
APP_DIR="$DEPLOY_DIR/backend"
PUBLIC_DIR="$DEPLOY_DIR/public_html"

echo "=== CODEMAFIA Deployment ==="
echo "Deploying to: $DEPLOY_DIR"

# Step 1: Create deployment directory
mkdir -p "$APP_DIR" "$PUBLIC_DIR"

# Step 2: Copy application files (excluding dev files)
echo "Copying application files..."
rsync -av \
    --exclude='.git/' \
    --exclude='node_modules/' \
    --exclude='tests/' \
    --exclude='.env' \
    --exclude='deploy.sh' \
    --exclude='storage/framework/cache/data/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='storage/logs/*' \
    ./ "$APP_DIR/"

# Step 3: Install Composer dependencies (production only)
echo "Installing Composer dependencies..."
cd "$APP_DIR"
composer install --optimize-autoloader --no-dev --no-interaction

# Step 4: Create .env from template if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example.laravel .env
    echo ">>> IMPORTANT: Edit .env and set your database credentials, API keys, and APP_KEY <<<"
    echo ">>> Run: php artisan key:generate <<<"
fi

# Step 5: Create storage link
php artisan storage:link --force

# Step 6: Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Step 7: Cache for production
echo "Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Step 8: Link public directory
echo "Setting up public directory symlink..."
cd "$PUBLIC_DIR"
ln -sf "$APP_DIR/public/"* .
ln -sf "$APP_DIR/public/." .

# Step 9: Set permissions
echo "Setting directory permissions..."
find "$APP_DIR/storage" -type d -exec chmod 775 {} \;
find "$APP_DIR/bootstrap/cache" -type d -exec chmod 775 {} \;

echo "=== Deployment Complete ==="
echo ""
echo ""
echo "=== IMPORTANT: Manual Steps ==="
echo "  1. Edit $APP_DIR/.env — set DB credentials, API keys"
echo "  2. Run: cd $APP_DIR && php artisan key:generate"
echo ""
echo "=== Cron (REQUIRED) ==="
echo "  Add to crontab:"
echo "  * * * * * php $APP_DIR/artisan schedule:run >> /dev/null 2>&1"
echo ""
echo "=== Queue Worker (REQUIRED for async jobs) ==="
echo "  Start supervisor or screen/tmux to keep the worker alive:"
echo "  php $APP_DIR/artisan queue:work --tries=3 --delay=3 --timeout=300"
echo ""
echo "=== Web Server ==="
echo "  Point your document root to: $PUBLIC_DIR"
echo ""
echo "=== Verify ==="
echo "  Visit: https://codemafia.ng/api/v1/up"
echo "  Login and test a full transaction flow"

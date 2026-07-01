#!/bin/bash
set -e

echo "=== CODEMAFIA Production Deployment ==="

# 1. Environment
if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.production to .env and configure."
    exit 1
fi

# 2. Install dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# 3. Run migrations
echo "Running database migrations..."
php artisan migrate --force

# 4. Clear caches
echo "Clearing caches..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 5. Storage link
echo "Linking storage..."
php artisan storage:link || true

# 6. Queue migration for sessions
echo "Creating session table if not exists..."
php artisan session:table || true
php artisan migrate --force

echo ""
echo "=== Deployment Complete ==="
echo "Next steps:"
echo "  1. Set APP_ENV=production and APP_DEBUG=false in .env"
echo "  2. Restart queue worker: php artisan queue:restart"
echo "  3. Set up supervisor for queue worker"
echo "  4. Verify SSL certificate"
echo "  5. Configure web server (Nginx/Apache)"
echo "  6. Set up cron for scheduler: php artisan schedule:run"
echo "  7. Run health check: php artisan up"

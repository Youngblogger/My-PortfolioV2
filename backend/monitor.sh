#!/bin/bash
# CODEMAFIA Production Monitor
# Run this via cron every 5 minutes: */5 * * * * /path/to/monitor.sh
set -e

APP_DIR="/var/www/codemafia"
LOG_FILE="/var/log/codemafia-monitor.log"
ALERT_EMAIL="hello@codemafia.ng"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

alert() {
    log "ALERT: $1"
    echo "CODEMAFIA Alert: $1" | mail -s "CODEMAFIA Alert" "$ALERT_EMAIL" || true
}

# 1. Health check
HEALTH=$(curl -sf http://localhost:8000/api/v1/health 2>/dev/null || echo "FAILED")
if [ "$HEALTH" = "FAILED" ]; then
    alert "Health endpoint unreachable. Attempting restart..."
    cd "$APP_DIR/backend" && php artisan down --retry=60
    php artisan up
    exit 1
fi

STATUS=$(echo "$HEALTH" | php -r 'echo json_decode(file_get_contents("php://stdin"))->status;')
if [ "$STATUS" != "healthy" ]; then
    alert "Health check failed: $STATUS"
    exit 1
fi

log "Health check passed"

# 2. Queue worker check
if ! pgrep -f "queue:work" > /dev/null; then
    alert "Queue worker is not running. Attempting restart..."
    nohup php "$APP_DIR/backend/artisan" queue:work database --sleep=3 --tries=3 --timeout=90 > /dev/null 2>&1 &
fi

# 3. Failed jobs check
FAILED_COUNT=$(cd "$APP_DIR/backend" && php artisan queue:failed 2>/dev/null | wc -l)
if [ "$FAILED_COUNT" -gt 0 ]; then
    alert "$FAILED_COUNT failed jobs in queue"
fi

# 4. Disk usage check
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    alert "Disk usage at ${DISK_USAGE}%"
fi

# 5. Memory check
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEM_USAGE" -gt 90 ]; then
    alert "Memory usage at ${MEM_USAGE}%"
fi

# 6. SSL expiry check
SSL_EXPIRY=$(echo | openssl s_client -servername codemafia.ng -connect codemafia.ng:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    SSL_DAYS=$(( ($(date -d "$SSL_EXPIRY" +%s) - $(date +%s)) / 86400 ))
    if [ "$SSL_DAYS" -lt 14 ]; then
        alert "SSL certificate expires in $SSL_DAYS days"
    fi
    log "SSL expires in $SSL_DAYS days"
fi

log "Monitor complete"

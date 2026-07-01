#!/bin/bash
# CODEMAFIA Database Backup
# Run daily via cron: 0 3 * * * /path/to/backup.sh
set -e

BACKUP_DIR="/var/backups/codemafia"
DB_NAME="codemafia"
DB_USER="codemafia"
DB_PASS="$(grep DB_PASSWORD /var/www/codemafia/backend/.env | cut -d= -f2-)"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://codemafia-backups"

mkdir -p "$BACKUP_DIR"

# Dump database
mysqldump --single-transaction --routines --triggers \
    -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
    | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Dump storage files
tar czf "$BACKUP_DIR/storage_${DATE}.tar.gz" \
    -C /var/www/codemafia/backend storage/app/public

# Clean old backups
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "storage_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Sync to remote if configured
if command -v aws &> /dev/null && [ -n "$S3_BUCKET" ]; then
    aws s3 sync "$BACKUP_DIR" "$S3_BUCKET/$(date +%Y/%m)" --delete
fi

echo "[$(date)] Backup complete: ${DB_NAME}_${DATE}.sql.gz ($(ls -lh ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz | awk '{print $5}'))"

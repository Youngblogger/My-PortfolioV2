#!/bin/bash
# CODEMAFIA Ecosystem - Cron Job Setup
# Run this script once after deployment to set up scheduled tasks
# 
# In cPanel, add a cron job:
#   * * * * * /usr/bin/php /home/user/api.codemafia.ng/backend/artisan schedule:run >> /dev/null 2>&1
#
# Or run this script to install it:
#   bash cron-setup.sh /path/to/backend

BACKEND_DIR="${1:-/home/user/api.codemafia.ng/backend}"
CRON_CMD="* * * * * /usr/bin/php $BACKEND_DIR/artisan schedule:run >> /dev/null 2>&1"

echo "=== CODEMAFIA Cron Setup ==="
echo "Add the following cron job via cPanel:"
echo ""
echo "$CRON_CMD"
echo ""
echo "Or to install directly (if crontab is available):"
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab - && echo "Cron job installed."

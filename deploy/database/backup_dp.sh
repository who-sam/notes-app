#!/bin/bash

# Backup directory
BACKUP_DIR="/backup/db"
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup file
BACKUP_FILE="$BACKUP_DIR/notes_db_$TIMESTAMP.sql.gz"

# Database credentials
DB_USER="notes_user"
DB_PASS="your_strong_password"  # Replace with actual password
DB_NAME="notes_app"

# Perform backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "notes_db_*.sql.gz" -mtime +7 -delete

# Verify
echo "Backup created: $BACKUP_FILE"
ls -lh $BACKUP_FILE

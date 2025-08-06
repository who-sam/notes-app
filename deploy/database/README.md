# Database Setup Guide

This guide provides the complete steps to set up the MariaDB database for the Notes application, including user creation, permissions, and table schema.

## Prerequisites
- MariaDB installed on your server
- Root access to MariaDB

## Setup Steps

### 1. Connect to MariaDB as Root
```bash
sudo mysql -u root -p
```

### 2. Create Database and User
```sql
CREATE DATABASE notes_app;
CREATE USER 'notes_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON notes_app.* TO 'notes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Backend Environment
Edit the backend `.env` file:
```bash
nano ~/notes-web-app/backend/.env
```

Add these configurations:
```env
DB_HOST=localhost
DB_USER=notes_user
DB_PASSWORD=your_strong_password
DB_NAME=notes_app
```

### 4. Create Notes Table
Connect to the database as the application user:
```bash
mysql -u notes_user -p notes_app
```

Execute the table creation SQL:
```sql
CREATE TABLE notes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Verify the table creation:
```sql
SHOW TABLES;
DESCRIBE notes;
```

## Database Schema

### Table: notes

| Column       | Type         | Constraints                                              | Description                     |
|--------------|--------------|----------------------------------------------------------|---------------------------------|
| id           | VARCHAR(36)  | PRIMARY KEY                                              | Unique note identifier (UUID)   |
| title        | VARCHAR(255) |                                                          | Note title                      |
| content      | TEXT         |                                                          | Note content                    |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                                | Creation timestamp              |
| updated_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP<br>ON UPDATE CURRENT_TIMESTAMP | Last update timestamp           |

## Verification

### Test Database Connection
```bash
mysql -u notes_user -p -e "SHOW DATABASES;"
```

### Test Table Access
```bash
mysql -u notes_user -p notes_app -e "SHOW TABLES;"
```

## Security Best Practices

1. **Use Strong Passwords**: Always use complex passwords for database users
2. **Restrict Access**: Only allow localhost connections for application user
3. **Regular Backups**: Implement daily backups using the backup script
4. **Environment Protection**: Secure your `.env` file:
   ```bash
   chmod 600 ~/notes-web-app/backend/.env
   ```

## Backup and Restore

### Manual Backup
```bash
mysqldump -u notes_user -p notes_app > notes_backup.sql
```

### Manual Restore
```bash
mysql -u notes_user -p notes_app < notes_backup.sql
```

### Automated Backup
Use the [backup script](./backup_db.sh) configured in cron

## Troubleshooting

### Common Issues
1. **Access Denied**:
   - Verify username/password in `.env`
   - Confirm user privileges: `SHOW GRANTS FOR 'notes_user'@'localhost';`

2. **Table Not Found**:
   - Connect to correct database: `USE notes_app;`
   - Verify table exists: `SHOW TABLES;`

3. **Connection Issues**:
   - Check MariaDB service status: `sudo systemctl status mariadb`
   - Verify MariaDB is listening: `sudo ss -tulpn | grep mysql`

## Schema Migration

To update the schema after initial setup:

1. Create migration script:
```sql
-- Example: Add new column
ALTER TABLE notes ADD COLUMN category VARCHAR(50) AFTER title;
```

2. Apply changes:
```bash
mysql -u notes_user -p notes_app < migration.sql
```

Always test migrations in a development environment before applying to production.

## Database Configuration Files

| File          | Location                       | Purpose                      |
|---------------|--------------------------------|------------------------------|
| Main Config   | `/etc/my.cnf`                  | MariaDB server configuration |
| .env          | `~/notes-web-app/backend/.env` | Database connection settings |
| Backup Script | `/usr/local/bin/backup_db.sh`  | Automated database backups   |
| Schema SQL    | `deploy/database/schema.sql`   | Database schema definition   |

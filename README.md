# Notes Application

A full-stack note-taking application with a React frontend and Flask backend, deployed on AWS EC2 with automated backups.

![Notes Application Screenshot](https://raw.githubusercontent.com/who-sam/who-sam/main/assets/notes_app2.png)

## Features

- Create, edit, and delete notes
- Responsive design with mobile support
- Real-time updates
- Automated database backups
- User-friendly interface
- Secure user authentication (coming soon)

## Technology Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Router

### Backend
- Python
- Flask
- Gunicorn
- MariaDB
- REST API

### Infrastructure
- AWS EC2 (RHEL)
- Nginx Reverse Proxy
- systemd Service Management
- EBS Volumes for Backups
- Cron Jobs

### System Architecture
<img src="https://raw.githubusercontent.com/who-sam/who-sam/main/assets/system_struct.png" width="500"/>

## Installation (Development)

### Prerequisites
- Node.js v18+
- Python 3.9+
- MariaDB

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run backend
flask run
```

## Production Deployment

### Infrastructure Requirements
- AWS EC2 instance (RHEL)
- Security group with ports 22, 80, 443 open
- 2 EBS volumes (root + backup)

### Deployment Steps

1. **System Setup**
```bash
sudo yum update -y
sudo yum install -y python3-pip python3-devel gcc nginx nodejs mariadb-server mariadb-devel git
```

2. **Database Configuration**
```sql
CREATE DATABASE notes_app;
CREATE USER 'notes_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON notes_app.* TO 'notes_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Application Setup**
```bash
git clone https://github.com/your-username/notes-web-app.git
cd notes-web-app

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn
cp .env.example .env  # Edit with your credentials

# Frontend
cd ../frontend
npm install
npm run build
```

4. **Service Configuration**
```bash
# Create systemd service
sudo nano /etc/systemd/system/notes-backend.service
```
```ini
[Unit]
Description=Notes App Flask Backend
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/notes-web-app/backend
Environment="FLASK_APP=app.py"
EnvironmentFile=/home/ec2-user/notes-web-app/backend/.env
ExecStart=/home/ec2-user/notes-web-app/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

5. **Nginx Configuration**
```bash
sudo nano /etc/nginx/conf.d/notes-app.conf
```
```nginx
server {
    listen 80;
    server_name <your-server-name> localhost;
    
    root /home/ec2-user/notes-web-app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

6. **Start Services**
```bash
sudo systemctl daemon-reload
sudo systemctl start notes-backend
sudo systemctl enable notes-backend
sudo systemctl restart nginx
```

7. **Security Configuration**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_can_network_relay 1
```

8. **Backup Setup**
```bash
# Create backup script
sudo nano /usr/local/bin/backup_db.sh
```
```bash
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
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup_db.sh

# Add to crontab
sudo crontab -e
```
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup_db.sh

# Log rotation
0 3 * * * find /var/log/backup.log -mtime +30 -delete
```

## Project Structure

```
notes-web-app/
├── backend/             # Flask application
│   ├── app.py           # Main application
│   ├── requirements.txt # Python dependencies
│   └── .env             # Environment variables
│
├── frontend/            # React application
│   ├── src/             # Source files
│   ├── public/          # Static assets
│   └── package.json     # Node dependencies
│
├── deploy/              # Deployment configurations
│   ├── nginx/           # Nginx configs
│   └── systemd/         # systemd service files
│
└── README.md            # Project documentation
```

## Backup and Recovery

### Manual Backup
```bash
sudo /usr/local/bin/backup_db.sh
```

### Restore Database
```bash
zcat /backup/db/notes_db_<timestamp>.sql.gz | mysql -u root -p notes_app
```

### Automatic Backups
- Runs daily at 2 AM
- Stored in `/backup/db`
- Retained for 7 days

## Maintenance

### Updating the Application
```bash
cd ~/notes-web-app
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart notes-backend

# Update frontend
cd ../frontend
npm run build
```

### Monitoring Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
journalctl -u notes-backend -f
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

---

**Note**: Replace placeholder values (your-username, your-domain.com, your_password) with your actual information before deployment.

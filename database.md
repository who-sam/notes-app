
`sudo mysql -u root -p`

---

```SQL
CREATE DATABASE notes_app;
CREATE USER 'notes_user'@'localhost' IDENTIFIED BY 'hsz7';
GRANT ALL PRIVILEGES ON notes_app.* TO 'notes_user'@'localhost';
FLUSH PRIVILEGES;
```

---

- then exit and edit the .env file in the backend 
```
DB_HOST=localhost
DB_USER=notes_user
DB_PASSWORD=hsz7
DB_NAME=notes_app
```

---

then `mysql -u notes_user -p notes_app`

```SQL
CREATE TABLE notes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

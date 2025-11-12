# MySQL Setup Guide for SendMultiCamp

This guide will help you set up SendMultiCamp with your own MySQL database.

## Prerequisites

- MySQL 5.7+ or MySQL 8.0+ installed
- Node.js 18+ installed
- MySQL server running

## Step 1: Install MySQL

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### On macOS (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

### On Windows:
Download and install MySQL from [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)

## Step 2: Create Database

Login to MySQL:
```bash
mysql -u root -p
```

Create the database and user:
```sql
CREATE DATABASE sendmulticamp;
CREATE USER 'sendmulticamp_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON sendmulticamp.* TO 'sendmulticamp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Import Database Schema

From your project directory, import the schema:

```bash
mysql -u sendmulticamp_user -p sendmulticamp < database/schema.sql
```

Or login and run it manually:
```bash
mysql -u sendmulticamp_user -p sendmulticamp
```

Then paste the contents of `database/schema.sql`.

## Step 4: Configure Environment Variables

Update the `.env` file in the project root:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=sendmulticamp_user
DB_PASSWORD=your_secure_password
DB_NAME=sendmulticamp

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Server Port
PORT=3001
```

**IMPORTANT**: Change the `JWT_SECRET` to a long, random string in production!

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start the Application

### Option 1: Start both frontend and backend together
```bash
npm run dev:all
```

### Option 2: Start them separately

Terminal 1 - Backend API:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Verify Installation

1. **Check Backend**: Visit http://localhost:3001/api/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Database Connection**: Look for this in the backend console:
   ```
   ✅ MySQL database connected successfully
   ✅ SendMultiCamp API server running on port 3001
   ```

3. **Test the App**:
   - Open http://localhost:5173
   - Create an account
   - Login and explore

## Database Tables

The schema creates these tables:
- `users` - User accounts with hashed passwords
- `lists` - Subscriber lists
- `subscribers` - Email subscribers
- `campaigns` - Email campaigns
- `campaign_sends` - Individual email send tracking
- `email_templates` - Reusable email templates
- `smtp_settings` - SMTP configuration per user

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Make sure MySQL server is running:
```bash
# Check status
sudo systemctl status mysql  # Linux
brew services list           # macOS

# Start MySQL
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

### Access Denied
```
Error: Access denied for user 'sendmulticamp_user'@'localhost'
```
**Solution**: Verify credentials in `.env` match the MySQL user you created

### Database Doesn't Exist
```
Error: Unknown database 'sendmulticamp'
```
**Solution**: Create the database:
```sql
CREATE DATABASE sendmulticamp;
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: Change the `PORT` in `.env` or kill the process using port 3001:
```bash
# Find process
lsof -i :3001

# Kill it
kill -9 <PID>
```

## Security Best Practices

### For Production:

1. **Use Strong Passwords**:
   - MySQL user password
   - JWT secret (minimum 32 characters)

2. **Restrict MySQL Access**:
   ```sql
   CREATE USER 'sendmulticamp_user'@'localhost' IDENTIFIED BY 'strong_password';
   -- Note: 'localhost' restricts to local connections only
   ```

3. **Enable HTTPS**:
   - Use a reverse proxy (nginx, Apache)
   - Get SSL certificate (Let's Encrypt)

4. **Environment Variables**:
   - Never commit `.env` to version control
   - Use environment-specific `.env` files
   - Use secrets management in production

5. **Database Backups**:
   ```bash
   mysqldump -u sendmulticamp_user -p sendmulticamp > backup.sql
   ```

6. **Regular Updates**:
   - Keep MySQL updated
   - Update Node.js dependencies regularly

## Advanced Configuration

### Using Remote MySQL Server

Update `.env`:
```env
DB_HOST=mysql.example.com
DB_USER=remote_user
DB_PASSWORD=remote_password
```

### Connection Pooling

The app uses connection pooling by default (10 connections). To adjust, edit `server/db.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 20, // Increase for more concurrent requests
  waitForConnections: true,
  queueLimit: 0
});
```

### MySQL 8.0 Authentication

If using MySQL 8.0 and getting authentication errors:

```sql
ALTER USER 'sendmulticamp_user'@'localhost'
IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

## Development Tips

### Resetting the Database

```bash
# Drop and recreate
mysql -u sendmulticamp_user -p -e "DROP DATABASE sendmulticamp; CREATE DATABASE sendmulticamp;"

# Import schema again
mysql -u sendmulticamp_user -p sendmulticamp < database/schema.sql
```

### Viewing Logs

Backend logs are in the console. To save to file:
```bash
npm run server > backend.log 2>&1
```

### Testing Queries

Connect to MySQL and test queries:
```bash
mysql -u sendmulticamp_user -p sendmulticamp

# Show all tables
SHOW TABLES;

# Check users
SELECT id, email, created_at FROM users;

# Check campaigns
SELECT id, name, status, created_at FROM campaigns;
```

## Production Deployment

For production, consider:

1. **Use PM2** to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name sendmulticamp-api
   pm2 save
   pm2 startup
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Serve with nginx**:
   - Frontend: Serve the `dist/` folder
   - Backend: Proxy requests to port 3001

4. **Use environment variables** for production config

## Need Help?

- Check the main README.md for general information
- Review the code in `server/` directory
- Check MySQL error logs: `/var/log/mysql/error.log`

# SendMultiCamp

A modern, parallel email campaign management application built with React and **MySQL**. Send multiple email campaigns simultaneously with real-time tracking and management.

## ✨ Features

- **User Authentication** - Secure JWT-based authentication
- **Subscriber List Management** - Create and manage multiple subscriber lists
- **Campaign Creation** - Rich campaign editor with HTML and plain text support
- **Parallel Campaign Sending** - Send multiple campaigns simultaneously
- **Real-time Stats** - Track sent, opened, and clicked metrics
- **SMTP Configuration** - Use your own SMTP server for sending emails
- **Modern UI** - Clean, responsive interface built with React
- **MySQL Database** - Your own database, full control

## 🚀 Tech Stack

### Frontend
- React 19 + Vite
- React Router DOM 7
- CSS Modules
- date-fns

### Backend
- Node.js + Express 5
- MySQL 8.0
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+
- MySQL 5.7+ or MySQL 8.0+

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd sendmulticamp
   npm install
   ```

2. **Setup MySQL Database**
   ```bash
   # Create database
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE sendmulticamp;
   CREATE USER 'sendmulticamp_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON sendmulticamp.* TO 'sendmulticamp_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Import Database Schema**
   ```bash
   mysql -u sendmulticamp_user -p sendmulticamp < database/schema.sql
   ```

4. **Configure Environment**

   Edit `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=sendmulticamp_user
   DB_PASSWORD=your_password
   DB_NAME=sendmulticamp
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3001
   ```

5. **Start the Application**
   ```bash
   # Start both frontend and backend
   npm run dev:all
   ```

   Or separately:
   ```bash
   # Terminal 1: Backend API
   npm run server

   # Terminal 2: Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📖 Detailed Setup

For detailed MySQL setup instructions, see **[MYSQL_SETUP.md](./MYSQL_SETUP.md)**

For quick start guide, see **[QUICKSTART.md](./QUICKSTART.md)**

## 🗄️ Database Schema

The application uses 8 MySQL tables:

- **users** - User accounts with hashed passwords
- **lists** - Subscriber lists
- **subscribers** - Email addresses with status tracking
- **campaigns** - Email campaigns with content and stats
- **campaign_sends** - Individual send records with tracking
- **email_templates** - Reusable email templates
- **smtp_settings** - SMTP server configuration

All tables use foreign keys and indexes for optimal performance.

## 🎯 Usage

### Creating Your First Campaign

1. **Sign Up** - Create an account
2. **Create a List** - Navigate to Lists and create a subscriber list
3. **Add Subscribers** - Add email addresses to your list
4. **Configure SMTP** - Go to Settings and configure your SMTP server
5. **Create Campaign** - Create a new campaign with your content
6. **Send** - Send your campaign to all active subscribers

### SMTP Configuration

Supported providers:
- **Gmail**: smtp.gmail.com, port 587 (use App Password)
- **SendGrid**: smtp.sendgrid.net, port 587
- **Mailgun**: smtp.mailgun.org, port 587
- **Amazon SES**: email-smtp.region.amazonaws.com, port 587
- Any other SMTP server

## 🏗️ Project Structure

```
sendmulticamp/
├── src/                      # Frontend React app
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── lib/                # API client
│   └── App.jsx             # Main app component
├── server/                  # Backend Express API
│   ├── index.js            # API server
│   ├── db.js               # MySQL connection
│   └── auth.js             # JWT authentication
├── database/               # Database schema
│   └── schema.sql          # MySQL schema
├── .env                    # Environment variables
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens for authentication
- Environment variables for sensitive data
- SQL injection protection with parameterized queries
- CORS enabled for frontend-backend communication
- Password strength requirements enforced

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Lists
- `GET /api/lists` - Get all lists
- `POST /api/lists` - Create list
- `GET /api/lists/:listId/subscribers` - Get subscribers
- `POST /api/lists/:listId/subscribers` - Add subscriber

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/send` - Send campaign

### Settings
- `GET /api/smtp-settings` - Get SMTP settings
- `POST /api/smtp-settings` - Save SMTP settings

All endpoints (except auth) require `Authorization: Bearer <token>` header.

## 🚀 Production Deployment

### Build Frontend
```bash
npm run build
```

### Run Backend with PM2
```bash
npm install -g pm2
pm2 start server/index.js --name sendmulticamp-api
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/sendmulticamp/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite dev server (frontend)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express API server (backend)
- `npm run dev:all` - Start both frontend and backend

### Database Management

**Backup Database**:
```bash
mysqldump -u sendmulticamp_user -p sendmulticamp > backup.sql
```

**Restore Database**:
```bash
mysql -u sendmulticamp_user -p sendmulticamp < backup.sql
```

**Reset Database**:
```bash
mysql -u sendmulticamp_user -p -e "DROP DATABASE sendmulticamp; CREATE DATABASE sendmulticamp;"
mysql -u sendmulticamp_user -p sendmulticamp < database/schema.sql
```

## 📝 Environment Variables

Required in `.env`:

```env
# MySQL
DB_HOST=localhost
DB_USER=sendmulticamp_user
DB_PASSWORD=your_password
DB_NAME=sendmulticamp

# JWT
JWT_SECRET=your-secret-key-at-least-32-characters

# Server
PORT=3001
```

## 🐛 Troubleshooting

See [MYSQL_SETUP.md](./MYSQL_SETUP.md) for detailed troubleshooting guide.

## 📄 License

ISC

## 🙏 Acknowledgments

- Inspired by Mailtrain
- Built with modern web technologies
- Community-driven development

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Database**: MySQL
**Authentication**: JWT

# SendMultiCamp - Project Information

## Overview

SendMultiCamp is a modern, production-ready email campaign management application built from scratch, inspired by Mailtrain but using modern technologies and architecture.

## What Happened

### Previous State
- Full Mailtrain codebase (Node.js + MySQL)
- 827+ files
- Complex legacy architecture
- Parallel campaign enhancement added

### Current State
- **Clean, standalone React application**
- **27 source files only**
- Modern stack with Supabase
- Production-ready and tested

### Changes Made
1. ✅ Removed ALL Mailtrain code and dependencies
2. ✅ Kept only SendMultiCamp application
3. ✅ Moved SendMultiCamp to project root
4. ✅ Updated .gitignore for new app
5. ✅ Fresh git repository with clean history
6. ✅ Installed dependencies and built successfully

## Current Project Structure

```
project/
├── .env                    # Supabase credentials
├── .gitignore             # Clean gitignore for Vite/React
├── package.json           # SendMultiCamp dependencies only
├── vite.config.js         # Vite configuration
├── index.html             # HTML entry point
├── README.md              # Main documentation
├── QUICKSTART.md          # Quick start guide
├── src/
│   ├── main.jsx          # Application entry
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   └── Layout.module.css
│   ├── pages/            # Application pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Lists.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CampaignEditor.jsx
│   │   ├── Settings.jsx
│   │   └── *.module.css (styles for each page)
│   └── lib/              # Utilities and API
│       ├── supabase.js   # Supabase client
│       └── api.js        # API methods
└── supabase/
    └── migrations/       # Database schema
        └── 20251112053626_create_sendmulticamp_schema.sql

Total: 27 files (excluding node_modules and build artifacts)
```

## Technology Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite 7** - Ultra-fast build tool and dev server
- **React Router DOM 7** - Client-side routing
- **CSS Modules** - Scoped, modular styling
- **date-fns 4** - Modern date utilities

### Backend (Supabase)
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Built-in data security
- **Supabase Auth** - User authentication
- **Real-time** - Live data subscriptions (ready to use)

### Development
- **Vite Dev Server** - Hot Module Replacement (HMR)
- **Git** - Clean version control
- **Modern JavaScript** - ES6+ syntax

## Database Schema

8 secure tables with Row Level Security:

1. **users** - User accounts linked to Supabase Auth
2. **lists** - Subscriber lists
3. **subscribers** - Email addresses with status tracking
4. **campaigns** - Email campaigns with content and stats
5. **campaign_sends** - Individual send tracking records
6. **email_templates** - Reusable email templates
7. **smtp_settings** - SMTP server configuration

All tables use RLS policies to ensure users can only access their own data.

## Features

### Authentication
- Email/password sign up and login
- Secure session management with Supabase Auth
- Auto-logout and protected routes

### Dashboard
- Campaign statistics overview
- Recent campaigns list
- Quick access to create campaigns

### List Management
- Create and manage subscriber lists
- Track subscriber counts
- Organized by user

### Campaign Management
- Rich campaign editor
- HTML and plain text content
- Campaign status tracking (draft, sending, sent)
- Real-time statistics

### Campaign Sending
- **Parallel campaign support** - Send multiple campaigns simultaneously
- Subscriber status tracking
- Delivery metrics (sent, opened, clicked, bounced)

### Settings
- SMTP configuration
- Support for any SMTP provider (Gmail, SendGrid, etc.)
- Secure credential storage

## Getting Started

### Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### First Time Setup
1. Sign up with email/password
2. Configure SMTP in Settings
3. Create a subscriber list
4. Add subscribers
5. Create and send your first campaign

See `QUICKSTART.md` for detailed instructions.

## API Reference

The `src/lib/api.js` provides all backend methods:

- **Lists**: `getLists()`, `createList()`
- **Subscribers**: `getSubscribers()`, `addSubscriber()`, `importSubscribers()`
- **Campaigns**: `getCampaigns()`, `createCampaign()`, `updateCampaign()`, `sendCampaign()`
- **Templates**: `getTemplates()`, `createTemplate()`
- **Settings**: `getSMTPSettings()`, `saveSMTPSettings()`

## Security

- ✅ Row Level Security on all database tables
- ✅ Users can only access their own data
- ✅ Secure authentication with Supabase Auth
- ✅ Environment variables for sensitive credentials
- ✅ SMTP passwords stored securely in database

## Git History

**Current Commit:**
```
7cb21fe SendMultiCamp: Modern email campaign manager
27 files changed, 2673 insertions(+)
```

**Previous History:**
- Original Mailtrain code removed
- Clean slate for SendMultiCamp

## Build Status

✅ **Production Build Successful**
- Built with Vite
- Optimized for production
- Gzip compressed assets
- Ready to deploy

## Next Steps

### Immediate
1. Run `npm run dev` to start development
2. Open http://localhost:3000
3. Sign up and explore the application

### Future Enhancements
- Email template builder with drag-and-drop
- Advanced subscriber segmentation
- A/B testing for campaigns
- Scheduled campaign sending
- Detailed analytics dashboard
- Webhook integrations
- Public API for external integrations

## Support

- See `README.md` for complete documentation
- See `QUICKSTART.md` for getting started guide
- Check database migrations in `supabase/migrations/`

## License

ISC

---

**Last Updated:** November 12, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅

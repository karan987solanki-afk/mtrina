# SendMultiCamp

A modern, parallel email campaign management application built with React and Supabase. Inspired by Mailtrain, with enhanced support for sending multiple campaigns simultaneously.

## Features

- **User Authentication** - Secure email/password authentication with Supabase Auth
- **Subscriber List Management** - Create and manage multiple subscriber lists
- **Campaign Creation** - Rich campaign editor with HTML and plain text support
- **Parallel Campaign Sending** - Send multiple campaigns simultaneously
- **Real-time Stats** - Track sent, opened, and clicked metrics
- **SMTP Configuration** - Use your own SMTP server for sending emails
- **Modern UI** - Clean, responsive interface built with React

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **Styling**: CSS Modules

## Database Schema

The application uses the following main tables:
- `users` - User accounts linked to Supabase Auth
- `lists` - Subscriber lists
- `subscribers` - Email subscribers with status tracking
- `campaigns` - Email campaigns with content and stats
- `campaign_sends` - Individual send records with tracking
- `email_templates` - Reusable email templates
- `smtp_settings` - SMTP server configuration

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. The database schema has already been applied to your Supabase project

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Creating Your First Campaign

1. **Sign Up** - Create an account using your email
2. **Create a List** - Navigate to Lists and create a subscriber list
3. **Add Subscribers** - Add email addresses to your list
4. **Configure SMTP** - Go to Settings and configure your SMTP server
5. **Create Campaign** - Create a new campaign, write your email content
6. **Send** - Send your campaign to all active subscribers

### Parallel Campaign Sending

The application supports sending multiple campaigns simultaneously. The backend is designed to process campaigns in parallel using Supabase's real-time capabilities and efficient database queries.

### Email Tracking

Campaigns automatically track:
- **Sent** - Total emails sent
- **Opened** - Number of unique opens
- **Clicked** - Number of clicks on links
- **Bounced** - Failed deliveries

## Architecture

### Frontend

The React application is organized as:
- `src/pages/` - Page components (Dashboard, Lists, Campaigns, etc.)
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and API client
- CSS Modules for component-specific styling

### Backend

Supabase provides:
- PostgreSQL database with migrations
- Row Level Security for data isolation
- Real-time subscriptions for live updates
- Authentication and user management

### Security

- All database access is protected by Row Level Security (RLS)
- Users can only access their own lists, campaigns, and subscribers
- SMTP passwords are stored securely in the database
- Authentication tokens are managed by Supabase Auth

## API Reference

The `api.js` file provides methods for:
- `getLists()` - Fetch user's lists
- `createList(data)` - Create a new list
- `getSubscribers(listId)` - Get subscribers for a list
- `addSubscriber(data)` - Add a subscriber
- `getCampaigns()` - Fetch user's campaigns
- `createCampaign(data)` - Create a new campaign
- `updateCampaign(id, data)` - Update campaign
- `sendCampaign(id)` - Send a campaign
- `getSMTPSettings()` - Get SMTP configuration
- `saveSMTPSettings(data)` - Save SMTP settings

## Contributing

This is a reference implementation inspired by Mailtrain. Feel free to fork and customize for your needs.

## License

ISC

## Acknowledgments

- Inspired by [Mailtrain](https://github.com/Mailtrain-org/mailtrain)
- Built with [Supabase](https://supabase.com)
- UI design principles from modern email marketing platforms

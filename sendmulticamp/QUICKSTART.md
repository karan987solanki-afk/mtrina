# SendMultiCamp - Quick Start Guide

## Running the Application

### Development Mode

```bash
cd sendmulticamp
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## First Time Setup

### 1. Sign Up

1. Open the application
2. Click "Sign Up"
3. Enter your email and password (minimum 6 characters)
4. You'll be automatically logged in

### 2. Configure SMTP (Required for sending emails)

1. Go to **Settings** in the sidebar
2. Enter your SMTP server details:
   - **Host**: Your SMTP server (e.g., smtp.gmail.com)
   - **Port**: Usually 587 for TLS or 465 for SSL
   - **Username**: Your email address
   - **Password**: Your email password or app-specific password
   - **Use TLS**: Keep checked for secure connection
3. Click **Save Settings**

**Example SMTP Configurations:**

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: `your.email@gmail.com`
- Password: Use an [App Password](https://support.google.com/accounts/answer/185833)
- Use TLS: Yes

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API Key
- Use TLS: Yes

### 3. Create a Subscriber List

1. Go to **Lists** in the sidebar
2. Click **Create List**
3. Enter:
   - Name: e.g., "Newsletter Subscribers"
   - Description: Optional description
4. Click **Create**

### 4. Add Subscribers

1. Click on your list
2. Add subscribers manually or import from CSV
3. Each subscriber needs at least an email address
4. You can also add first name, last name, and custom metadata

### 5. Create Your First Campaign

1. Go to **Campaigns**
2. Click **Create Campaign**
3. Fill in the details:
   - **Campaign Name**: Internal name for your campaign
   - **Select List**: Choose which list to send to
   - **Subject Line**: Email subject
   - **From Name**: Sender name
   - **From Email**: Sender email address
   - **HTML Content**: Your email HTML
   - **Plain Text**: Plain text version (optional but recommended)
4. Click **Create Campaign**

### 6. Send Your Campaign

1. Go to **Campaigns**
2. Find your draft campaign
3. Click **Send**
4. Confirm the send action
5. Monitor the stats in real-time

## Key Features

### Dashboard
- Overview of all your lists, subscribers, and campaigns
- Quick stats on recent campaign performance
- Direct access to create new campaigns

### Lists Management
- Create multiple subscriber lists
- Each list is independent
- Track subscriber counts per list

### Campaign Creation
- Rich HTML email editor
- Plain text fallback
- Campaign scheduling (coming soon)
- Template support (coming soon)

### Campaign Analytics
- Real-time sending status
- Track sent, opened, and clicked metrics
- Detailed subscriber engagement data

### Parallel Campaign Sending
- Send multiple campaigns simultaneously
- Efficient queue management
- No campaign blocking

## Database Structure

The application uses Supabase with the following tables:
- **users**: User accounts
- **lists**: Subscriber lists
- **subscribers**: Email addresses with status
- **campaigns**: Email campaigns with content and stats
- **campaign_sends**: Individual send records
- **smtp_settings**: SMTP configuration
- **email_templates**: Reusable templates

All data is protected with Row Level Security (RLS) - users can only access their own data.

## Tips & Best Practices

1. **Test First**: Create a test list with your own email addresses
2. **Use Plain Text**: Always provide a plain text version
3. **Check SMTP Limits**: Be aware of your SMTP provider's sending limits
4. **Monitor Metrics**: Check open and click rates to improve campaigns
5. **Segment Lists**: Create separate lists for different audiences
6. **Verify Emails**: Only send to verified, opted-in subscribers

## Troubleshooting

### Can't log in
- Check your email and password
- Make sure you confirmed your email (check spam folder)
- Try the "Forgot Password" link

### Campaign won't send
- Verify SMTP settings in Settings page
- Check that your list has active subscribers
- Ensure campaign is in "draft" status
- Check browser console for errors

### SMTP errors
- Verify your SMTP credentials
- Check if your email provider requires app-specific passwords
- Ensure the port and TLS settings are correct
- Some providers require whitelisting of sending IP addresses

### Subscribers not importing
- Check CSV format (must have "email" column)
- Ensure emails are valid
- Look for duplicate entries

## Need Help?

Check the main README.md for more detailed information about:
- Architecture
- API Reference
- Database Schema
- Contributing Guidelines

## What's Next?

Explore features like:
- Creating email templates
- Setting up automation (coming soon)
- Advanced segmentation (coming soon)
- A/B testing (coming soon)
- Detailed analytics reports (coming soon)

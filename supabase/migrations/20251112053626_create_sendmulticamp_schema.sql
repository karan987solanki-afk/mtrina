/*
  # SendMultiCamp Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamp)
    
    - `lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `subscribers`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references lists)
      - `email` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `status` (text: active, unsubscribed, bounced)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
      - Unique constraint on (list_id, email)
    
    - `campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `list_id` (uuid, references lists)
      - `name` (text)
      - `subject` (text)
      - `from_name` (text)
      - `from_email` (text)
      - `reply_to` (text)
      - `html_content` (text)
      - `text_content` (text)
      - `status` (text: draft, scheduled, sending, sent, paused)
      - `scheduled_at` (timestamp)
      - `sent_at` (timestamp)
      - `total_subscribers` (integer, default 0)
      - `sent_count` (integer, default 0)
      - `opened_count` (integer, default 0)
      - `clicked_count` (integer, default 0)
      - `bounced_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `campaign_sends`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `subscriber_id` (uuid, references subscribers)
      - `status` (text: pending, sent, failed, bounced, opened, clicked)
      - `sent_at` (timestamp)
      - `opened_at` (timestamp)
      - `clicked_at` (timestamp)
      - `error_message` (text)
      - `created_at` (timestamp)
      - Unique constraint on (campaign_id, subscriber_id)
    
    - `email_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `html_content` (text)
      - `thumbnail` (text)
      - `created_at` (timestamp)
    
    - `smtp_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users, unique)
      - `host` (text)
      - `port` (integer)
      - `username` (text)
      - `password` (text, encrypted)
      - `use_tls` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(list_id, email)
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscribers in own lists"
  ON subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = subscribers.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create subscribers in own lists"
  ON subscribers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = subscribers.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subscribers in own lists"
  ON subscribers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = subscribers.list_id
      AND lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = subscribers.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subscribers in own lists"
  ON subscribers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = subscribers.list_id
      AND lists.user_id = auth.uid()
    )
  );

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  from_name text NOT NULL,
  from_email text NOT NULL,
  reply_to text,
  html_content text,
  text_content text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_subscribers integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  bounced_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create campaign_sends table
CREATE TABLE IF NOT EXISTS campaign_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, subscriber_id)
);

ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaign sends for own campaigns"
  ON campaign_sends FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaign sends for own campaigns"
  ON campaign_sends FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign sends for own campaigns"
  ON campaign_sends FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_sends.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  html_content text,
  thumbnail text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create smtp_settings table
CREATE TABLE IF NOT EXISTS smtp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host text NOT NULL,
  port integer NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  use_tls boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own smtp settings"
  ON smtp_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own smtp settings"
  ON smtp_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smtp settings"
  ON smtp_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own smtp settings"
  ON smtp_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_list_id ON subscribers(list_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_subscriber_id ON campaign_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(status);
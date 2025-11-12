const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { query, testConnection } = require('./db');
const { register, login, authMiddleware } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

testConnection();

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await register(email, password, fullName);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, email, full_name FROM users WHERE id = ?',
      [req.userId]
    );
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lists', authMiddleware, async (req, res) => {
  try {
    const lists = await query(
      `SELECT l.*, COUNT(s.id) as subscriber_count
       FROM lists l
       LEFT JOIN subscribers s ON l.id = s.list_id AND s.status = 'active'
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.userId]
    );
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lists', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const listId = uuidv4();

    await query(
      'INSERT INTO lists (id, user_id, name, description) VALUES (?, ?, ?, ?)',
      [listId, req.userId, name, description]
    );

    const lists = await query('SELECT * FROM lists WHERE id = ?', [listId]);
    res.json(lists[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lists/:listId/subscribers', authMiddleware, async (req, res) => {
  try {
    const { listId } = req.params;

    const lists = await query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.userId]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const subscribers = await query(
      'SELECT * FROM subscribers WHERE list_id = ? ORDER BY created_at DESC',
      [listId]
    );

    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lists/:listId/subscribers', authMiddleware, async (req, res) => {
  try {
    const { listId } = req.params;
    const { email, first_name, last_name, metadata } = req.body;

    const lists = await query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.userId]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const subscriberId = uuidv4();
    await query(
      'INSERT INTO subscribers (id, list_id, email, first_name, last_name, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [subscriberId, listId, email, first_name, last_name, JSON.stringify(metadata || {})]
    );

    const subscribers = await query('SELECT * FROM subscribers WHERE id = ?', [subscriberId]);
    res.json(subscribers[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Subscriber already exists in this list' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const campaigns = await query(
      `SELECT c.*, l.name as list_name
       FROM campaigns c
       JOIN lists l ON c.list_id = l.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.userId]
    );
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const campaigns = await query(
      `SELECT c.*, l.name as list_name, l.id as list_id
       FROM campaigns c
       JOIN lists l ON c.list_id = l.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, req.userId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaigns[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const {
      name, list_id, subject, from_name, from_email,
      reply_to, html_content, text_content
    } = req.body;

    const lists = await query(
      'SELECT * FROM lists WHERE id = ? AND user_id = ?',
      [list_id, req.userId]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const campaignId = uuidv4();
    await query(
      `INSERT INTO campaigns (
        id, user_id, list_id, name, subject, from_name, from_email,
        reply_to, html_content, text_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [campaignId, req.userId, list_id, name, subject, from_name, from_email,
       reply_to, html_content, text_content]
    );

    const campaigns = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    res.json(campaigns[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      await query(
        `UPDATE campaigns SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    const updatedCampaigns = await query('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.json(updatedCampaigns[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await query('DELETE FROM campaigns WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/send', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaigns[0];

    const subscribers = await query(
      'SELECT * FROM subscribers WHERE list_id = ? AND status = ?',
      [campaign.list_id, 'active']
    );

    await query(
      'UPDATE campaigns SET status = ?, total_subscribers = ? WHERE id = ?',
      ['sending', subscribers.length, id]
    );

    for (const subscriber of subscribers) {
      const sendId = uuidv4();
      await query(
        'INSERT INTO campaign_sends (id, campaign_id, subscriber_id, status) VALUES (?, ?, ?, ?)',
        [sendId, id, subscriber.id, 'pending']
      );
    }

    res.json({ success: true, message: 'Campaign queued for sending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/smtp-settings', authMiddleware, async (req, res) => {
  try {
    const settings = await query(
      'SELECT id, host, port, username, use_tls FROM smtp_settings WHERE user_id = ?',
      [req.userId]
    );

    res.json(settings.length > 0 ? settings[0] : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/smtp-settings', authMiddleware, async (req, res) => {
  try {
    const { host, port, username, password, use_tls } = req.body;

    const existing = await query(
      'SELECT id FROM smtp_settings WHERE user_id = ?',
      [req.userId]
    );

    if (existing.length > 0) {
      await query(
        'UPDATE smtp_settings SET host = ?, port = ?, username = ?, password = ?, use_tls = ? WHERE user_id = ?',
        [host, port, username, password, use_tls, req.userId]
      );
    } else {
      const settingsId = uuidv4();
      await query(
        'INSERT INTO smtp_settings (id, user_id, host, port, username, password, use_tls) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [settingsId, req.userId, host, port, username, password, use_tls]
      );
    }

    const settings = await query(
      'SELECT id, host, port, username, use_tls FROM smtp_settings WHERE user_id = ?',
      [req.userId]
    );

    res.json(settings[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SMTP Servers (Multiple) endpoints
app.get('/api/smtp-servers', authMiddleware, async (req, res) => {
  try {
    const servers = await query(
      'SELECT id, name, host, port, username, use_tls, daily_limit, emails_sent_today, is_active FROM smtp_servers WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/smtp-servers', authMiddleware, async (req, res) => {
  try {
    const { name, host, port, username, password, use_tls, daily_limit } = req.body;
    const serverId = uuidv4();

    await query(
      'INSERT INTO smtp_servers (id, user_id, name, host, port, username, password, use_tls, daily_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [serverId, req.userId, name, host, port, username, password, use_tls, daily_limit || 0]
    );

    const servers = await query('SELECT id, name, host, port, username, use_tls, daily_limit, emails_sent_today, is_active FROM smtp_servers WHERE id = ?', [serverId]);
    res.json(servers[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/smtp-servers/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, host, port, username, password, use_tls, daily_limit, is_active } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (host !== undefined) { fields.push('host = ?'); values.push(host); }
    if (port !== undefined) { fields.push('port = ?'); values.push(port); }
    if (username !== undefined) { fields.push('username = ?'); values.push(username); }
    if (password !== undefined) { fields.push('password = ?'); values.push(password); }
    if (use_tls !== undefined) { fields.push('use_tls = ?'); values.push(use_tls); }
    if (daily_limit !== undefined) { fields.push('daily_limit = ?'); values.push(daily_limit); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }

    values.push(req.userId, id);
    await query(
      `UPDATE smtp_servers SET ${fields.join(', ')} WHERE user_id = ? AND id = ?`,
      values
    );

    const servers = await query('SELECT id, name, host, port, username, use_tls, daily_limit, emails_sent_today, is_active FROM smtp_servers WHERE id = ?', [id]);
    res.json(servers[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/smtp-servers/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM smtp_servers WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blacklist endpoints
app.get('/api/blacklist', authMiddleware, async (req, res) => {
  try {
    const blacklist = await query(
      'SELECT * FROM blacklist WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(blacklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blacklist', authMiddleware, async (req, res) => {
  try {
    const { email, reason } = req.body;
    const blacklistId = uuidv4();

    await query(
      'INSERT INTO blacklist (id, user_id, email, reason) VALUES (?, ?, ?, ?)',
      [blacklistId, req.userId, email, reason || '']
    );

    const items = await query('SELECT * FROM blacklist WHERE id = ?', [blacklistId]);
    res.json(items[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already in blacklist' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/blacklist/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM blacklist WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe list endpoints
app.get('/api/unsubscribe-list', authMiddleware, async (req, res) => {
  try {
    const unsubscribes = await query(
      'SELECT * FROM unsubscribe_list WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(unsubscribes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/unsubscribe-list', authMiddleware, async (req, res) => {
  try {
    const { email, list_id, campaign_id, reason } = req.body;
    const unsubId = uuidv4();

    await query(
      'INSERT INTO unsubscribe_list (id, user_id, email, list_id, campaign_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [unsubId, req.userId, email, list_id || null, campaign_id || null, reason || '']
    );

    const items = await query('SELECT * FROM unsubscribe_list WHERE id = ?', [unsubId]);
    res.json(items[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already unsubscribed' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/unsubscribe-list/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM unsubscribe_list WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Copy/Duplicate campaign
app.post('/api/campaigns/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const campaigns = await query(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (campaigns.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const original = campaigns[0];
    const newId = uuidv4();

    await query(
      `INSERT INTO campaigns (
        id, user_id, list_id, name, subject, from_name, from_email,
        reply_to, html_content, text_content, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, original.user_id, original.list_id,
        `${original.name} (Copy)`, original.subject, original.from_name,
        original.from_email, original.reply_to, original.html_content,
        original.text_content, 'draft'
      ]
    );

    const newCampaigns = await query('SELECT * FROM campaigns WHERE id = ?', [newId]);
    res.json(newCampaigns[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ SendMultiCamp API server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
});

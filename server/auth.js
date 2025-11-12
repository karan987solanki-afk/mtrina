const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function register(email, password, fullName = null) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await query(
    'INSERT INTO users (id, email, password, full_name) VALUES (?, ?, ?, ?)',
    [userId, email, hashedPassword, fullName]
  );

  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    user: { id: userId, email, full_name: fullName },
    token
  };
}

async function login(email, password) {
  const users = await query(
    'SELECT id, email, password, full_name FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = users[0];
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    },
    token
  };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { register, login, verifyToken, authMiddleware };

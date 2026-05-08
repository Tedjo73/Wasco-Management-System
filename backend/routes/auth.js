const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const coreDb = require('../db/core');
const { verifyToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

router.post('/register', async (req, res) => {
  const { accountNumber, fullName, email, phone, district, physicalAddress, password } = req.body;

  if (!accountNumber || !fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const existing = await coreDb.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const existingAcc = await coreDb.query(
      'SELECT account_number FROM customers WHERE account_number = $1',
      [accountNumber]
    );
    if (existingAcc.rows.length > 0) {
      return res.status(409).json({ error: 'This account number is already registered.' });
    }

    const districtRow = await coreDb.query(
      'SELECT district_id FROM districts WHERE name = $1',
      [district]
    );
    const districtId = districtRow.rows[0]?.district_id || null;

    await coreDb.query('BEGIN');

    try {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const userResult = await coreDb.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'customer') RETURNING id, email, role`,
        [email, password_hash]
      );
      const newUser = userResult.rows[0];

      await coreDb.query(
        `INSERT INTO customers (account_number, user_id, full_name, phone_number, district_id, physical_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [accountNumber, newUser.id, fullName, phone, districtId, physicalAddress]
      );

      await coreDb.query('COMMIT');

      const token = signToken(newUser);
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: fullName,
          accountNumber,
        },
      });
    } catch (innerErr) {
      await coreDb.query('ROLLBACK');
      throw innerErr;
    }
  } catch (err) {
    console.error('[Auth] Register Error:', err.message);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await coreDb.query(
      `SELECT u.id, u.email, u.password_hash, u.role,
              c.full_name, c.account_number
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.full_name || user.email.split('@')[0],
        accountNumber: user.account_number || null,
      },
    });
  } catch (err) {
    console.error('[Auth] Login Error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await coreDb.query(
      `SELECT u.id, u.email, u.role, c.full_name, c.account_number
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    const u = result.rows[0];
    res.json({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.full_name || u.email.split('@')[0],
      accountNumber: u.account_number || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

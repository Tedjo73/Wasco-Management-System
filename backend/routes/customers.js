const express = require('express');
const router = express.Router();
const coreDb = require('../db/core');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', requireRole('admin', 'manager'), async (req, res) => {
  const { search = '', district = '' } = req.query;
  try {
    const result = await coreDb.query(
      `SELECT c.account_number, c.full_name, c.phone_number, c.physical_address,
              c.created_at, d.name AS district, u.email,
              CASE WHEN u.id IS NOT NULL THEN 'Active' ELSE 'Inactive' END AS status
       FROM customers c
       LEFT JOIN districts d ON d.district_id = c.district_id
       LEFT JOIN users u ON u.id = c.user_id
       WHERE ($1 = '' OR c.full_name ILIKE $1 OR c.account_number ILIKE $1 OR u.email ILIKE $1)
         AND ($2 = '' OR d.name = $2)
       ORDER BY c.created_at DESC`,
      [`%${search}%`, district]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Customers] List Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const total = await coreDb.query('SELECT COUNT(*) FROM customers');
    const districts = await coreDb.query(
      `SELECT d.name, COUNT(c.account_number) AS count
       FROM districts d
       LEFT JOIN customers c ON c.district_id = d.district_id
       GROUP BY d.name ORDER BY count DESC`
    );
    res.json({
      totalCustomers: parseInt(total.rows[0].count),
      byDistrict: districts.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireRole('customer'), async (req, res) => {
  try {
    const result = await coreDb.query(
      `SELECT c.account_number, c.full_name, c.phone_number, c.physical_address,
              d.name AS district, u.email, c.created_at
       FROM customers c
       LEFT JOIN districts d ON d.district_id = c.district_id
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:accountNumber', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await coreDb.query(
      `SELECT c.account_number, c.full_name, c.phone_number, c.physical_address,
              d.name AS district, u.email, c.created_at
       FROM customers c
       LEFT JOIN districts d ON d.district_id = c.district_id
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.account_number = $1`,
      [req.params.accountNumber]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:accountNumber', requireRole('admin'), async (req, res) => {
  const { fullName, phone, district, physicalAddress, password, email } = req.body;
  try {
    const districtRow = await coreDb.query(
      'SELECT district_id FROM districts WHERE name = $1', [district]
    );
    const districtId = districtRow.rows[0]?.district_id || null;

    const custRes = await coreDb.query(
      `UPDATE customers SET full_name=$1, phone_number=$2, district_id=$3, physical_address=$4
       WHERE account_number=$5 RETURNING user_id`,
      [fullName, phone, districtId, physicalAddress, req.params.accountNumber]
    );

    if (custRes.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const userId = custRes.rows[0].user_id;

    if (email) {
      if (password && password.trim() !== '') {
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash(password, 10);
        await coreDb.query(
          'UPDATE users SET email = $1, password_hash = $2 WHERE id = $3',
          [email, hash, userId]
        );
      } else {
        await coreDb.query(
          'UPDATE users SET email = $1 WHERE id = $2',
          [email, userId]
        );
      }
    }

    res.json({ message: 'Customer updated successfully.' });
  } catch (err) {
    console.error('[Customers] Update Error:', err.message);
    if (err.message.includes('unique constraint') || err.message.includes('already exists')) {
      return res.status(409).json({ error: 'This email is already taken by another user.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/districts/all', async (req, res) => {
  try {
    const result = await coreDb.query('SELECT district_id, name FROM districts ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

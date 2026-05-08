const express = require('express');
const router = express.Router();
const coreDb = require('../db/core');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('customer'), async (req, res) => {
  const { location, description, urgency } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }

  try {
    const accResult = await coreDb.query(
      'SELECT account_number FROM customers WHERE user_id = $1', [req.user.id]
    );
    if (accResult.rows.length === 0) {
      return res.status(404).json({ error: 'No customer account found for this user.' });
    }
    const accountNumber = accResult.rows[0].account_number;

    const result = await coreDb.query(
      `INSERT INTO leakage_reports (account_number, location, description, urgency)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [accountNumber, location, description || null, urgency || 'Medium']
    );

    res.status(201).json({
      report: result.rows[0],
      ticketNumber: `LKG-${result.rows[0].report_id.toString().padStart(5, '0')}`,
      message: 'Leakage report submitted successfully. Our team will respond shortly.',
    });
  } catch (err) {
    console.error('[Leakages] Create Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'customer') {
      const accResult = await coreDb.query(
        'SELECT account_number FROM customers WHERE user_id = $1', [req.user.id]
      );
      if (accResult.rows.length === 0) return res.json([]);
      const result = await coreDb.query(
        'SELECT * FROM leakage_reports WHERE account_number = $1 ORDER BY created_at DESC',
        [accResult.rows[0].account_number]
      );
      return res.json(result.rows);
    }

    const result = await coreDb.query(
      `SELECT lr.*, c.full_name, d.name AS district
       FROM leakage_reports lr
       LEFT JOIN customers c ON c.account_number = lr.account_number
       LEFT JOIN districts d ON d.district_id = c.district_id
       ORDER BY
         CASE lr.urgency WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END,
         lr.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireRole('admin', 'manager'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  try {
    const result = await coreDb.query(
      'UPDATE leakage_reports SET status=$1 WHERE report_id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

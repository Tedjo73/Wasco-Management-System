const express = require('express');
const router = express.Router();
const billingDb = require('../db/billing');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const result = await billingDb.query(
      'SELECT * FROM billing_rates ORDER BY min_usage_m3 ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { tierName, minUsage, maxUsage, costPerM3, effectiveDate } = req.body;
  if (!tierName || minUsage == null || !costPerM3 || !effectiveDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const result = await billingDb.query(
      `INSERT INTO billing_rates (tier_name, min_usage_m3, max_usage_m3, cost_per_m3, effective_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [tierName, parseFloat(minUsage), maxUsage ? parseFloat(maxUsage) : null, parseFloat(costPerM3), effectiveDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  const { tierName, minUsage, maxUsage, costPerM3, effectiveDate } = req.body;
  try {
    const result = await billingDb.query(
      `UPDATE billing_rates
       SET tier_name=$1, min_usage_m3=$2, max_usage_m3=$3, cost_per_m3=$4, effective_date=$5
       WHERE tier_id=$6 RETURNING *`,
      [tierName, parseFloat(minUsage), maxUsage ? parseFloat(maxUsage) : null, parseFloat(costPerM3), effectiveDate, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rate tier not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await billingDb.query('DELETE FROM billing_rates WHERE tier_id=$1', [req.params.id]);
    res.json({ message: 'Rate tier deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

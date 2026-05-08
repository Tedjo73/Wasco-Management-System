const express = require('express');
const router = express.Router();
const billingDb = require('../db/billing');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const { month, year, status, district } = req.query;

  try {
    if (req.user.role === 'customer') {
      const result = await billingDb.query(
        `SELECT * FROM bills
         WHERE account_number = $1
           AND ($2::text IS NULL OR month = $2)
           AND ($3::int  IS NULL OR year  = $3)
           AND ($4::text IS NULL OR status = $4)
         ORDER BY year DESC, created_at DESC`,
        [req.user.accountNumber, month || null, year ? parseInt(year) : null, status || null]
      );
      return res.json(result.rows);
    }

    const result = await billingDb.query(
      `SELECT b.*, b.account_number
       FROM bills b
       WHERE ($1::text IS NULL OR b.month = $1)
         AND ($2::int  IS NULL OR b.year  = $2)
         AND ($3::text IS NULL OR b.status = $3)
       ORDER BY b.year DESC, b.created_at DESC`,
      [month || null, year ? parseInt(year) : null, status || null]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Bills] List Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const [generated, revenue, outstanding] = await Promise.all([
      billingDb.query(`SELECT COUNT(*) AS count FROM bills WHERE year = YEAR(NOW()) AND month = DATE_FORMAT(NOW(), '%b')`),
      billingDb.query(`SELECT COALESCE(SUM(amount_paid),0) AS total FROM payments`),
      billingDb.query(`SELECT COALESCE(SUM(amount_due),0) AS total FROM bills WHERE status != 'Paid'`),
    ]);
    res.json({
      billsGeneratedThisMonth: parseInt(generated.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      outstandingBalance: parseFloat(outstanding.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/insights', requireRole('manager'), async (req, res) => {
  const { period = 'Monthly' } = req.query;
  try {
    let history = [];
    let query = '';

    switch (period) {
      case 'Daily':
        query = 'SELECT * FROM daily_usage_analytics LIMIT 30';
        break;
      case 'Weekly':
        query = 'SELECT * FROM weekly_usage_analytics LIMIT 12';
        break;
      case 'Yearly':
        query = `SELECT year, SUM(total_bills) as total_bills, SUM(total_usage_m3) as total_usage_m3, 
                 SUM(projected_revenue) as revenue FROM usage_analytics GROUP BY year ORDER BY year DESC`;
        break;
      case 'Quarterly':
        query = `SELECT year, CONCAT('Q', QUARTER(STR_TO_DATE(CONCAT('01 ', month, ' ', year), '%d %b %Y'))) as quarter,
                 SUM(total_bills) as total_bills, SUM(total_usage_m3) as total_usage_m3, 
                 SUM(projected_revenue) as revenue 
                 FROM usage_analytics 
                 GROUP BY year, quarter 
                 ORDER BY year DESC, quarter DESC`;
        break;
      default:
    }

    const result = await billingDb.query(query);
    history = result.rows;
    
    const monthlyRes = await billingDb.query('SELECT * FROM usage_analytics ORDER BY year DESC, month DESC LIMIT 12');
    const monthlyHistory = monthlyRes.rows;
    const totalUsageYear = monthlyHistory.reduce((sum, r) => sum + parseFloat(r.total_usage_m3), 0);
    const avgMonthlyRev = monthlyHistory.reduce((sum, r) => sum + parseFloat(r.projected_revenue), 0) / (monthlyHistory.length || 1);

    res.json({
      history,
      period,
      summary: {
        yearlyProjection: (avgMonthlyRev * 12).toFixed(2),
        quarterlyEstimate: (avgMonthlyRev * 3).toFixed(2),
        totalUsageYear: totalUsageYear.toFixed(2),
        avgMonthlyRevenue: avgMonthlyRev.toFixed(2)
      }
    });
  } catch (err) {
    console.error('[Bills] Insights Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', requireRole('customer'), async (req, res) => {
  const { status, year } = req.query;
  try {
    const coreDb = require('../db/core');
    const accResult = await coreDb.query(
      'SELECT account_number FROM customers WHERE user_id = $1', [req.user.id]
    );
    if (accResult.rows.length === 0) return res.status(404).json({ error: 'No account linked to this user.' });
    const accountNumber = accResult.rows[0].account_number;

    const result = await billingDb.query(
      `SELECT * FROM bills
       WHERE account_number = $1
         AND ($2::text IS NULL OR status = $2)
         AND ($3::int  IS NULL OR year  = $3)
       ORDER BY year DESC, created_at DESC`,
      [accountNumber, status || null, year ? parseInt(year) : null]
    );
    res.json({ accountNumber, bills: result.rows });
  } catch (err) {
    console.error('[Bills] My bills Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await billingDb.query('SELECT * FROM bills WHERE bill_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bill not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest-reading/:accountNumber', requireRole('admin'), async (req, res) => {
  try {
    const result = await billingDb.query(
      'SELECT meter_reading_current FROM bills WHERE account_number = $1 ORDER BY year DESC, created_at DESC LIMIT 1',
      [req.params.accountNumber]
    );
    const lastReading = result.rows.length > 0 ? parseFloat(result.rows[0].meter_reading_current) : 0;
    res.json({ lastReading });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { accountNumber, month, year, meterPrevious, meterCurrent, dueDate } = req.body;

  if (!accountNumber || !month || !year || meterPrevious == null || meterCurrent == null || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (meterCurrent <= meterPrevious) {
    return res.status(400).json({ error: 'Current reading must be greater than previous reading.' });
  }

  try {
    const usageM3 = parseFloat(meterCurrent) - parseFloat(meterPrevious);

    const rates = await billingDb.query(
      'SELECT * FROM billing_rates ORDER BY min_usage_m3 ASC'
    );

    let amountDue = 0;
    let remaining = usageM3;
    for (const tier of rates.rows) {
      if (remaining <= 0) break;
      const tierMax = tier.max_usage_m3 !== null ? parseFloat(tier.max_usage_m3) : Infinity;
      const tierMin = parseFloat(tier.min_usage_m3);
      const tierCapacity = tierMax - tierMin + 1;
      const consumed = Math.min(remaining, tierCapacity);
      amountDue += consumed * parseFloat(tier.cost_per_m3);
      remaining -= consumed;
    }

    const result = await billingDb.query(
      `INSERT INTO bills (account_number, month, year, meter_reading_previous, meter_reading_current, usage_m3, amount_due, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [accountNumber, month, parseInt(year), parseFloat(meterPrevious), parseFloat(meterCurrent), usageM3, amountDue.toFixed(2), dueDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Bills] Create Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Unpaid', 'Paid', 'Overdue'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }
  try {
    const result = await billingDb.query(
      'UPDATE bills SET status=$1 WHERE bill_id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bill not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

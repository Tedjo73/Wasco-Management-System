const express = require('express');
const router = express.Router();
const billingDb = require('../db/billing');
const coreDb    = require('../db/core');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('customer', 'admin'), async (req, res) => {
  const { billId, amountPaid, paymentMethod } = req.body;

  if (!billId || !amountPaid || !paymentMethod) {
    return res.status(400).json({ error: 'billId, amountPaid and paymentMethod are required.' });
  }

  try {
    const billResult = await billingDb.query('SELECT * FROM bills WHERE bill_id = $1', [billId]);
    if (billResult.rows.length === 0) return res.status(404).json({ error: 'Bill not found.' });
    const bill = billResult.rows[0];

    let accountNumber = bill.account_number;
    if (req.user.role === 'customer') {
      const accResult = await coreDb.query(
        'SELECT account_number FROM customers WHERE user_id = $1', [req.user.id]
      );
      if (accResult.rows.length === 0 || accResult.rows[0].account_number !== accountNumber) {
        return res.status(403).json({ error: 'You cannot pay another customer\'s bill.' });
      }
    }

    const referenceNumber = `WAS-${Date.now()}-${Math.floor(Math.random() * 999)}`;

    const result = await billingDb.query(
      `INSERT INTO payments (bill_id, account_number, amount_paid, payment_method, reference_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [billId, accountNumber, parseFloat(amountPaid), paymentMethod, referenceNumber]
    );

    const paid = parseFloat(amountPaid) >= parseFloat(bill.amount_due);
    if (paid) {
      await billingDb.query("UPDATE bills SET status='Paid' WHERE bill_id=$1", [billId]);
    }

    res.status(201).json({
      payment: result.rows[0],
      billFullyPaid: paid,
      message: paid
        ? 'Payment successful. Bill marked as Paid.'
        : `Partial payment of M ${amountPaid} recorded.`,
    });
  } catch (err) {
    console.error('[Payments] Create Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', requireRole('customer'), async (req, res) => {
  try {
    const accResult = await coreDb.query(
      'SELECT account_number FROM customers WHERE user_id = $1', [req.user.id]
    );
    if (accResult.rows.length === 0) return res.status(404).json({ error: 'No account linked.' });
    const accountNumber = accResult.rows[0].account_number;

    const result = await billingDb.query(
      `SELECT p.*, b.month, b.year
       FROM payments p
       LEFT JOIN bills b ON b.bill_id = p.bill_id
       WHERE p.account_number = $1
       ORDER BY p.payment_date DESC`,
      [accountNumber]
    );

    const totalPaid = result.rows.reduce((sum, r) => sum + parseFloat(r.amount_paid), 0);
    res.json({ payments: result.rows, totalPaid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const result = await billingDb.query(
      `SELECT p.*, b.month, b.year
       FROM payments p
       LEFT JOIN bills b ON b.bill_id = p.bill_id
       ORDER BY p.payment_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const coreDb = require('./db/core');
const billingDb = require('./db/billing');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.post('/api/init-db', async (req, res) => {
  try {
    const initCore = fs.readFileSync(path.join(__dirname, 'db', 'init_core.sql'), 'utf8');
    const initBilling = fs.readFileSync(path.join(__dirname, 'db', 'init_billing.sql'), 'utf8');

    await coreDb.query(initCore);
    await billingDb.query(initBilling);

    res.json({ message: 'Both Core and Billing Databases initialized successfully.' });
  } catch (err) {
    console.error('Init DB Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await coreDb.query('SELECT 1');
    await billingDb.query('SELECT 1');
    res.json({
      status: 'online',
      databases: { core: 'connected', billing: 'connected' }
    });
  } catch (err) {
    res.status(500).json({ status: 'offline', error: err.message });
  }
});

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/bills',     require('./routes/bills'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/leakages',  require('./routes/leakages'));
app.use('/api/rates',     require('./routes/rates'));

app.listen(PORT, () => {
  console.log(`WASCO Distributed API running on http://localhost:${PORT}`);
});

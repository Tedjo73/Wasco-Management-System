const mysql = require('mysql2/promise');
require('dotenv').config();

const billingPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  database: process.env.MYSQL_DATABASE || 'wasco_billing',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '0000',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const query = async (text, params = []) => {
  let mysqlParams = [];
  
  let mysqlText = text.replace(/::[a-z]+/gi, '');

  mysqlText = mysqlText.replace(/\$([0-9]+)(?![0-9])/g, (match, p1) => {
    const index = parseInt(p1) - 1;
    mysqlParams.push(params[index]);
    return '?';
  });

  if (mysqlParams.length === 0 && params.length > 0) {
    mysqlParams = params;
  }

  mysqlText = mysqlText.replace(/TO_CHAR\(NOW\(\), 'Mon YYYY'\)/gi, "DATE_FORMAT(NOW(), '%b %Y')");
  mysqlText = mysqlText.replace(/EXTRACT\(YEAR FROM NOW\(\)\)/gi, "YEAR(NOW())");

  const isReturning = mysqlText.toUpperCase().includes('RETURNING *');
  if (isReturning) {
    mysqlText = mysqlText.replace(/RETURNING \*/gi, '');
  }

  const [result] = await billingPool.query(mysqlText, mysqlParams);

  let rows = [];
  if (Array.isArray(result)) {
    rows = result;
  } else if (isReturning && result.insertId) {
    let table = '';
    if (mysqlText.toUpperCase().includes('INTO BILLS')) table = 'bills';
    else if (mysqlText.toUpperCase().includes('INTO PAYMENTS')) table = 'payments';
    else if (mysqlText.toUpperCase().includes('INTO BILLING_RATES')) table = 'billing_rates';

    if (table) {
      const idField = table === 'billing_rates' ? 'tier_id' : (table === 'bills' ? 'bill_id' : 'payment_id');
      const [newRows] = await billingPool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [result.insertId]);
      rows = newRows;
    }
  } else if (isReturning && mysqlText.toUpperCase().includes('UPDATE')) {
    let table = '';
    if (mysqlText.toUpperCase().includes('UPDATE BILLS')) table = 'bills';
    else if (mysqlText.toUpperCase().includes('UPDATE BILLING_RATES')) table = 'billing_rates';
    
    if (table) {
      const idField = table === 'billing_rates' ? 'tier_id' : 'bill_id';
      const id = params[params.length - 1];
      const [updatedRows] = await billingPool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [id]);
      rows = updatedRows;
    }
  }

  return { rows, count: rows.length };
};

module.exports = {
  query,
  pool: billingPool
};

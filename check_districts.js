const coreDb = require('./backend/db/core');
async function check() {
    const res = await coreDb.query("SELECT * FROM districts");
    console.log('Districts:', res.rows);
    const res2 = await coreDb.query("SELECT account_number, full_name, district_id FROM customers");
    console.log('Customers:', res2.rows);
    process.exit(0);
}
check();

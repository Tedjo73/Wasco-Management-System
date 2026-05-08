const billingDb = require('./backend/db/billing');

async function createViews() {
    try {
        console.log('Creating Analytics Views in MySQL...');
        
        // View for Monthly Usage Patterns (OLAP concept)
        await billingDb.query(`
            CREATE OR REPLACE VIEW usage_analytics AS
            SELECT 
                month,
                year,
                COUNT(bill_id) as total_bills,
                SUM(usage_m3) as total_usage_m3,
                AVG(usage_m3) as avg_usage_per_customer,
                SUM(amount_due) as projected_revenue
            FROM bills
            GROUP BY year, month
        `);

        // View for Daily Usage Trends
        await billingDb.query(`
            CREATE OR REPLACE VIEW daily_usage_analytics AS
            SELECT 
                DATE(created_at) as date,
                COUNT(bill_id) as bills_generated,
                SUM(usage_m3) as total_usage_m3,
                SUM(amount_due) as revenue
            FROM bills
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // View for Weekly Usage Trends
        await billingDb.query(`
            CREATE OR REPLACE VIEW weekly_usage_analytics AS
            SELECT 
                YEARWEEK(created_at) as week_id,
                DATE_FORMAT(MIN(created_at), '%Y-%m-%d') as week_start,
                COUNT(bill_id) as bills_generated,
                SUM(usage_m3) as total_usage_m3,
                SUM(amount_due) as revenue
            FROM bills
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
            GROUP BY week_id
            ORDER BY week_id ASC
        `);

        console.log('Views created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error creating views:', err);
        process.exit(1);
    }
}

createViews();

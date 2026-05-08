-- wasco_billing database (Billing Rates, Bills, Payments) for MySQL

CREATE TABLE IF NOT EXISTS billing_rates (
    tier_id INT AUTO_INCREMENT PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL,
    min_usage_m3 DECIMAL(10, 2) NOT NULL,
    max_usage_m3 DECIMAL(10, 2),
    cost_per_m3 DECIMAL(10, 2) NOT NULL,
    effective_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL, -- references core DB indirectly
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    meter_reading_previous DECIMAL(10, 2) NOT NULL,
    meter_reading_current DECIMAL(10, 2) NOT NULL,
    usage_m3 DECIMAL(10, 2) NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INTEGER,
    account_number VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id)
);

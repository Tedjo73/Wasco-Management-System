-- wasco_billing database (Billing Rates, Bills, Payments)
CREATE TABLE IF NOT EXISTS billing_rates (
    tier_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL,
    min_usage_m3 NUMERIC NOT NULL,
    max_usage_m3 NUMERIC,
    cost_per_m3 NUMERIC(10, 2) NOT NULL,
    effective_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS bills (
    bill_id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL, -- references core DB indirectly
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    meter_reading_previous NUMERIC NOT NULL,
    meter_reading_current NUMERIC NOT NULL,
    usage_m3 NUMERIC NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(bill_id),
    account_number VARCHAR(50) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO billing_rates (tier_name, min_usage_m3, max_usage_m3, cost_per_m3, effective_date) VALUES 
('Tier 1', 0, 5, 5.00, '2024-01-01'),
('Tier 2', 6, 20, 8.00, '2024-01-01'),
('Tier 3', 21, 99999, 15.00, '2024-01-01')
ON CONFLICT (tier_id) DO NOTHING;

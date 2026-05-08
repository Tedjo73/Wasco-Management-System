-- WASCO Monolithic Database Schema

-- Users table (Handles Auth for all roles)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'manager'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts
CREATE TABLE IF NOT EXISTS districts (
    district_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    account_number VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    district_id INTEGER REFERENCES districts(district_id),
    physical_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Rates
CREATE TABLE IF NOT EXISTS billing_rates (
    tier_id SERIAL PRIMARY KEY,
    tier_name VARCHAR(50) NOT NULL,
    min_usage_m3 NUMERIC NOT NULL,
    max_usage_m3 NUMERIC,
    cost_per_m3 NUMERIC(10, 2) NOT NULL,
    effective_date DATE NOT NULL
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    bill_id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) REFERENCES customers(account_number) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    meter_reading_previous NUMERIC NOT NULL,
    meter_reading_current NUMERIC NOT NULL,
    usage_m3 NUMERIC NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid', -- 'Unpaid', 'Paid', 'Overdue'
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(bill_id),
    account_number VARCHAR(50) REFERENCES customers(account_number),
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leakage Reports
CREATE TABLE IF NOT EXISTS leakage_reports (
    report_id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) REFERENCES customers(account_number),
    location TEXT NOT NULL,
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Districts Mock Data
INSERT INTO districts (name) VALUES 
('Maseru'), ('Berea'), ('Leribe'), ('Butha-Buthe'), ('Mokhotlong'),
('Thaba-Tseka'), ('Qacha''s Nek'), ('Quthing'), ('Mohale''s Hoek'), ('Mafeteng')
ON CONFLICT DO NOTHING;

-- Insert Mock Admin User and Manager User
-- Password for both is 'password123'
INSERT INTO users (email, password_hash, role) VALUES 
('thato.admin@wasco.ls', '$2b$10$OQqHSeypYI8YPkAyu6JsaOKkvb/bOIDdxYbdCyC/mHNXnyL113f7q', 'admin'),
('thato.manager@wasco.ls', '$2b$10$OQqHSeypYI8YPkAyu6JsaOKkvb/bOIDdxYbdCyC/mHNXnyL113f7q', 'manager')
ON CONFLICT (email) DO NOTHING;

-- Insert Default Billing Rates
INSERT INTO billing_rates (tier_name, min_usage_m3, max_usage_m3, cost_per_m3, effective_date) VALUES 
('Tier 1', 0, 5, 5.00, '2024-01-01'),
('Tier 2', 6, 20, 8.00, '2024-01-01'),
('Tier 3', 21, 99999, 15.00, '2024-01-01')
ON CONFLICT DO NOTHING;

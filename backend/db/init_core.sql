-- wasco_core database (Customers, Users, Districts, Leakages)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    district_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    account_number VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    district_id INTEGER REFERENCES districts(district_id),
    physical_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leakage_reports (
    report_id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) REFERENCES customers(account_number),
    location TEXT NOT NULL,
    description TEXT,
    urgency VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Init districts
INSERT INTO districts (name) VALUES 
('Maseru'), ('Berea'), ('Leribe'), ('Butha-Buthe'), ('Mokhotlong'),
('Thaba-Tseka'), ($$Qacha's Nek$$), ('Quthing'), ($$Mohale's Hoek$$), ('Mafeteng')
ON CONFLICT (name) DO NOTHING;

-- Admins
INSERT INTO users (email, password_hash, role) VALUES 
('thato.admin@wasco.ls', '$2b$10$OQqHSeypYI8YPkAyu6JsaOKkvb/bOIDdxYbdCyC/mHNXnyL113f7q', 'admin'),
('thato.manager@wasco.ls', '$2b$10$OQqHSeypYI8YPkAyu6JsaOKkvb/bOIDdxYbdCyC/mHNXnyL113f7q', 'manager')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

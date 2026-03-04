-- ============================================
-- VENDRA KASIR - FULL DATABASE SETUP
-- Jalankan 1x saja, semua langsung siap!
-- ============================================

-- Drop & Create Database
DROP DATABASE IF EXISTS web_kasir;
CREATE DATABASE web_kasir;
USE web_kasir;

-- ============================================
-- TABLES
-- ============================================

-- Table: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: products (sudah include field Vendra: brand, cost)
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category_id INT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  unit VARCHAR(20) DEFAULT 'pcs',
  image_url VARCHAR(255),
  description TEXT,
  brand VARCHAR(100) DEFAULT 'General',
  cost DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active)
);

-- Table: customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  loyalty_points INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  visit_count INT DEFAULT 0,
  last_visit DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email)
);

-- Table: transactions (sudah include currency untuk Vendra)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT,
  cashier_id INT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'qris', 'transfer', 'debit', 'credit', 'ewallet') NOT NULL,
  payment_amount DECIMAL(12, 2) NOT NULL,
  change_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  points_earned INT DEFAULT 0,
  notes TEXT,
  currency VARCHAR(10) DEFAULT 'IDR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_invoice (invoice_number),
  INDEX idx_customer (customer_id),
  INDEX idx_cashier (cashier_id),
  INDEX idx_date (created_at)
);

-- Table: transaction_items (sudah include field Vendra)
CREATE TABLE transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  add_on_price DECIMAL(10, 2) DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  cost_per_unit DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  profit DECIMAL(12, 2) DEFAULT 0,
  paid_to_brand DECIMAL(12, 2) DEFAULT 0,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_transaction (transaction_id),
  INDEX idx_product (product_id)
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Users (password: admin123)
INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2a$10$a97JFzq2Sf0BDJ.hErFLy.T/K.9KKl6OdRX4uHvJGG/h3dCRFZyq6', 'Administrator', 'admin'),
('kasir1', '$2a$10$a97JFzq2Sf0BDJ.hErFLy.T/K.9KKl6OdRX4uHvJGG/h3dCRFZyq6', 'Kasir 1', 'cashier');

-- Categories
INSERT INTO categories (name, description) VALUES
('Makanan', 'Produk makanan dan snack'),
('Minuman', 'Minuman dingin dan panas'),
('Elektronik', 'Barang elektronik'),
('Alat Tulis', 'Perlengkapan kantor dan sekolah');

-- Products (dengan brand & cost untuk Vendra)
INSERT INTO products (name, sku, category_id, price, cost, stock, min_stock, unit, brand, description) VALUES
('Nasi Goreng', 'FOOD-001', 1, 15000, 8000, 100, 10, 'porsi', 'Warung Makan', 'Nasi goreng spesial'),
('Es Teh Manis', 'DRINK-001', 2, 5000, 2000, 200, 20, 'gelas', 'Minuman Segar', 'Teh manis dingin'),
('Pulpen Hitam', 'STAT-001', 4, 3000, 1500, 150, 30, 'pcs', 'Faber Castell', 'Pulpen tinta hitam'),
('Kopi Susu', 'DRINK-002', 2, 12000, 5000, 80, 15, 'gelas', 'Kopi Kenangan', 'Kopi susu premium'),
('Mie Goreng', 'FOOD-002', 1, 12000, 6000, 120, 15, 'porsi', 'Warung Makan', 'Mie goreng spesial'),
('Charger USB-C', 'ELEC-001', 3, 35000, 18000, 50, 10, 'pcs', 'Anker', 'Charger fast charging'),
('Buku Tulis A5', 'STAT-002', 4, 5000, 2500, 200, 30, 'pcs', 'Sidu', 'Buku tulis 80 halaman'),
('Jus Jeruk', 'DRINK-003', 2, 8000, 3500, 100, 20, 'gelas', 'Minuman Segar', 'Jus jeruk segar');

-- Customers
INSERT INTO customers (name, phone, email, loyalty_points, total_spent, visit_count) VALUES
('Pelanggan Umum', '-', '-', 0, 0, 0),
('Budi Raharjo', '081234567890', 'budi@email.com', 50, 250000, 5),
('Sari Dewi', '081234567891', 'sari@email.com', 30, 150000, 3);

-- ============================================
-- SELESAI! Database siap digunakan.
-- Login: admin / admin123 atau kasir1 / admin123
-- ============================================

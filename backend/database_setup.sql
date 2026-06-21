-- Database Creation
CREATE DATABASE IF NOT EXISTS supply_chain_db;
USE supply_chain_db;

-- ============================================================================
-- 1. OLTP SCHEMA (Operational Tables)
-- ============================================================================

-- Users Table (JWT Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    segment VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    zipcode VARCHAR(20)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY,
    category_id INT,
    category_name VARCHAR(100),
    product_name VARCHAR(150) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_status VARCHAR(50),
    description TEXT
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    capacity INT,
    manager VARCHAR(100)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    sales DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) NOT NULL,
    order_date DATETIME NOT NULL,
    order_status VARCHAR(50),
    payment_type VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    shipping_date DATETIME NOT NULL,
    shipping_mode VARCHAR(50),
    days_shipping_real INT,
    days_shipment_scheduled INT,
    delivery_status VARCHAR(50),
    late_delivery_risk INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    warehouse_id INT,
    stock_level INT DEFAULT 0,
    reorder_point INT DEFAULT 50,
    safety_stock INT DEFAULT 10,
    lead_time_days INT DEFAULT 5,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE
);


-- ============================================================================
-- 2. OLAP DATA WAREHOUSE SCHEMA (Star Schema)
-- ============================================================================

-- Dimension Customer
CREATE TABLE IF NOT EXISTS dim_customer (
    Customer_ID INT PRIMARY KEY,
    Customer_Fname VARCHAR(50) NOT NULL,
    Customer_Lname VARCHAR(50) NOT NULL,
    Customer_Segment VARCHAR(50),
    Customer_City VARCHAR(50),
    Customer_State VARCHAR(50),
    Customer_Country VARCHAR(50),
    Customer_Zipcode VARCHAR(20)
);

-- Dimension Product
CREATE TABLE IF NOT EXISTS dim_product (
    Product_ID INT PRIMARY KEY,
    Product_Category_Id INT,
    Product_Category_Name VARCHAR(100),
    Product_Name VARCHAR(150) NOT NULL,
    Product_Price DECIMAL(10, 2) NOT NULL,
    Product_Status VARCHAR(50)
);

-- Dimension Supplier
CREATE TABLE IF NOT EXISTS dim_supplier (
    Supplier_ID INT PRIMARY KEY,
    Supplier_Name VARCHAR(100) NOT NULL,
    Supplier_Rating DECIMAL(3, 2),
    Supplier_Status VARCHAR(20)
);

-- Dimension Warehouse
CREATE TABLE IF NOT EXISTS dim_warehouse (
    Warehouse_ID INT PRIMARY KEY,
    Warehouse_Name VARCHAR(100) NOT NULL,
    Warehouse_City VARCHAR(50),
    Warehouse_State VARCHAR(50),
    Warehouse_Capacity INT
);

-- Dimension Shipping
CREATE TABLE IF NOT EXISTS dim_shipping (
    Shipping_ID INT AUTO_INCREMENT PRIMARY KEY,
    Shipping_Mode VARCHAR(50) NOT NULL,
    Delivery_Status VARCHAR(50) NOT NULL,
    Shipping_Date_Real_Days INT,
    Shipping_Date_Scheduled_Days INT
);

-- Dimension Date
CREATE TABLE IF NOT EXISTS dim_date (
    Date_ID INT PRIMARY KEY, -- Formatted as YYYYMMDD
    Full_Date DATE NOT NULL,
    Day INT NOT NULL,
    Month INT NOT NULL,
    Year INT NOT NULL,
    Quarter INT NOT NULL,
    Month_Name VARCHAR(20) NOT NULL,
    Day_Of_Week VARCHAR(20) NOT NULL
);

-- Fact Table
CREATE TABLE IF NOT EXISTS fact_order (
    Fact_ID INT AUTO_INCREMENT PRIMARY KEY,
    Order_ID INT NOT NULL,
    Customer_ID INT NOT NULL,
    Product_ID INT NOT NULL,
    Supplier_ID INT NOT NULL,
    Warehouse_ID INT NOT NULL,
    Date_ID INT NOT NULL,
    Shipping_ID INT NOT NULL,
    Quantity INT NOT NULL,
    Sales DECIMAL(10, 2) NOT NULL,
    Profit DECIMAL(10, 2) NOT NULL,
    Delivery_Delay INT NOT NULL, -- Days Shipping Real - Days Shipment Scheduled
    Risk_Level VARCHAR(10) NOT NULL, -- Low Risk, Medium Risk, High Risk
    FOREIGN KEY (Customer_ID) REFERENCES dim_customer(Customer_ID),
    FOREIGN KEY (Product_ID) REFERENCES dim_product(Product_ID),
    FOREIGN KEY (Supplier_ID) REFERENCES dim_supplier(Supplier_ID),
    FOREIGN KEY (Warehouse_ID) REFERENCES dim_warehouse(Warehouse_ID),
    FOREIGN KEY (Date_ID) REFERENCES dim_date(Date_ID),
    FOREIGN KEY (Shipping_ID) REFERENCES dim_shipping(Shipping_ID)
);

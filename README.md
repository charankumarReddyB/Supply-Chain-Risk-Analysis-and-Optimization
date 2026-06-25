# Supply Chain Risk Analysis & Optimization — Backend

A production-ready Python Flask backend for supply chain risk analysis, machine learning-based risk prediction, Monte Carlo simulation, ETL pipelines, data warehousing (Star Schema), and comprehensive reporting.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Python Flask 3.0 |
| Authentication | Flask-JWT-Extended |
| Database | MySQL (via PyMySQL) |
| ORM | SQLAlchemy |
| ML | Scikit-learn Decision Tree |
| Simulation | NumPy Monte Carlo (10,000 runs) |
| PDF Reports | ReportLab |
| Excel Reports | OpenPyXL + Pandas |

---

## Project Structure

```
backend/
├── app.py                          # Flask app factory, blueprint registration
├── config.py                       # Configuration (DB, JWT, paths)
├── requirements.txt                # All pinned dependencies
├── database_setup.sql              # Full schema: OLTP + OLAP Star Schema
│
├── routes/                         # API Blueprints (URL handlers)
│   ├── auth.py                     # /api/auth/*
│   ├── dashboard.py                # /api/dashboard/*
│   ├── analytics.py                # /api/analytics/*
│   ├── suppliers.py                # /api/suppliers/*
│   ├── products.py                 # /api/products/*
│   ├── inventory.py                # /api/inventory/*
│   ├── orders.py                   # /api/orders/*
│   ├── shipments.py                # /api/shipments/*
│   ├── warehouse.py                # /api/warehouses/*
│   ├── risk.py                     # /api/risk/*
│   ├── optimization.py             # /api/optimization/*
│   ├── reports.py                  # /api/reports/*
│   ├── etl.py                      # /api/etl/*
│   └── monte_carlo.py              # /api/monte-carlo/*
│
├── controllers/                    # Business logic layer
│   ├── auth_controller.py
│   ├── dashboard_controller.py
│   ├── risk_controller.py
│   └── analytics_controller.py
│
├── services/                       # Reusable service classes
│   ├── optimization_service.py     # Supply chain optimization engine
│   └── report_service.py           # PDF & Excel report generation
│
├── models/
│   └── database.py                 # DB connection, execute_query helpers
│
├── middleware/
│   └── auth_middleware.py          # JWT & RBAC decorator middleware
│
├── ml/
│   ├── train.py                    # Decision Tree training (accuracy/F1/etc.)
│   ├── predict.py                  # Singleton risk predictor
│   ├── monte_carlo.py              # 4-scenario Monte Carlo simulation
│   ├── risk_classifier.joblib      # Trained model artifact
│   ├── encoders.joblib             # Label encoder artifacts
│   └── model_metrics.json          # Accuracy, F1, confusion matrix, etc.
│
├── etl/
│   ├── run_etl.py                  # Full ETL pipeline (extract→transform→load)
│   └── generate_mock_data.py       # DataCo-style CSV generator
│
├── warehouse/
│   └── schema.py                   # OLAP warehouse introspection helpers
│
├── sql/
│   └── analytics_queries.sql       # 13 OLAP analytical SQL queries
│
├── utils/
│   ├── init_system.py              # One-command full system initialization
│   └── test_apis.py                # API smoke tests
│
├── static/
│   └── monte_carlo_graphs/         # Simulation PNG output directory
│
├── uploads/                        # Generated PDF/Excel report output
├── dataset/                        # DataCo CSV dataset location
└── .env                            # Environment variables (not committed)
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- MySQL 8.0+
- pip

### 1. Clone & Install

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=supply_chain_db
JWT_SECRET_KEY=your-long-secret-key-here
```

### 3. One-Command Initialization

Run this once to create the database schema, generate the dataset, run the ETL pipeline, and train the ML model:

```bash
python -m backend.utils.init_system
```

This performs:
1. ✅ Creates all MySQL tables (OLTP + OLAP Star Schema)
2. ✅ Seeds admin user (`admin` / `admin123`)
3. ✅ Generates 18,500-record mock DataCo supply chain CSV
4. ✅ Runs the full ETL pipeline (extract → transform → load)
5. ✅ Trains the Decision Tree risk classifier

### 4. Start the Server

```bash
python -m backend.app
```

Server runs at: `http://localhost:5000`

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by calling `POST /api/auth/login`.

> [!WARNING]
> Do NOT use the default credentials in production. The system will issue warning logs at startup if default credentials are detected in a production environment.

### Local Development Credentials (Local Dev Only)
- **Admin**:
  - Username: `admin`
  - Password: `admin123`
- **Standard User**:
  - Username: `user`
  - Password: `user123`

---

## Data Warehouse (Star Schema)

```
                    ┌─────────────┐
                    │  DimDate    │
                    └──────┬──────┘
                           │
┌──────────────┐   ┌───────▼──────────┐   ┌──────────────┐
│ DimCustomer  ├───┤                  ├───┤  DimProduct  │
└──────────────┘   │   FactOrders     │   └──────────────┘
                   │                  │
┌──────────────┐   │ Order_ID         │   ┌──────────────┐
│ DimSupplier  ├───┤ Customer_ID      ├───┤ DimWarehouse │
└──────────────┘   │ Product_ID       │   └──────────────┘
                   │ Supplier_ID      │
┌──────────────┐   │ Warehouse_ID     │
│ DimShipping  ├───┤ Date_ID          │
└──────────────┘   │ Shipping_ID      │
                   │ Sales/Profit     │
                   │ Delivery_Delay   │
                   │ Risk_Level       │
                   └──────────────────┘
```

---

## Machine Learning

**Algorithm:** Decision Tree Classifier  
**Target:** Risk Level (Low / Medium / High)  
**Features:**
- Days for shipment (scheduled)
- Shipping Mode
- Customer Segment
- Category Name
- Product Price
- Sales
- Order Item Discount Rate

**Metrics saved:** Accuracy, Precision, Recall, F1 Score, Confusion Matrix, Feature Importance (per class)

---

## Monte Carlo Simulation

Runs **10,000 simulations** for each of 4 scenarios:

| Scenario | Method | Output |
|---|---|---|
| Delivery Delay | Normal distribution | Probability of delay > 0 days |
| Inventory Stockout | Poisson demand model | Probability stock < demand |
| Supplier Failure | Binomial per supplier | Probability ≥1 supplier fails |
| Transportation Delay | Binomial per mode | Delay probability per mode |

Graphs saved to `static/monte_carlo_graphs/` as PNG files.

---

## ETL Pipeline

1. **Extract:** Read DataCo CSV from `dataset/`
2. **Transform:**
   - Drop rows with missing Order/Customer/Product IDs
   - Fill null text fields
   - Remove duplicate order items
   - Parse date columns
   - Compute `Delivery_Delay` = real days − scheduled days
   - Classify `Risk_Level` (High/Medium/Low)
   - Assign `Supplier_ID` and `Warehouse_ID` deterministically
3. **Load:**
   - OLTP tables: customers, products, orders, shipments, inventory
   - OLAP tables: dim_customer, dim_product, dim_supplier, dim_warehouse, dim_shipping, dim_date, fact_order
4. **Log:** ETL run status, duration, and errors in `etl_logs` table

---

## Installation Guide

### Manual Steps

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate         # Windows
source venv/bin/activate      # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up MySQL
# Create database manually if needed:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS supply_chain_db;"

# 4. Run full initialization
python -m backend.utils.init_system

# 5. Start Flask server
python -m backend.app
```

---

## Production Deployment & WSGI Serving

For production, serve the application using a WSGI server like **Gunicorn**:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `FLASK_ENV` | `development` | Set to `production` to activate production settings and seed safety checks |
| `FLASK_DEBUG` | `false` | Enable/disable Flask debug mode |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `supply_chain_db` | Database name |
| `JWT_SECRET_KEY` | *(required)* | JWT signing key (Must be set in production; startup will fail if missing) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed CORS origins (e.g. `https://your-app.netlify.app`) |

---

## License

B.Tech Capstone Project — Supply Chain Risk Optimization

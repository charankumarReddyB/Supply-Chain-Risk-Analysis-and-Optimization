# 🚚 Supply Chain Risk Optimization

A full-stack AI-powered platform for supply chain risk analysis, monitoring, and optimization.

## 📁 Project Structure

```
supply chain risk optimization/
├── backend/          # Python FastAPI backend with ML models & ETL pipelines
└── frontend/         # Next.js React frontend with interactive dashboards
```

## 🚀 Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
# Configure your .env file (see .env.example)
python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI, Pandas, Scikit-learn
- **Database**: PostgreSQL / SQLite
- **ETL**: Custom Python ETL pipelines

## 📊 Features

- Real-time supply chain risk monitoring
- AI/ML-based risk prediction and scoring
- Interactive dashboards and visualizations
- ETL pipelines for data ingestion and processing
- Supplier risk profiling

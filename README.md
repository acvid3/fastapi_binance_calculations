# Investment Strategy Analysis

A comprehensive investment analysis tool that analyzes trading strategies with commissions and trading steps using Binance API data.

## 🏗️ Architecture

The project is split into two independent services:

- **Backend**: FastAPI application deployed on AWS
- **Frontend**: React + Vite application deployed on Vercel

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```
   Backend will be available at: http://localhost:8000

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at: http://localhost:3000

## 📁 Project Structure

```
fastapi_binance_calculations/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Docker configuration
│   └── docker-compose.yml # Docker Compose
├── frontend/               # React + Vite frontend
│   ├── src/               # Source code
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
│   └── vercel.json        # Vercel deployment
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## 🛠️ Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Requests** - HTTP library
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Recharts** - Chart components
- **date-fns** - Date utilities

### Infrastructure
- **AWS** - Backend hosting (EC2, ECS, Lambda)
- **Vercel** - Frontend hosting
- **Docker** - Containerization

## 📊 API Endpoints

### Core Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /analyze` - Investment analysis
- `GET /symbols` - Available trading pairs

### Analysis Parameters

```json
{
  "initial_balance": 10000,
  "trade_amount": 1000,
  "threshold_percent": 0.05,
  "commission_rate": 0.00075,
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-02-01T00:00:00",
  "symbol": "ETHUSDT",
  "interval": "1h"
}
```

## 📈 Trading Algorithm

The system implements a DCA (Dollar Cost Averaging) strategy:

1. **Buy Signal**: When price drops by threshold percentage
2. **Sell Signal**: When price rises by threshold percentage
3. **Commission Calculation**: Applied to all trades
4. **Position Tracking**: Monitors open and closed positions

## 🚀 Deployment

### Backend (AWS)

- **EC2**: Simple deployment
- **ECS**: Container orchestration
- **Lambda**: Serverless functions

### Frontend (Vercel)

- Automatic deployments from Git
- Global CDN
- Zero configuration

## 🔒 Security

- CORS configuration for production domains
- Input validation with Pydantic
- Rate limiting for API calls
- Secure headers configuration

## 📊 Monitoring

- Health check endpoints
- Error logging
- Performance metrics
- AWS CloudWatch integration

## 🛠️ Development Commands

```bash
# Backend
cd backend
python main.py

# Frontend
cd frontend
npm run dev
npm run build

# Docker
docker-compose up --build
```

## 📝 License

This project is for educational purposes. Use at your own risk.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Note**: This tool is for educational purposes only. Always do your own research before making investment decisions.

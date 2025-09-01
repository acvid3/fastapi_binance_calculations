# API Endpoints Test

## Test the following endpoints to ensure they work correctly:

### 1. Symbols Endpoint
```bash
# Local development
curl http://localhost:3000/api/symbols

# Production (if deployed)
curl https://your-vercel-app.vercel.app/api/symbols
```

Expected response:
```json
{
  "symbols": [
    {
      "symbol": "ETHUSDT",
      "price": 1234.56,
      "priceChangePercent": 2.5,
      "volume": 1234567,
      "low24h": 1200.00,
      "high24h": 1300.00
    }
  ]
}
```

### 2. Analyze Endpoint
```bash
# Local development
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "initial_balance": 10000,
    "trade_amount": 1000,
    "threshold_percent": 0.05,
    "commission_rate": 0.00075,
    "start_date": "2024-01-01T00:00:00",
    "end_date": "2024-01-31T23:59:59",
    "symbol": "ETHUSDT",
    "interval": "1h"
  }'

# Production (if deployed)
curl -X POST https://your-vercel-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "initial_balance": 10000,
    "trade_amount": 1000,
    "threshold_percent": 0.05,
    "commission_rate": 0.00075,
    "start_date": "2024-01-01T00:00:00",
    "end_date": "2024-01-31T23:59:59",
    "symbol": "ETHUSDT",
    "interval": "1h"
  }'
```

Expected response:
```json
{
  "summary": {
    "initial_balance": 10000,
    "final_balance": 10500,
    "total_profit": 500,
    "roi_percent": 5.0,
    "total_trades": 25,
    "min_balance": 9500,
    "pending_positions": 0
  },
  "trades": [...],
  "chart_data": {...}
}
```

## Browser Console Test

Open browser console and check:

1. API_BASE_URL should be `/api` (or your custom URL if set)
2. No CORS errors
3. Successful API calls

```javascript
// Test in browser console
console.log('API_BASE_URL:', API_BASE_URL);
fetch('/api/symbols').then(r => r.json()).then(console.log);
```

## Environment Variables

Make sure these are set correctly:

### Development (.env.local)
```bash
VITE_API_URL=http://localhost:8000/api
```

### Production (Vercel)
```bash
VITE_API_URL=https://your-backend-url.com/api
```

Or leave unset to use default `/api` (which will be proxied by Vercel)

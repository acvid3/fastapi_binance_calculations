# Frontend Documentation

## Project Overview

This is a React-based investment analysis application that allows users to analyze cryptocurrency trading strategies with commission calculations and detailed trade history.

## Architecture

### API Configuration
- **Development**: Uses Vite proxy to forward `/api/*` requests to `http://localhost:8000`
- **Production**: Uses Vercel rewrites to forward `/api/*` requests to `http://13.50.4.32:8000`
- **Centralized**: All API calls use `apiUrl()` function from `apiBase.js`

### Key Technologies
- **React 18** with functional components and hooks
- **Vite** for build tooling and development server
- **CSS Modules** for component-scoped styling
- **Recharts** for data visualization
- **date-fns** for date manipulation

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AnalysisResults/     # Results display with tabs
│   │   ├── CurrencySelector/    # Sidebar for trading pairs
│   │   ├── InvestmentForm/      # Analysis parameters form
│   │   └── MarketIndicator/     # Market analysis indicators
│   ├── apiBase.js              # API configuration
│   ├── App.jsx                 # Main application
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── vercel.json                 # Vercel deployment config
├── vite.config.js              # Vite build configuration
└── package.json                # Dependencies
```

## Components

### App.jsx
Main application component that manages:
- Analysis data state
- Loading states
- Error handling
- Symbol selection

### InvestmentForm
Form component for configuring analysis parameters:
- Initial balance and trade amounts
- Price change thresholds
- Commission rates
- Date ranges
- Trading pair selection
- Time intervals

### CurrencySelector
Sidebar component displaying:
- Available trading pairs
- Real-time price data
- Price changes and volumes
- Search functionality

### AnalysisResults
Results display with three tabs:
1. **Summary**: Key metrics and performance indicators
2. **Trades**: Detailed trade history table
3. **Charts**: Interactive price and profit charts

### MarketIndicator
Visual indicator showing:
- Price changes
- Volume analysis
- Bull/Bear market signals

## API Integration

### Configuration
```javascript
// apiBase.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const apiUrl = (endpoint) => `${API_BASE_URL}/${endpoint}`;
```

### Endpoints Used
- `GET /api/symbols` - Fetch available trading pairs
- `POST /api/analyze` - Run investment analysis

### Proxy Configuration

#### Development (vite.config.js)
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

#### Production (vercel.json)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://13.50.4.32:8000/api/:path*" }
  ]
}
```

## Styling

### Global Styles (index.css)
- CSS reset and base styles
- Responsive design breakpoints
- Layout structure
- Error message styling

### Component Styles
Each component uses CSS Modules for scoped styling:
- `style.module.css` files
- BEM-like naming conventions
- Responsive design patterns
- Dark theme for sidebar

## Development

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:8000/api
```

## Deployment

### Vercel
- Automatic deployment from Git
- Environment variables configured in Vercel dashboard
- API proxying handled by `vercel.json`

### Build Output
- Static files in `dist/` directory
- Optimized for production
- Source maps included

## Features

### Real-time Data
- Live cryptocurrency prices
- Volume and price change indicators
- 24-hour high/low ranges

### Interactive Analysis
- Configurable parameters
- Real-time form validation
- Loading states and error handling

### Data Visualization
- Price and balance charts
- Profit analysis graphs
- Market trend indicators

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interfaces

## Performance

### Optimizations
- React.memo for expensive components
- Lazy loading for charts
- Efficient re-renders with proper state management
- Optimized bundle size with Vite

### Monitoring
- Console logging for API calls
- Error boundaries for crash handling
- Performance metrics in development

## Security

### API Security
- CORS handled by proxy configuration
- No sensitive data in client-side code
- Environment variable protection

### Input Validation
- Form validation on client side
- Server-side validation for API calls
- Sanitized user inputs

## Testing

### Manual Testing
- API endpoint testing (see TEST_API_ENDPOINTS.md)
- Browser console validation
- Cross-browser compatibility

### Development Testing
- Hot reload during development
- Error overlay for debugging
- Source maps for debugging

## Troubleshooting

### Common Issues
1. **API Connection**: Check backend server is running
2. **CORS Errors**: Verify proxy configuration
3. **Build Errors**: Check Node.js version compatibility
4. **Deployment Issues**: Verify Vercel configuration

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints with curl
3. Check environment variables
4. Validate proxy configuration

# Краткое резюме исправления 404 ошибок API

## 🚨 Проблема
Frontend на Vercel получает 404 при запросах к `/api/symbols` и `/api/analyze`.

## 🔍 Причина
**Mixed Content Policy**: HTTPS сайт (Vercel) не может делать HTTP запросы к backend (AWS).

## ✅ Решение
1. **Создан API helper** (`frontend/src/apiBase.js`) для единообразных вызовов
2. **Обновлен vercel.json** с rewrites для проксирования `/api/*` → backend
3. **Все компоненты** теперь используют `/api/*` endpoints
4. **Убраны Vercel Functions** (не работают с HTTP в бесплатном плане)

## 🔧 Ключевые изменения

### apiBase.js
```javascript
const RAW = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = RAW.replace(/\/$/, '');
export const apiUrl = (p = '') => `${API_BASE_URL}/${String(p).replace(/^\//, '')}`;
```

### vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "http://13.50.4.32:8000/$1" }
  ]
}
```

### Использование в компонентах
```javascript
import { apiUrl } from './apiBase';
const url = apiUrl('symbols'); // → /api/symbols
```

## 🎯 Результат
- Development: прямые запросы к backend
- Production: `/api/*` → Vercel проксирует к backend
- Решена проблема Mixed Content Policy

## 🚀 Проверка
1. Создать Pull Request
2. Дождаться пересборки на Vercel
3. Проверить `/api/symbols` и `/api/analyze` endpoints

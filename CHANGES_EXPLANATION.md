# Объяснение изменений в проекте - Исправление 404 ошибок API

## 🚨 Проблема

Фронтенд на Vercel получает **404 ошибки** при попытке загрузить данные с `/api/symbols` и `/api/analyze`. В Network tab браузера видны запросы к этим endpoints, но они возвращают 404.

## 🔍 Диагностика проблемы

### 1. **Mixed Content Policy**
- Frontend на Vercel работает по **HTTPS**
- Backend на AWS работает по **HTTP** (`http://13.50.4.32:8000`)
- Браузеры блокируют HTTPS → HTTP запросы из соображений безопасности

### 2. **CORS и Routing**
- Frontend пытается обратиться к backend напрямую
- Vercel не знает, как обрабатывать `/api/*` запросы
- Нет проксирования между frontend и backend

## 🛠️ Попытки решения

### Попытка 1: Vercel Functions (НЕ СРАБОТАЛА)
Создали Vercel Functions в папке `api/` для проксирования запросов:

```javascript
// api/symbols.js
module.exports = async (req, res) => {
    const backendUrl = 'http://13.50.4.32:8000/api/symbols';
    const response = await fetch(backendUrl);
    // ... проксирование данных
};
```

**Проблема**: Vercel Functions не могут делать HTTP запросы к внешним серверам в бесплатном плане.

### Попытка 2: vercel.json rewrites (ТЕКУЩЕЕ РЕШЕНИЕ)
Обновили `frontend/vercel.json`:

```json
{
    "framework": "vite",
    "installCommand": "npm install",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
        {
            "source": "/api/(.*)",
            "destination": "http://13.50.4.32:8000/$1"
        }
    ]
}
```

**Логика**: Все запросы к `/api/*` должны проксироваться к backend.

## 🔧 Реализованные изменения

### 1. **Создан единый API helper** (`frontend/src/apiBase.js`)

```javascript
const RAW = import.meta.env.VITE_API_URL || '/api';
export const API_BASE_URL = RAW.replace(/\/$/, '');
export const apiUrl = (p = '') => `${API_BASE_URL}/${String(p).replace(/^\//, '')}`;

// Debug logging
console.log('API_BASE_URL =', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);
```

**Цель**: Единообразные API вызовы во всех компонентах.

### 2. **Обновлены все компоненты**

#### App.jsx
```javascript
import { apiUrl } from './apiBase';

const handleAnalysis = async (formData) => {
    const url = apiUrl('analyze');
    console.log('Sending analysis request to:', url);
    // ... fetch логика
};
```

#### CurrencySelector/index.jsx
```javascript
import { apiUrl } from '../../apiBase';

const fetchSymbols = async () => {
    const url = apiUrl('symbols');
    console.log('Fetching symbols from:', url);
    // ... fetch логика
};
```

**Цель**: Все API вызовы идут через `/api/*` endpoints.

### 3. **Исправлен vercel.json**
Добавлены rewrites для проксирования `/api/*` запросов к backend.

### 4. **Удалены ненужные файлы**
- Убрали Vercel Functions (`api/*.js`)
- Убрали root `package.json`
- Очистили проект от неиспользуемого кода

### 5. **Добавлен vite.svg**
Создали `frontend/public/vite.svg` для предотвращения 404 ошибок на иконку.

## 🎯 Ожидаемый результат

После применения изменений:

1. **В development режиме**: API calls идут напрямую к backend
2. **В production (Vercel)**: API calls идут через `/api/*` → Vercel проксирует к backend
3. **В консоли браузера** должны появиться логи:
   ```
   API_BASE_URL = /api
   Environment: production
   VITE_API_URL = undefined
   ```
4. **В Network tab** запросы должны идти на:
   - `/api/symbols` → 200 OK
   - `/api/analyze` → 200 OK

## 🚀 Как проверить

### 1. **Локальная проверка**
```bash
cd frontend
npm run dev
# Открыть http://localhost:5173
# Проверить консоль браузера
# Проверить Network tab
```

### 2. **Production проверка**
- Создать Pull Request
- Дождаться пересборки на Vercel
- Открыть `fastapi-binance-calculations.vercel.app`
- Проверить консоль и Network tab

## 🔍 Возможные проблемы

### 1. **Vercel не подхватил vercel.json**
- Проверить, что файл находится в `frontend/vercel.json`
- Убедиться, что Vercel использует `frontend` как Root Directory

### 2. **Backend недоступен**
- Проверить `curl http://13.50.4.32:8000/health`
- Убедиться, что backend слушает на `0.0.0.0:8000`

### 3. **CORS на backend**
- Проверить настройки CORS в `backend/app/main.py`
- Убедиться, что разрешены все origins

## 📋 Следующие шаги

1. **Создать Pull Request** с этими изменениями
2. **Дождаться пересборки** на Vercel
3. **Протестировать** API endpoints
4. **Если не работает** - проверить логи Vercel и backend

## 💡 Альтернативные решения

Если текущий подход не сработает:

### Вариант 1: HTTPS на backend
- Настроить SSL сертификат на AWS
- Обновить backend URL на HTTPS

### Вариант 2: Vercel Edge Functions
- Использовать Edge Functions вместо Serverless Functions
- Более гибкие возможности для внешних HTTP запросов

### Вариант 3: Другой hosting
- Развернуть backend на Vercel
- Использовать Cloudflare Workers для проксирования

## 📝 Заключение

Мы реализовали комплексное решение проблемы 404 ошибок:
- Единый API helper для консистентности
- Vercel rewrites для проксирования
- Debug логирование для диагностики
- Очистка проекта от неиспользуемого кода

Основная идея: все API запросы идут через `/api/*` endpoints, которые Vercel проксирует к backend, решая проблему Mixed Content Policy.

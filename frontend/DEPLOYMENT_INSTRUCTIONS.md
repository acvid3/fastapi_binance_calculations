# Инструкции по деплою на Vercel

## Проблема
API endpoints `/api/*` возвращают 404 на Vercel, хотя локально работают через vite proxy.

## Решение
Создана serverless-функция `frontend/api/[...path].js` для проксирования запросов на FastAPI бэкенд.

## Что нужно сделать на Vercel

### 1. Проверить Root Directory
- В настройках проекта на Vercel убедитесь, что **Root Directory = `frontend`**
- Это критически важно для работы serverless-функций

### 2. Переменные окружения
- `VITE_API_URL` - НЕ задавать (оставить пустым) или поставить `/api`
- Фронт будет использовать `/api` как базовый URL

### 3. Деплой
1. Сделать commit всех изменений
2. Запустить деплой на Vercel
3. **Обязательно** выбрать "Clear Build Cache" при деплое

### 4. Проверка
После деплоя должны работать:
- `GET /api/test` → 200 JSON
- `GET /api/health` → 200 от FastAPI
- `GET /api/symbols` → 200 от FastAPI

## Структура файлов
```
frontend/
├── api/                    # ← Serverless функции (корень для Vercel)
│   ├── [...path].js       # ← Прокси на FastAPI
│   └── test.js            # ← Тестовый endpoint
├── vercel.json            # ← Конфигурация Vercel
├── vite.config.js         # ← Только для локальной разработки
└── src/
    └── apiBase.js         # ← API_BASE_URL = '/api'
```

## Примечания
- `vite.config.js` нужен только для `npm run dev` (локально)
- На Vercel работает только папка `api/` с serverless-функциями
- `vercel.json` rewrites не работают для внешних URL

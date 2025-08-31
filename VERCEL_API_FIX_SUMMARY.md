# Исправление проблемы с API на Vercel - Summary

## Что было исправлено

### 1. Создана serverless-функция для проксирования API
- **Файл**: `frontend/api/[...path].js`
- **Функция**: Проксирует все запросы `/api/*` на FastAPI бэкенд `http://13.50.4.32:8000/*`
- **Поддержка**: GET, POST, PUT, DELETE методы с передачей headers и body

### 2. Обновлен vercel.json
- **Убраны**: rewrites (не работают для внешних URL)
- **Оставлены**: настройки для Vite (framework, build commands)

### 3. Улучшен vite.config.js
- **Добавлено**: копирование статических файлов из `public/` в `dist/`
- **Результат**: `vite.svg` теперь будет доступен в продакшене

### 4. Создан тестовый API endpoint
- **Файл**: `frontend/api/test.js`
- **Цель**: Проверить работу serverless-функций на Vercel

### 5. Добавлен .vercelignore
- **Исключает**: node_modules, .env файлы, логи

## Структура после исправлений

```
frontend/
├── api/                    # ← Serverless функции (работают на Vercel)
│   ├── [...path].js       # ← Основной прокси на FastAPI
│   └── test.js            # ← Тестовый endpoint
├── vercel.json            # ← Конфигурация Vercel
├── vite.config.js         # ← Локальная разработка + статика
├── .vercelignore          # ← Исключения для деплоя
├── public/
│   └── vite.svg           # ← Теперь копируется в dist/
└── src/
    └── apiBase.js         # ← API_BASE_URL = '/api'
```

## Критические моменты для деплоя

### 1. Root Directory на Vercel
**ОБЯЗАТЕЛЬНО**: `Root Directory = frontend`
- Без этого папка `api/` не будет распознана как serverless-функции
- Vercel будет искать `vercel.json` в корне репозитория

### 2. Clear Build Cache
При деплое **ОБЯЗАТЕЛЬНО** выбрать "Clear Build Cache"
- Старые билды могут содержать неправильную структуру
- Новые serverless-функции не попадут в деплой

### 3. Переменные окружения
- `VITE_API_URL` - НЕ задавать или поставить `/api`
- Фронт будет использовать `/api` как базовый URL

## Ожидаемый результат

После правильного деплоя:
- ✅ `GET /api/test` → 200 JSON
- ✅ `GET /api/health` → 200 от FastAPI  
- ✅ `GET /api/symbols` → 200 от FastAPI
- ✅ `GET /vite.svg` → 200 (файл доступен)
- ✅ Приложение работает без 404 ошибок

## Тестирование

1. **Локально**: `npm run dev` - работает через vite proxy
2. **Продакшен**: Vercel - работает через serverless-функции
3. **API**: Все `/api/*` запросы проксируются на FastAPI

## Примечания

- `vite.config.js` нужен только для локальной разработки
- На Vercel работают только serverless-функции в папке `api/`
- `vercel.json` rewrites не работают для внешних URL (ограничение Vercel)

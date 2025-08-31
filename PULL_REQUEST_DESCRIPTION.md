# 🔧 Pull Request: Fix Vercel API Proxy

## 📋 Описание
Исправляет проблему с API endpoints на Vercel, где все запросы `/api/*` возвращали 404 ошибки.

## 🚨 Проблема
- API endpoints `/api/*` возвращают 404 на Vercel
- `vercel.json` rewrites не работают для внешних URL
- `vite.svg` недоступен в продакшене

## ✅ Решение
Реализован механизм serverless-функций для проксирования API запросов на FastAPI бэкенд.

## 🔧 Изменения

### Добавлено
- `frontend/api/[...path].js` - основная serverless-функция для проксирования
- `frontend/api/test.js` - тестовый endpoint для проверки
- `frontend/.vercelignore` - исключения для деплоя
- `frontend/DEPLOYMENT_INSTRUCTIONS.md` - инструкции по деплою
- `frontend/test-api.js` - скрипт для тестирования API
- `README_VERCEL_FIX.md` - пошаговое руководство
- `VERCEL_API_FIX_SUMMARY.md` - техническое описание

### Изменено
- `frontend/vercel.json` - убраны rewrites, оставлены настройки Vite
- `frontend/vite.config.js` - добавлено копирование статических файлов

## 🚀 Как это работает

### Локальная разработка
- API работает через vite proxy в `vite.config.js`
- Запросы `/api/*` → `http://13.50.4.32:8000/*`

### Продакшен на Vercel
- API работает через serverless-функции в папке `api/`
- Запросы `/api/*` → `http://13.50.4.32:8000/*`

## 📁 Структура после изменений

```
frontend/
├── api/                    # ← Serverless функции (работают на Vercel)
│   ├── [...path].js       # ← Прокси на FastAPI
│   └── test.js            # ← Тестовый endpoint
├── vercel.json            # ← Конфигурация Vercel
├── vite.config.js         # ← Локальная разработка + статика
├── .vercelignore          # ← Исключения для деплоя
├── public/
│   └── vite.svg           # ← Теперь копируется в dist/
└── src/
    └── apiBase.js         # ← API_BASE_URL = '/api'
```

## 🧪 Тестирование

### Локально
```bash
cd frontend
npm run dev
# API работает через vite proxy
```

### Продакшен
После деплоя на Vercel:
- `GET /api/test` → 200 JSON
- `GET /api/health` → 200 от FastAPI
- `GET /api/symbols` → 200 от FastAPI
- `GET /vite.svg` → 200 (файл доступен)

## 🚨 Критические моменты для деплоя

### 1. Root Directory на Vercel
**ОБЯЗАТЕЛЬНО**: `Root Directory = frontend`
- Без этого папка `api/` не будет распознана как serverless-функции

### 2. Clear Build Cache
При деплое **ОБЯЗАТЕЛЬНО** выбрать "Clear Build Cache"
- Новые serverless-функции не попадут в деплой

### 3. Переменные окружения
- `VITE_API_URL` - НЕ задавать или поставить `/api`

## 📝 Checklist

- [x] Создана serverless-функция для проксирования API
- [x] Обновлен vercel.json (убраны rewrites)
- [x] Улучшен vite.config.js (копирование статики)
- [x] Добавлен .vercelignore
- [x] Создана документация по деплою
- [x] Добавлен тестовый endpoint
- [x] Исправлена проблема с vite.svg

## 🔍 Диагностика

Если после деплоя всё ещё 404:
1. ✅ Root Directory = `frontend` на Vercel?
2. ✅ Clear Build Cache при деплое?
3. ✅ Папка `api/` в корне проекта для Vercel?

## 🎯 Результат

После правильного деплоя:
- ✅ API endpoints работают
- ✅ Приложение не выдаёт 404
- ✅ Статические файлы доступны
- ✅ Проксирование на FastAPI работает

## 📚 Дополнительные файлы

- `README_VERCEL_FIX.md` - пошаговое руководство
- `VERCEL_API_FIX_SUMMARY.md` - техническое описание
- `frontend/DEPLOYMENT_INSTRUCTIONS.md` - инструкции по деплою

---

**Ветка**: `fix/vercel-api-proxy`  
**Тип**: Bug Fix  
**Приоритет**: High (критично для работы API в продакшене)

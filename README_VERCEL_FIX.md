# 🚀 Исправление API на Vercel - Пошаговое руководство

## 🎯 Проблема
API endpoints `/api/*` возвращают 404 на Vercel, хотя локально работают через vite proxy.

## ✅ Решение
Создана serverless-функция для проксирования запросов на FastAPI бэкенд.

## 📋 Пошаговые действия

### Шаг 1: Проверить текущее состояние
```bash
cd frontend
ls -la api/
# Должны быть файлы: [...path].js и test.js
```

### Шаг 2: Сделать commit изменений
```bash
git add .
git commit -m "Fix Vercel API: add serverless functions for API proxy"
git push
```

### Шаг 3: Настройка Vercel (КРИТИЧНО!)

#### 3.1 Root Directory
1. Зайти на [vercel.com](https://vercel.com)
2. Выбрать проект `fastapi-binance-calculations`
3. Settings → General → Root Directory
4. **ОБЯЗАТЕЛЬНО** поставить: `frontend`
5. Save

#### 3.2 Переменные окружения
1. Settings → Environment Variables
2. `VITE_API_URL` - НЕ задавать (оставить пустым)
3. Или поставить значение: `/api`

### Шаг 4: Деплой с Clear Cache
1. Deployments → Redeploy
2. **ОБЯЗАТЕЛЬНО** выбрать "Clear Build Cache" ✅
3. Deploy

### Шаг 5: Проверка
После деплоя проверить:

#### 5.1 Тестовый endpoint
```
GET https://fastapi-binance-calculations.vercel.app/api/test
```
**Ожидается**: 200 JSON с сообщением "API is working!"

#### 5.2 FastAPI endpoints
```
GET https://fastapi-binance-calculations.vercel.app/api/health
GET https://fastapi-binance-calculations.vercel.app/api/symbols
```
**Ожидается**: 200 от FastAPI бэкенда

#### 5.3 Статические файлы
```
GET https://fastapi-binance-calculations.vercel.app/vite.svg
```
**Ожидается**: 200 (файл доступен)

## 🔧 Что было исправлено

### 1. Serverless-функция `frontend/api/[...path].js`
- Проксирует все `/api/*` запросы на `http://13.50.4.32:8000/*`
- Поддерживает все HTTP методы
- Передает headers и body

### 2. Обновлен `vercel.json`
- Убраны rewrites (не работают для внешних URL)
- Оставлены настройки для Vite

### 3. Улучшен `vite.config.js`
- Добавлено копирование статических файлов
- `vite.svg` теперь доступен в продакшене

### 4. Добавлен `.vercelignore`
- Исключает ненужные файлы из деплоя

## 🚨 Критические моменты

### ❌ Что НЕ работает
- `vercel.json` rewrites для внешних URL
- Проксирование без serverless-функций

### ✅ Что работает
- Serverless-функции в папке `api/`
- Локальный vite proxy для разработки
- Статические файлы из `public/`

## 🧪 Тестирование

### Локально
```bash
cd frontend
npm run dev
# API работает через vite proxy на http://localhost:3000/api/*
```

### Продакшен
```bash
# После деплоя на Vercel
curl https://fastapi-binance-calculations.vercel.app/api/test
# Должен вернуть 200 JSON
```

## 📁 Структура файлов

```
frontend/
├── api/                    # ← Serverless функции (работают на Vercel)
│   ├── [...path].js       # ← Прокси на FastAPI
│   └── test.js            # ← Тестовый endpoint
├── vercel.json            # ← Конфигурация Vercel
├── vite.config.js         # ← Локальная разработка
├── .vercelignore          # ← Исключения для деплоя
├── public/
│   └── vite.svg           # ← Статические файлы
└── src/
    └── apiBase.js         # ← API_BASE_URL = '/api'
```

## 🔍 Диагностика проблем

### Если всё ещё 404:
1. ✅ Root Directory = `frontend` на Vercel?
2. ✅ Clear Build Cache при деплое?
3. ✅ Папка `api/` в корне проекта для Vercel?
4. ✅ Serverless-функции в логах деплоя?

### Если vite.svg 404:
1. ✅ `publicDir: 'public'` в `vite.config.js`?
2. ✅ Файл `vite.svg` в `frontend/public/`?

## 📞 Поддержка

Если проблема не решается:
1. Проверить логи деплоя на Vercel
2. Убедиться, что Root Directory = `frontend`
3. Сделать redeploy с Clear Build Cache
4. Проверить, что папка `api/` попала в деплой

## 🎉 Результат

После правильного деплоя:
- ✅ API endpoints работают
- ✅ Приложение не выдаёт 404
- ✅ Статические файлы доступны
- ✅ Проксирование на FastAPI работает

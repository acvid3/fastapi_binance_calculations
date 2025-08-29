# Инструкции по деплою

## Архитектура проекта

- **Backend**: FastAPI на AWS (EC2, ECS, или Lambda)
- **Frontend**: React + Vite на Vercel

## 1. Деплой Backend на AWS

### Вариант A: AWS EC2

1. **Создайте EC2 инстанс**:
   ```bash
   # Ubuntu 22.04 LTS
   # t3.micro для тестирования, t3.small для production
   ```

2. **Подключитесь к инстансу**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Установите Docker**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Клонируйте backend репозиторий**:
   ```bash
   git clone <your-backend-repo>
   cd <backend-directory>
   ```

5. **Запустите приложение**:
   ```bash
   docker-compose up -d
   ```

6. **Настройте Security Group**:
   - Откройте порт 80 (HTTP)
   - Откройте порт 443 (HTTPS)
   - Откройте порт 22 (SSH)

7. **Настройте домен** (опционально):
   ```bash
   # Установите nginx для reverse proxy
   sudo apt install nginx
   
   # Настройте nginx.conf
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Вариант B: AWS ECS (рекомендуется для production)

1. **Создайте ECR репозиторий**:
   ```bash
   aws ecr create-repository --repository-name investment-api
   ```

2. **Соберите и загрузите Docker образ**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t investment-api .
   docker tag investment-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/investment-api:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/investment-api:latest
   ```

3. **Создайте ECS кластер и сервис**:
   - Создайте кластер
   - Создайте task definition
   - Создайте сервис
   - Настройте Application Load Balancer

### Вариант C: AWS Lambda + API Gateway

1. **Установите serverless framework**:
   ```bash
   npm install -g serverless
   ```

2. **Создайте serverless.yml**:
   ```yaml
   service: investment-api
   
   provider:
     name: aws
     runtime: python3.11
     region: us-east-1
   
   functions:
     api:
       handler: main.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
   ```

3. **Деплойте**:
   ```bash
   serverless deploy
   ```

## 2. Деплой Frontend на Vercel

### 1. Подготовка проекта

1. **Создайте отдельный репозиторий для frontend**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-frontend-repo>
   git push -u origin main
   ```

2. **Настройте переменные окружения**:
   - Создайте `.env.local` файл:
     ```bash
     VITE_API_URL=https://your-aws-api-domain.com
     ```

### 2. Деплой на Vercel

1. **Подключите GitHub репозиторий к Vercel**:
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш frontend репозиторий

2. **Настройте переменные окружения**:
   - В настройках проекта добавьте:
     - `VITE_API_URL` = `https://your-aws-api-domain.com`

3. **Настройте домен** (опционально):
   - В настройках проекта добавьте ваш домен
   - Настройте DNS записи

4. **Деплой**:
   - Vercel автоматически деплоит при каждом push в main ветку

## 3. Настройка CORS

После деплоя backend, обновите CORS настройки в `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-domain.vercel.app",  # Ваш Vercel домен
        "http://localhost:3000",  # Для локальной разработки
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 4. Тестирование

### Backend
```bash
# Локально
curl http://localhost:8000/health

# На AWS
curl https://your-aws-domain.com/health
```

### Frontend
```bash
# Локально
npm run dev

# На Vercel
# Откройте https://your-vercel-domain.vercel.app
```

## 5. Мониторинг и логи

### AWS
- **CloudWatch**: Логи и метрики
- **X-Ray**: Трассировка запросов
- **CloudTrail**: Аудит API вызовов

### Vercel
- **Analytics**: Производительность frontend
- **Logs**: Логи деплоя и ошибок
- **Speed Insights**: Анализ скорости загрузки

## 6. Обновление

### Backend
```bash
# EC2
git pull
docker-compose down
docker-compose up -d

# ECS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t investment-api .
docker tag investment-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/investment-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/investment-api:latest
# Обновите ECS сервис
```

### Frontend
```bash
git push origin main
# Vercel автоматически деплоит
```

## 7. Безопасность

- **HTTPS**: Всегда используйте HTTPS в production
- **API Keys**: Настройте API Gateway с ключами если нужно
- **Rate Limiting**: Настройте ограничения на количество запросов
- **CORS**: Ограничьте CORS только необходимыми доменами

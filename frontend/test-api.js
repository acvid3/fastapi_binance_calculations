// Тестирование API endpoints
const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Тестирование API endpoints...\n');
  
  try {
    // Тест 1: Локальный vite proxy
    console.log('1️⃣ Тест локального vite proxy:');
    const response1 = await fetch(`${API_BASE}/symbols`);
    console.log(`   /api/symbols: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   Данные: ${data1.length || 'N/A'} символов`);
    }
    
    // Тест 2: Health check
    console.log('\n2️⃣ Тест health check:');
    const response2 = await fetch(`${API_BASE}/health`);
    console.log(`   /api/health: ${response2.status} ${response2.statusText}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`   Статус: ${JSON.stringify(data2)}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
  
  console.log('\n📝 Для тестирования на Vercel:');
  console.log('   - Сделать commit и push');
  console.log('   - На Vercel: Root Directory = frontend');
  console.log('   - Деплой с Clear Build Cache');
  console.log('   - Проверить: https://fastapi-binance-calculations.vercel.app/api/test');
}

// Запуск теста если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}

export { testAPI };

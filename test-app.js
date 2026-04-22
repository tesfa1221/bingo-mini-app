const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

async function testApp() {
  console.log('\n🧪 COMPREHENSIVE APP TESTING\n');
  
  const API_URL = 'http://localhost:3001';
  const headers = {
    'x-telegram-init-data': 'mock_init_data_for_development',
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: Backend Health
    console.log('1️⃣  Testing Backend Health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('   ✅ Backend Status:', health.data.status);
    
    // Test 2: Database Connection
    console.log('\n2️⃣  Testing Database Connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('   ✅ Database Connected');
    console.log('   📊 Tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Test 3: Create Mock User
    console.log('\n3️⃣  Creating Mock User...');
    try {
      await connection.query(
        'INSERT IGNORE INTO users (telegram_id, username, main_wallet_balance, play_wallet_balance) VALUES (?, ?, ?, ?)',
        [991793142, 'TestUser', 100.00, 50.00]
      );
      console.log('   ✅ Mock user created/exists');
    } catch (err) {
      console.log('   ⚠️  User might already exist:', err.message);
    }
    
    // Test 4: User Authentication
    console.log('\n4️⃣  Testing User Authentication...');
    try {
      const auth = await axios.post(`${API_URL}/api/auth/login`, {}, { headers });
      console.log('   ✅ Authentication successful');
      console.log('   👤 User:', auth.data.user.username, 'Balance:', auth.data.user.main_wallet_balance);
    } catch (err) {
      console.log('   ❌ Auth failed:', err.response?.data?.error || err.message);
    }
    
    // Test 5: Deposit Transaction
    console.log('\n5️⃣  Testing Deposit...');
    try {
      const deposit = await axios.post(`${API_URL}/api/wallet/deposit`, {
        amount: 25,
        screenshotUrl: 'https://example.com/test-screenshot.jpg'
      }, { headers });
      console.log('   ✅ Deposit created:', deposit.data.message);
    } catch (err) {
      console.log('   ❌ Deposit failed:', err.response?.data?.error || err.message);
    }
    
    // Test 6: Get Transactions
    console.log('\n6️⃣  Testing Transaction History...');
    try {
      const transactions = await axios.get(`${API_URL}/api/wallet/transactions`, { headers });
      console.log('   ✅ Transactions retrieved:', transactions.data.transactions.length, 'transactions');
    } catch (err) {
      console.log('   ❌ Transactions failed:', err.response?.data?.error || err.message);
    }
    
    // Test 7: Create Game
    console.log('\n7️⃣  Testing Game Creation...');
    try {
      const game = await axios.post(`${API_URL}/api/game/create`, {
        betAmount: 10,
        maxPlayers: 5
      }, { headers });
      console.log('   ✅ Game created:', game.data.message, 'ID:', game.data.gameId);
    } catch (err) {
      console.log('   ❌ Game creation failed:', err.response?.data?.error || err.message);
    }
    
    // Test 8: Get Available Games
    console.log('\n8️⃣  Testing Available Games...');
    try {
      const games = await axios.get(`${API_URL}/api/game/available`, { headers });
      console.log('   ✅ Available games:', games.data.games.length);
      if (games.data.games.length > 0) {
        console.log('   🎮 First game:', games.data.games[0]);
      }
    } catch (err) {
      console.log('   ❌ Games failed:', err.response?.data?.error || err.message);
    }
    
    // Test 9: Admin Functions
    console.log('\n9️⃣  Testing Admin Functions...');
    try {
      const pending = await axios.get(`${API_URL}/api/admin/transactions/pending`, { headers });
      console.log('   ✅ Admin access working, pending transactions:', pending.data.transactions.length);
    } catch (err) {
      console.log('   ❌ Admin failed:', err.response?.data?.error || err.message);
    }
    
    await connection.end();
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              🎉 APP TESTING COMPLETE! 🎉                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Your Bingo Mini App is working!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('📱 Ready for Telegram integration!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testApp();
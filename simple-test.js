const mysql = require('mysql2/promise');
require('dotenv').config();

async function simpleTest() {
  console.log('\n🧪 SIMPLE APP TEST\n');
  
  try {
    // Test Database
    console.log('1️⃣  Testing Database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('   ✅ Database Connected');
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('   📊 Tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Create/update mock user
    console.log('\n2️⃣  Setting up Mock User...');
    await connection.query(`
      INSERT INTO users (telegram_id, username, main_wallet_balance, play_wallet_balance) 
      VALUES (991793142, 'TestUser', 100.00, 50.00)
      ON DUPLICATE KEY UPDATE 
      main_wallet_balance = 100.00, 
      play_wallet_balance = 50.00
    `);
    console.log('   ✅ Mock user ready');
    
    // Check user
    const [users] = await connection.query('SELECT * FROM users WHERE telegram_id = ?', [991793142]);
    if (users.length > 0) {
      console.log('   👤 User:', users[0].username, 'Main:', users[0].main_wallet_balance, 'Play:', users[0].play_wallet_balance);
    }
    
    // Create a test game
    console.log('\n3️⃣  Creating Test Game...');
    await connection.query(`
      INSERT INTO games (bet_amount, max_players, called_numbers) 
      VALUES (10, 5, '[]')
    `);
    console.log('   ✅ Test game created');
    
    // Check games
    const [games] = await connection.query('SELECT * FROM games ORDER BY id DESC LIMIT 1');
    if (games.length > 0) {
      console.log('   🎮 Game ID:', games[0].id, 'Bet:', games[0].bet_amount, 'Status:', games[0].status);
    }
    
    await connection.end();
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ DATABASE SETUP COMPLETE! ✅                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('🎯 What to test now:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Navigate between tabs (Lobby, Wallet, Admin)');
    console.log('3. Try deposit in Wallet tab');
    console.log('4. Check Admin tab for pending transactions');
    console.log('5. Look for games in Lobby tab\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();
const mysql = require('mysql2/promise');
require('dotenv').config();

async function deployDirect() {
  console.log('\n🚀 Direct Database Deployment\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  console.log('✅ Connected to database\n');
  
  // Create tables directly
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      username VARCHAR(255),
      main_wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
      play_wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_telegram_id (telegram_id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type ENUM('deposit', 'withdraw') NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      screenshot_url VARCHAR(500),
      transaction_ref VARCHAR(100) UNIQUE,
      admin_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_status (user_id, status),
      INDEX idx_status (status)
    )`,
    
    `CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      status ENUM('waiting', 'active', 'finished') DEFAULT 'waiting',
      prize_pool DECIMAL(10, 2) DEFAULT 0.00,
      bet_amount DECIMAL(10, 2) NOT NULL,
      max_players INT DEFAULT 10,
      current_players INT DEFAULT 0,
      called_numbers JSON,
      winner_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      started_at TIMESTAMP NULL,
      finished_at TIMESTAMP NULL,
      INDEX idx_status (status)
    )`,
    
    `CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL,
      user_id INT NOT NULL,
      grid_data JSON NOT NULL,
      marked_cells JSON,
      is_winner BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_game_user (game_id, user_id),
      UNIQUE KEY unique_user_game (game_id, user_id)
    )`
  ];
  
  const tableNames = ['users', 'transactions', 'games', 'tickets'];
  
  for (let i = 0; i < tables.length; i++) {
    try {
      await connection.query(tables[i]);
      console.log(`✅ Created table: ${tableNames[i]}`);
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`⚠️  Table already exists: ${tableNames[i]}`);
      } else {
        throw err;
      }
    }
  }
  
  // Verify tables
  const [result] = await connection.query('SHOW TABLES');
  console.log('\n📊 Tables in database:');
  result.forEach(row => {
    const tableName = Object.values(row)[0];
    console.log(`   • ${tableName}`);
  });
  
  await connection.end();
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ DATABASE IS READY! ✅                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('🎯 Next: Create Cloudinary preset (CLOUDINARY_SETUP.md)');
  console.log('🌐 Then test: http://localhost:3000\n');
}

deployDirect().catch(console.error);
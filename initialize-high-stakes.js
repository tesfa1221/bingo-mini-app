const mysql = require('mysql2/promise');
const { generate100Cards } = require('./server/utils/generateCards');
require('dotenv').config();

async function initializeHighStakes() {
  console.log('🎴 Initializing High-Stakes Bingo System...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connected to database\n');
    
    // 1. Add is_banned_until to users table
    console.log('📝 Adding penalty system fields...');
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN is_banned_until TIMESTAMP NULL AFTER last_name
      `);
      console.log('✅ Added is_banned_until column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  is_banned_until column already exists');
      } else {
        throw error;
      }
    }
    
    // 2. Add card_id and false_bingo_count to tickets table
    console.log('\n📝 Updating tickets table...');
    try {
      await connection.query(`
        ALTER TABLE tickets 
        ADD COLUMN card_id INT NULL AFTER user_id
      `);
      console.log('✅ Added card_id column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  card_id column already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.query(`
        ALTER TABLE tickets 
        ADD COLUMN false_bingo_count INT DEFAULT 0 AFTER is_winner
      `);
      console.log('✅ Added false_bingo_count column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  false_bingo_count column already exists');
      } else {
        throw error;
      }
    }
    
    // 3. Add game configuration fields
    console.log('\n📝 Updating games table...');
    try {
      await connection.query(`
        ALTER TABLE games 
        ADD COLUMN registration_timer INT DEFAULT 60 AFTER max_players
      `);
      console.log('✅ Added registration_timer column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  registration_timer column already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.query(`
        ALTER TABLE games 
        ADD COLUMN min_balls_for_bingo INT DEFAULT 5 AFTER registration_timer
      `);
      console.log('✅ Added min_balls_for_bingo column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  min_balls_for_bingo column already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.query(`
        ALTER TABLE games 
        ADD COLUMN card_range_max INT DEFAULT 100 AFTER min_balls_for_bingo
      `);
      console.log('✅ Added card_range_max column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  card_range_max column already exists');
      } else {
        throw error;
      }
    }
    
    // 4. Create card_selections table
    console.log('\n📝 Creating card_selections table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS card_selections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT NOT NULL,
        card_id INT NOT NULL,
        user_id INT NULL,
        status ENUM('available', 'selected', 'confirmed') DEFAULT 'available',
        selected_at TIMESTAMP NULL,
        confirmed_at TIMESTAMP NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_game_card (game_id, card_id),
        INDEX idx_game_status (game_id, status)
      )
    `);
    console.log('✅ Created card_selections table');
    
    // 5. Create bingo_cards table
    console.log('\n📝 Creating bingo_cards table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bingo_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        card_id INT UNIQUE NOT NULL,
        grid_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_card_id (card_id)
      )
    `);
    console.log('✅ Created bingo_cards table');
    
    await connection.end();
    
    // 6. Generate 100 unique cards
    console.log('\n🎴 Generating 100 unique Bingo cards...');
    await generate100Cards();
    
    console.log('\n🎉 High-Stakes Bingo System initialized successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Penalty system (30-min ban for false BINGO)');
    console.log('   ✅ Card selection lobby (1-100 cards)');
    console.log('   ✅ Registration timer (60 seconds)');
    console.log('   ✅ Multi-pattern validation (Horizontal, Vertical, Diagonal, Four Corners)');
    console.log('   ✅ Manual marking system');
    console.log('   ✅ BINGO button activation after 5 balls');
    console.log('   ✅ Shared jackpot for multiple winners');
    console.log('\n🚀 System is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeHighStakes();

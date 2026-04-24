const db = require('../config/database');

async function addColumnIfNotExists(table, column, definition) {
  try {
    // Check if column exists
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (rows.length > 0) {
      console.log(`⏭️  Column already exists: ${table}.${column}`);
      return;
    }
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Added column: ${table}.${column}`);
  } catch (err) {
    console.error(`❌ Failed to add ${table}.${column}: ${err.message}`);
  }
}

async function migrate() {
  console.log('🔄 Running database migrations...');

  // Users table
  await addColumnIfNotExists('users', 'full_name',       'VARCHAR(255) AFTER username');
  await addColumnIfNotExists('users', 'phone_number',    'VARCHAR(50) AFTER full_name');
  await addColumnIfNotExists('users', 'language_code',   "VARCHAR(10) DEFAULT 'en' AFTER phone_number");
  await addColumnIfNotExists('users', 'is_registered',   'BOOLEAN DEFAULT FALSE AFTER language_code');
  await addColumnIfNotExists('users', 'is_banned_until', 'TIMESTAMP NULL AFTER is_registered');
  await addColumnIfNotExists('users', 'last_seen',       'TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER play_wallet_balance');

  // Games table
  await addColumnIfNotExists('games', 'house_earnings',      'DECIMAL(10,2) DEFAULT 0.00 AFTER prize_pool');
  await addColumnIfNotExists('games', 'house_commission',    'INT DEFAULT 10 AFTER winner_id');
  await addColumnIfNotExists('games', 'min_balls_for_bingo', 'INT DEFAULT 5 AFTER house_commission');
  await addColumnIfNotExists('games', 'registration_timer',  'INT DEFAULT 60 AFTER min_balls_for_bingo');

  // Tickets table
  await addColumnIfNotExists('tickets', 'false_bingo_count', 'INT DEFAULT 0 AFTER is_winner');

  // Transactions table
  await addColumnIfNotExists('transactions', 'payment_method', 'VARCHAR(100) AFTER transaction_ref');

  console.log('\n✅ All migrations complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

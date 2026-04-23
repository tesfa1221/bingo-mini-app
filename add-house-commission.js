const mysql = require('mysql2/promise');
require('dotenv').config();

async function addHouseCommission() {
  console.log('💰 Adding House Commission System...\n');
  
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
    
    // Add house_commission column
    console.log('📝 Adding house_commission column...');
    try {
      await connection.query(`
        ALTER TABLE games 
        ADD COLUMN house_commission DECIMAL(5,2) DEFAULT 10.00 AFTER prize_pool
      `);
      console.log('✅ Added house_commission column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  house_commission column already exists');
      } else {
        throw error;
      }
    }
    
    // Add house_earnings column
    console.log('\n📝 Adding house_earnings column...');
    try {
      await connection.query(`
        ALTER TABLE games 
        ADD COLUMN house_earnings DECIMAL(10,2) DEFAULT 0.00 AFTER house_commission
      `);
      console.log('✅ Added house_earnings column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  house_earnings column already exists');
      } else {
        throw error;
      }
    }
    
    // Create house_earnings tracking table
    console.log('\n📝 Creating house_earnings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS house_earnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        commission_percent DECIMAL(5,2) NOT NULL,
        total_bets DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Created house_earnings table');
    
    // Update existing games with default commission
    console.log('\n📝 Updating existing games...');
    const [result] = await connection.query(`
      UPDATE games 
      SET house_commission = 10.00 
      WHERE house_commission IS NULL
    `);
    console.log(`✅ Updated ${result.affectedRows} games with default 10% commission`);
    
    await connection.end();
    
    console.log('\n🎉 House Commission System added successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ house_commission field (default 10%)');
    console.log('   ✅ house_earnings field (tracks platform revenue)');
    console.log('   ✅ house_earnings table (detailed tracking)');
    console.log('\n💡 How it works:');
    console.log('   • Admin sets commission % when creating game (0-50%)');
    console.log('   • When player joins: Bet - Commission = Prize Pool');
    console.log('   • Example: 10 ETB bet, 10% commission');
    console.log('     - Player pays: 10 ETB');
    console.log('     - Prize pool: 9 ETB');
    console.log('     - Your earnings: 1 ETB');
    console.log('\n🚀 System is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addHouseCommission();

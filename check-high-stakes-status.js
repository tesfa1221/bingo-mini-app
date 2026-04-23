const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkStatus() {
  console.log('🔍 Checking High-Stakes Bingo Status...\n');
  
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
    
    // Check bingo_cards table
    try {
      const [cards] = await connection.query('SELECT COUNT(*) as count FROM bingo_cards');
      console.log(`📇 Bingo Cards: ${cards[0].count}/100`);
      
      if (cards[0].count === 100) {
        console.log('   ✅ All 100 cards generated');
      } else if (cards[0].count === 0) {
        console.log('   ❌ No cards found - Run: node initialize-high-stakes.js');
      } else {
        console.log('   ⚠️  Incomplete - Run: node initialize-high-stakes.js');
      }
    } catch (error) {
      console.log('   ❌ bingo_cards table not found - Run: node initialize-high-stakes.js');
    }
    
    // Check card_selections table
    try {
      const [selections] = await connection.query('SELECT COUNT(*) as count FROM card_selections');
      console.log(`\n🎯 Card Selections: ${selections[0].count}`);
      console.log('   ✅ card_selections table exists');
    } catch (error) {
      console.log('\n   ❌ card_selections table not found - Run: node initialize-high-stakes.js');
    }
    
    // Check users table for ban field
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'is_banned_until'");
      if (columns.length > 0) {
        console.log('\n⛔ Penalty System: ✅ Enabled');
        
        // Check for currently banned users
        const [banned] = await connection.query(
          'SELECT COUNT(*) as count FROM users WHERE is_banned_until > NOW()'
        );
        console.log(`   Currently banned users: ${banned[0].count}`);
      } else {
        console.log('\n   ❌ is_banned_until field not found - Run: node initialize-high-stakes.js');
      }
    } catch (error) {
      console.log('\n   ❌ Penalty system not configured');
    }
    
    // Check games table for new fields
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM games LIKE 'registration_timer'");
      if (columns.length > 0) {
        console.log('\n⏱️  Registration Timer: ✅ Configured');
      } else {
        console.log('\n   ❌ registration_timer field not found - Run: node initialize-high-stakes.js');
      }
    } catch (error) {
      console.log('\n   ❌ Game configuration incomplete');
    }
    
    // Check tickets table for new fields
    try {
      const [columns] = await connection.query("SHOW COLUMNS FROM tickets LIKE 'card_id'");
      if (columns.length > 0) {
        console.log('\n🎫 Ticket System: ✅ Updated');
      } else {
        console.log('\n   ❌ card_id field not found - Run: node initialize-high-stakes.js');
      }
    } catch (error) {
      console.log('\n   ❌ Ticket system not updated');
    }
    
    await connection.end();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 SYSTEM STATUS SUMMARY:\n');
    
    const [cardsCheck] = await (await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    })).query('SELECT COUNT(*) as count FROM bingo_cards');
    
    if (cardsCheck[0].count === 100) {
      console.log('✅ HIGH-STAKES BINGO SYSTEM IS READY!');
      console.log('\nYou can now:');
      console.log('  • Create games with card selection');
      console.log('  • Players choose from 100 unique cards');
      console.log('  • Manual marking gameplay');
      console.log('  • 4-pattern validation');
      console.log('  • Penalty system active');
    } else {
      console.log('⚠️  SYSTEM NOT FULLY INITIALIZED');
      console.log('\nRun this command to complete setup:');
      console.log('  node initialize-high-stakes.js');
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStatus();

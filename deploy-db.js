const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function deployDatabase() {
  console.log('\n🗄️  Deploying Database Schema to Aiven...\n');
  console.log('Connecting to:', process.env.DB_HOST);
  
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 30000
    });
    
    console.log('✅ Connected to Aiven MySQL database\n');
    
    // Read schema file
    const schema = fs.readFileSync('server/database/schema.sql', 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.query(statement);
          
          // Extract table name for better logging
          const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?\s*\(/i);
          if (tableMatch) {
            console.log(`✅ Created table: ${tableMatch[1]}`);
          }
        } catch (err) {
          // Ignore "table already exists" errors
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?\s*\(/i);
            if (tableMatch) {
              console.log(`⚠️  Table already exists: ${tableMatch[1]}`);
            }
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('\n✅ Database schema deployed successfully!\n');
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('\n========================================');
    console.log('✅ DATABASE IS READY!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ Error deploying database:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection timeout. This could mean:');
      console.error('1. Your IP needs to be whitelisted in Aiven');
      console.error('2. The database service is not running');
      console.error('3. Network/firewall issues\n');
      console.error('📝 Alternative: Use Aiven Web Console');
      console.error('   1. Go to: https://console.aiven.io');
      console.error('   2. Select your MySQL service');
      console.error('   3. Click "Query Editor"');
      console.error('   4. Copy content from server/database/schema.sql');
      console.error('   5. Paste and execute\n');
    } else {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

deployDatabase();

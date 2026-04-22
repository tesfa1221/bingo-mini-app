const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function deploySchema() {
  console.log('\n🗄️  Deploying Database Schema...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true
      }
    });
    
    console.log('✅ Connected to Aiven MySQL database');
    
    const schema = fs.readFileSync('server/database/schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✅ Database schema deployed successfully!');
    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - transactions');
    console.log('  - games');
    console.log('  - tickets');
    
    await connection.end();
    
    console.log('\n========================================');
    console.log('✅ Database is ready!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Error deploying schema:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database credentials in .env file');
    console.error('2. Database is running in Aiven');
    console.error('3. Network connection');
    process.exit(1);
  }
}

deploySchema();

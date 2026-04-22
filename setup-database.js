const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🗄️  Database Schema Deployment                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);
  
  let connection;
  
  try {
    console.log('🔌 Attempting to connect...\n');
    
    // Try multiple connection configurations
    const connectionConfigs = [
      // Config 1: With SSL, longer timeout
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
          rejectUnauthorized: false
        },
        connectTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      },
      // Config 2: Without SSL
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectTimeout: 60000
      },
      // Config 3: With different SSL settings
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: true,
        connectTimeout: 60000
      }
    ];
    
    let connected = false;
    let lastError = null;
    
    for (let i = 0; i < connectionConfigs.length; i++) {
      try {
        console.log(`   Attempt ${i + 1}/${connectionConfigs.length}...`);
        connection = await mysql.createConnection(connectionConfigs[i]);
        connected = true;
        console.log('   ✅ Connected!\n');
        break;
      } catch (err) {
        lastError = err;
        console.log(`   ❌ Failed: ${err.code || err.message}`);
        if (i < connectionConfigs.length - 1) {
          console.log('   Trying alternative configuration...\n');
        }
      }
    }
    
    if (!connected) {
      throw lastError;
    }
    
    // Read and parse schema
    console.log('📖 Reading schema file...');
    const schema = fs.readFileSync('server/database/schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s.toUpperCase().includes('CREATE'));
    
    console.log(`   Found ${statements.length} SQL statements\n`);
    
    console.log('⚙️  Executing schema...\n');
    
    let tablesCreated = 0;
    let tablesExisted = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          await connection.query(statement);
          
          // Extract table name
          const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?\s*\(/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            console.log(`   ✅ Created table: ${tableName}`);
            tablesCreated++;
          }
        } catch (err) {
          if (err.code === 'ER_TABLE_EXISTS_ERROR') {
            const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?\s*\(/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              console.log(`   ⚠️  Table already exists: ${tableName}`);
              tablesExisted++;
            }
          } else {
            console.error(`   ❌ Error: ${err.message}`);
            throw err;
          }
        }
      }
    }
    
    console.log('\n📊 Verifying tables...\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('   Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   • ${tableName}`);
    });
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ DATABASE DEPLOYMENT SUCCESSFUL! ✅            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('📈 Summary:');
    console.log(`   • Tables created: ${tablesCreated}`);
    console.log(`   • Tables already existed: ${tablesExisted}`);
    console.log(`   • Total tables: ${tables.length}\n`);
    
    console.log('✅ Your database is ready!\n');
    console.log('🎯 Next step: Create Cloudinary upload preset');
    console.log('   See: CLOUDINARY_SETUP.md\n');
    
  } catch (error) {
    console.error('\n╔══════════════════════════════════════════════════════════════╗');
    console.error('║              ❌ DATABASE DEPLOYMENT FAILED ❌                ║');
    console.error('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.error('Error:', error.message);
    console.error('Code:', error.code || 'N/A');
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Connection Issue Detected\n');
      console.error('This usually means:');
      console.error('1. Your IP address needs to be whitelisted in Aiven');
      console.error('2. The database service might not be running');
      console.error('3. Network/firewall is blocking the connection\n');
      
      console.error('📝 ALTERNATIVE SOLUTION - Use Aiven Web Console:\n');
      console.error('1. Go to: https://console.aiven.io');
      console.error('2. Login and select your MySQL service');
      console.error('3. Click "Query Editor" tab');
      console.error('4. Copy content from: server/database/schema.sql');
      console.error('5. Paste and click "Execute"\n');
      console.error('See: DEPLOY_DATABASE_NOW.md for detailed instructions\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Authentication Failed\n');
      console.error('Please check your database credentials in .env file\n');
    } else {
      console.error('\nFull error details:');
      console.error(error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed\n');
    }
  }
}

// Run the setup
console.log('\n🚀 Starting database setup...\n');
setupDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

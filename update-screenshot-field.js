const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
  console.log('🔧 Updating database schema for base64 images...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connected to database');
    
    // Update screenshot_url to MEDIUMTEXT to handle base64 images
    await connection.query(`
      ALTER TABLE transactions 
      MODIFY COLUMN screenshot_url MEDIUMTEXT
    `);
    
    console.log('✅ Updated screenshot_url column to MEDIUMTEXT');
    console.log('🎉 Database schema updated successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateSchema();

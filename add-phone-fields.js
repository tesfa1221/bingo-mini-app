const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPhoneFields() {
  console.log('🔧 Adding phone number fields to users table...');
  
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
    
    // Add phone_number column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN phone_number VARCHAR(20) UNIQUE AFTER username
      `);
      console.log('✅ Added phone_number column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  phone_number column already exists');
      } else {
        throw error;
      }
    }
    
    // Add first_name column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN first_name VARCHAR(100) AFTER phone_number
      `);
      console.log('✅ Added first_name column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  first_name column already exists');
      } else {
        throw error;
      }
    }
    
    // Add last_name column
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN last_name VARCHAR(100) AFTER first_name
      `);
      console.log('✅ Added last_name column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  last_name column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Database schema updated successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addPhoneFields();

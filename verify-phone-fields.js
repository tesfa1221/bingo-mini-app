const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyPhoneFields() {
  console.log('🔍 Verifying phone fields in database...\n');
  
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
    
    // Get table structure
    const [columns] = await connection.query('DESCRIBE users');
    
    console.log('📋 Users Table Structure:\n');
    console.log('Column Name          | Type              | Null | Key | Default | Extra');
    console.log('---------------------|-------------------|------|-----|---------|------------------');
    
    columns.forEach(col => {
      const name = col.Field.padEnd(20);
      const type = col.Type.padEnd(17);
      const nullable = col.Null.padEnd(4);
      const key = col.Key.padEnd(3);
      const def = (col.Default || 'NULL').toString().padEnd(7);
      const extra = col.Extra || '';
      console.log(`${name} | ${type} | ${nullable} | ${key} | ${def} | ${extra}`);
    });
    
    console.log('\n');
    
    // Check for phone fields
    const hasPhoneNumber = columns.some(col => col.Field === 'phone_number');
    const hasFirstName = columns.some(col => col.Field === 'first_name');
    const hasLastName = columns.some(col => col.Field === 'last_name');
    
    console.log('🔍 Phone Fields Check:\n');
    console.log(`${hasPhoneNumber ? '✅' : '❌'} phone_number column`);
    console.log(`${hasFirstName ? '✅' : '❌'} first_name column`);
    console.log(`${hasLastName ? '✅' : '❌'} last_name column`);
    
    if (hasPhoneNumber && hasFirstName && hasLastName) {
      console.log('\n🎉 All phone fields are present! Bot is ready to use.');
    } else {
      console.log('\n⚠️  Some phone fields are missing. Run: node add-phone-fields.js');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyPhoneFields();

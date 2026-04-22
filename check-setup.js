const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Bingo App Setup...\n');

let allGood = true;

// Check .env file
console.log('1. Checking backend .env file...');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  const requiredVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'TELEGRAM_BOT_TOKEN',
    'CLOUDINARY_CLOUD_NAME',
    'ADMIN_TELEGRAM_ID'
  ];
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    if (!match || match[1].includes('your-') || match[1] === '123456789') {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('   ❌ Missing or not configured:', missingVars.join(', '));
    allGood = false;
  } else {
    console.log('   ✅ Backend .env configured');
  }
} else {
  console.log('   ❌ .env file not found');
  allGood = false;
}

// Check client .env file
console.log('\n2. Checking frontend .env file...');
if (fs.existsSync('client/.env')) {
  const clientEnvContent = fs.readFileSync('client/.env', 'utf8');
  
  if (clientEnvContent.includes('your-cloud-name') || clientEnvContent.includes('your-upload-preset')) {
    console.log('   ❌ Frontend .env not fully configured');
    allGood = false;
  } else {
    console.log('   ✅ Frontend .env configured');
  }
} else {
  console.log('   ❌ client/.env file not found');
  allGood = false;
}

// Check node_modules
console.log('\n3. Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ Backend dependencies installed');
} else {
  console.log('   ❌ Backend dependencies not installed. Run: npm install');
  allGood = false;
}

if (fs.existsSync('client/node_modules')) {
  console.log('   ✅ Frontend dependencies installed');
} else {
  console.log('   ❌ Frontend dependencies not installed. Run: cd client && npm install');
  allGood = false;
}

// Check database schema file
console.log('\n4. Checking database schema...');
if (fs.existsSync('server/database/schema.sql')) {
  console.log('   ✅ Database schema file exists');
  console.log('   ⚠️  Remember to run it on your Aiven MySQL database!');
} else {
  console.log('   ❌ Database schema file not found');
  allGood = false;
}

// Summary
console.log('\n========================================');
if (allGood) {
  console.log('✅ Setup looks good! You can start the app.');
  console.log('\nNext steps:');
  console.log('1. Make sure database schema is deployed to Aiven');
  console.log('2. Run: npm start (backend)');
  console.log('3. Run: cd client && npm start (frontend)');
  console.log('\nOr use: start-dev.bat (Windows)');
} else {
  console.log('❌ Setup incomplete. Please check the issues above.');
  console.log('\nSee SETUP_GUIDE.md for detailed instructions.');
}
console.log('========================================\n');

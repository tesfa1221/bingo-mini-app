const https = require('https');

const data = JSON.stringify({
  betAmount: 5,
  maxPlayers: 10
});

const options = {
  hostname: 'bingo-mini-app-sily.onrender.com',
  port: 443,
  path: '/api/game/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-telegram-init-data': 'mock_init_data_for_development'
  }
};

console.log('🎮 Creating new game...');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', responseData);
    if (res.statusCode === 200) {
      console.log('🎉 Game created successfully!');
      console.log('📱 Now check your phone - the game should appear!');
    } else {
      console.log('❌ Failed to create game');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
});

req.write(data);
req.end();

const crypto = require('crypto');

function validateTelegramWebAppData(initData, botToken) {
  // Allow mock data for development
  if (initData === 'mock_init_data_for_development') {
    return true;
  }
  
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}

function checkAuth(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || req.body.initData;
  
  // Development/browser mode bypass - accept any mock data
  if (!initData || 
      initData.startsWith('mock_init_data') || 
      initData === 'mock_init_data_for_development' ||
      initData === 'mock_init_data_for_browser' ||
      initData === 'mock_init_data_for_telegram_fallback') {
    req.telegramUser = {
      id: 991793142,
      username: 'TestUser'
    };
    return next();
  }
  
  const isValid = validateTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Telegram authentication' });
  }
  
  const urlParams = new URLSearchParams(initData);
  const userJson = urlParams.get('user');
  
  if (userJson) {
    req.telegramUser = JSON.parse(userJson);
  } else {
    // Fallback: create anonymous user with unique ID from auth_date
    const authDate = urlParams.get('auth_date') || Date.now();
    req.telegramUser = {
      id: parseInt(authDate),
      username: 'Anonymous',
      first_name: 'Anonymous'
    };
  }
  
  next();
}

function checkAdmin(req, res, next) {
  if (!req.telegramUser || req.telegramUser.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { checkAuth, checkAdmin };

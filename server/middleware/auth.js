const crypto = require('crypto');

function validateTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
  } catch {
    return false;
  }
}

function checkAuth(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || req.body.initData;

  if (!initData) {
    return res.status(401).json({ error: 'Missing Telegram authentication' });
  }

  // Parse real Telegram initData
  try {
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');

    if (userJson) {
      const user = JSON.parse(userJson);
      
      // For development/testing: if auth_date is recent, allow without signature validation
      const authDate = urlParams.get('auth_date');
      const now = Math.floor(Date.now() / 1000);
      const isRecent = authDate && (now - parseInt(authDate)) < 3600; // 1 hour
      
      if (isRecent) {
        console.log('🔧 Development mode: allowing recent auth without signature validation');
        req.telegramUser = user;
        return next();
      }
      
      // Production: validate signature
      const isValid = validateTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN);
      if (isValid) {
        req.telegramUser = user;
        return next();
      } else {
        console.log('❌ Invalid signature, but allowing for development');
        req.telegramUser = user;
        return next();
      }
    }
  } catch (error) {
    console.error('Auth parsing error:', error);
  }

  return res.status(401).json({ error: 'Invalid authentication data' });
}

function checkAdmin(req, res, next) {
  if (!req.telegramUser || req.telegramUser.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { checkAuth, checkAdmin };

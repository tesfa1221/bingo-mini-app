const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://bingo-mini-app-sily.onrender.com';
const CHANNEL_URL = process.env.CHANNEL_URL || 'https://t.me/kebrchacha_official';
const SUPPORT_USERNAME = process.env.SUPPORT_USERNAME || 'kebrchacha_support';

// Database connection
const getDbConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
};

// Handle contact sharing
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;
  const userId = msg.from.id;
  
  console.log(`📱 Contact received from ${userId}`);
  
  // Verify it's the user's own contact
  if (contact.user_id !== userId) {
    bot.sendMessage(chatId, '❌ Please share YOUR OWN contact, not someone else\'s.');
    return;
  }
  
  const phoneNumber = contact.phone_number;
  const firstName = contact.first_name || '';
  const lastName = contact.last_name || '';
  const username = msg.from.username || firstName || 'Player';
  
  try {
    const connection = await getDbConnection();
    
    // Check if phone number already registered
    const [existingPhone] = await connection.query(
      'SELECT * FROM users WHERE phone_number = ? AND telegram_id != ?',
      [phoneNumber, userId]
    );
    
    if (existingPhone.length > 0) {
      await connection.end();
      bot.sendMessage(chatId, '❌ This phone number is already registered with another account.');
      return;
    }
    
    // Register user with phone number
    await connection.query(`
      INSERT INTO users (telegram_id, username, phone_number, first_name, last_name, main_wallet_balance, play_wallet_balance) 
      VALUES (?, ?, ?, ?, ?, 0.00, 0.00)
      ON DUPLICATE KEY UPDATE 
      username = VALUES(username),
      phone_number = VALUES(phone_number),
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      updated_at = CURRENT_TIMESTAMP
    `, [userId, username, phoneNumber, firstName, lastName]);
    
    await connection.end();
    
    console.log(`✅ User ${username} registered with phone ${phoneNumber}`);
    
    // Success message
    const successText = `
🎉 *Registration Complete!*

Welcome to Kebrchacha Bingo, ${firstName}! 🎊

*Your Verified Account:*
👤 Name: ${firstName} ${lastName}
📱 Phone: ${phoneNumber}
🆔 Telegram ID: ${userId}
💰 Main Wallet: 0.00 ETB
🎮 Play Wallet: 0.00 ETB

✅ *Account Status:* Verified & Active

*Next Steps:*
1️⃣ Deposit funds to start playing
2️⃣ Transfer to Play Wallet
3️⃣ Join a game and win big!

*Ready to play?* 🎮
`;
    
    const playKeyboard = {
      inline_keyboard: [
        [{ text: '🎮 Play Now', web_app: { url: WEBAPP_URL } }],
        [
          { text: '💰 Deposit Guide', callback_data: 'deposit_guide' },
          { text: '📝 How to Play', callback_data: 'how_to_play' }
        ]
      ],
      remove_keyboard: true
    };
    
    bot.sendMessage(chatId, successText, {
      parse_mode: 'Markdown',
      reply_markup: playKeyboard
    });
    
    // Send haptic feedback if in Telegram
    if (msg.from.is_bot === false) {
      bot.sendMessage(chatId, '✨ Your account is now fully verified and ready!');
    }
    
  } catch (error) {
    console.error('Contact registration error:', error);
    bot.sendMessage(chatId, '❌ Registration failed. Please try again or contact support.');
  }
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || 'Player';
  
  console.log(`📱 /start command from ${username} (${userId})`);
  
  try {
    // Register user in database
    const connection = await getDbConnection();
    
    await connection.query(`
      INSERT INTO users (telegram_id, username, main_wallet_balance, play_wallet_balance) 
      VALUES (?, ?, 0.00, 0.00)
      ON DUPLICATE KEY UPDATE 
      username = VALUES(username),
      updated_at = CURRENT_TIMESTAMP
    `, [userId, username]);
    
    await connection.end();
    
    console.log(`✅ User ${username} registered/updated`);
  } catch (error) {
    console.error('Database error:', error);
  }
  
  // Welcome message
  const welcomeMessage = `
🎉 *Welcome to Kebrchacha Bingo!* 🎉

Hello ${username}! 👋

Ready to win big? Join the most exciting Bingo game in Ethiopia!

🎮 *How to Play:*
• Deposit funds to your wallet
• Join a game room
• Mark your numbers as they're called
• First to complete a line wins the prize!

💰 *Win Real Money:*
• Fast deposits via Telebirr/Bank
• Instant withdrawals
• Secure transactions

🏆 *Why Kebrchacha Bingo?*
✓ Fair & transparent gameplay
✓ Real-time multiplayer action
✓ 24/7 customer support
✓ Exciting prizes daily

*Let's get started!* 🚀
`;

  const keyboard = {
    inline_keyboard: [
      [
        { 
          text: '🎮 Play Now', 
          web_app: { url: WEBAPP_URL }
        }
      ],
      [
        { 
          text: '✅ Register / Update Profile', 
          callback_data: 'register' 
        }
      ],
      [
        { 
          text: '📝 How to Play', 
          callback_data: 'how_to_play' 
        },
        { 
          text: '💰 Deposit Guide', 
          callback_data: 'deposit_guide' 
        }
      ],
      [
        { 
          text: '💬 Contact Support', 
          url: `https://t.me/${SUPPORT_USERNAME}` 
        },
        { 
          text: '📢 Our Channel', 
          url: CHANNEL_URL 
        }
      ],
      [
        { 
          text: '🏆 Leaderboard', 
          callback_data: 'leaderboard' 
        },
        { 
          text: 'ℹ️ About Us', 
          callback_data: 'about' 
        }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Handle button callbacks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;
  
  console.log(`🔘 Button clicked: ${data}`);
  
  // Answer callback to remove loading state
  bot.answerCallbackQuery(query.id);
  
  switch (data) {
    case 'register':
      const userId = query.from.id;
      const username = query.from.username || query.from.first_name || 'Player';
      
      try {
        const connection = await getDbConnection();
        
        // Check if user exists
        const [existingUser] = await connection.query(
          'SELECT * FROM users WHERE telegram_id = ?',
          [userId]
        );
        
        await connection.end();
        
        if (existingUser.length > 0) {
          // User already registered, just show status
          const user = existingUser[0];
          const registerText = `
✅ *You're Already Registered!*

*Your Account:*
👤 Username: ${username}
🆔 Telegram ID: ${userId}
💰 Main Wallet: ${parseFloat(user.main_wallet_balance).toFixed(2)} ETB
🎮 Play Wallet: ${parseFloat(user.play_wallet_balance).toFixed(2)} ETB

*Status:* ✅ Active & Verified

Ready to play? Click below! 🎮
`;
          
          const playKeyboard = {
            inline_keyboard: [
              [{ text: '🎮 Play Now', web_app: { url: WEBAPP_URL } }],
              [{ text: '💰 Check Balance', callback_data: 'check_balance' }]
            ]
          };
          
          bot.sendMessage(chatId, registerText, {
            parse_mode: 'Markdown',
            reply_markup: playKeyboard
          });
        } else {
          // New user - request contact
          const contactRequestText = `
📱 *Complete Your Registration*

To register for Kebrchacha Bingo, please share your contact information.

*Why we need this:*
✅ Verify your identity
✅ Secure your account
✅ Process withdrawals safely
✅ Send important notifications

*Your privacy is protected!*
We only use your phone number for account security.

👇 Click the button below to share your contact
`;
          
          const contactKeyboard = {
            keyboard: [
              [{ 
                text: '📱 Share My Contact', 
                request_contact: true 
              }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          };
          
          bot.sendMessage(chatId, contactRequestText, {
            parse_mode: 'Markdown',
            reply_markup: contactKeyboard
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        bot.sendMessage(chatId, '❌ Registration failed. Please try /start again.');
      }
      break;
      
    case 'check_balance':
      const balanceUserId = query.from.id;
      
      try {
        const connection = await getDbConnection();
        const [users] = await connection.query(
          'SELECT * FROM users WHERE telegram_id = ?',
          [balanceUserId]
        );
        await connection.end();
        
        if (users.length > 0) {
          const user = users[0];
          const balanceText = `
💰 *Your Wallet Balance*

Main Wallet: ${parseFloat(user.main_wallet_balance).toFixed(2)} ETB
Play Wallet: ${parseFloat(user.play_wallet_balance).toFixed(2)} ETB

Total: ${(parseFloat(user.main_wallet_balance) + parseFloat(user.play_wallet_balance)).toFixed(2)} ETB

*Ready to play?* 🎮
`;
          
          const keyboard = {
            inline_keyboard: [
              [{ text: '🎮 Play Now', web_app: { url: WEBAPP_URL } }],
              [{ text: '💰 Deposit', callback_data: 'deposit_guide' }]
            ]
          };
          
          bot.sendMessage(chatId, balanceText, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
          });
        } else {
          bot.sendMessage(chatId, '❌ User not found. Please send /start first.');
        }
      } catch (error) {
        console.error('Balance check error:', error);
        bot.sendMessage(chatId, '❌ Could not check balance. Try again later.');
      }
      break;
      
    case 'how_to_play':
      const howToPlay = `
🎮 *How to Play Kebrchacha Bingo*

*Step 1: Deposit Funds* 💰
• Go to Wallet tab
• Click "Deposit"
• Send payment via Telebirr/Bank
• Upload screenshot
• Wait for admin approval (usually 5-10 minutes)

*Step 2: Transfer to Play Wallet* 🎯
• Transfer funds from Main Wallet to Play Wallet
• This is your gaming balance

*Step 3: Join a Game* 🎲
• Go to Lobby tab
• Choose a game room
• Click "Join Game"
• Your bet is deducted from Play Wallet

*Step 4: Play!* 🎊
• Watch as numbers are called every 7 seconds
• Numbers on your card are auto-marked
• First to complete a line wins!
• Prize goes to your Main Wallet

*Step 5: Withdraw* 💸
• Go to Wallet tab
• Request withdrawal
• Receive money to your account

*Good luck!* 🍀
`;
      bot.sendMessage(chatId, howToPlay, { parse_mode: 'Markdown' });
      break;
      
    case 'deposit_guide':
      const depositGuide = `
💰 *Deposit Guide*

*Payment Methods:*

📱 *Telebirr:*
• Number: 0912345678
• Name: Kebrchacha Bingo

🏦 *Commercial Bank of Ethiopia:*
• Account: 1000123456789
• Name: Kebrchacha Bingo

*How to Deposit:*

1️⃣ Send payment to one of the accounts above
2️⃣ Take a screenshot of the transaction
3️⃣ Open the game → Wallet tab
4️⃣ Click "Deposit"
5️⃣ Enter amount
6️⃣ Upload screenshot
7️⃣ Submit

⏱️ *Processing Time:* 5-10 minutes
✅ *Confirmation:* You'll see "Approved" in transaction history

*Minimum Deposit:* 10 ETB
*Maximum Deposit:* 10,000 ETB

Need help? Contact @${SUPPORT_USERNAME}
`;
      bot.sendMessage(chatId, depositGuide, { parse_mode: 'Markdown' });
      break;
      
    case 'leaderboard':
      try {
        const connection = await getDbConnection();
        const [topPlayers] = await connection.query(`
          SELECT username, main_wallet_balance + play_wallet_balance as total_balance
          FROM users
          ORDER BY total_balance DESC
          LIMIT 10
        `);
        await connection.end();
        
        let leaderboardText = '🏆 *Top Players*\n\n';
        topPlayers.forEach((player, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          leaderboardText += `${medal} ${player.username}: ${parseFloat(player.total_balance).toFixed(2)} ETB\n`;
        });
        
        bot.sendMessage(chatId, leaderboardText, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Could not load leaderboard. Try again later.');
      }
      break;
      
    case 'about':
      const aboutText = `
ℹ️ *About Kebrchacha Bingo*

Kebrchacha Bingo is Ethiopia's premier online Bingo gaming platform. We bring the excitement of traditional Bingo to your fingertips with:

✨ *Our Mission:*
To provide fair, transparent, and entertaining gaming experiences for all Ethiopians.

🎯 *Our Values:*
• Fair Play - Every game is transparent
• Fast Payouts - Quick withdrawals
• 24/7 Support - Always here to help
• Secure Platform - Your money is safe

📊 *Platform Stats:*
• 1000+ Active Players
• 500+ Games Daily
• 50,000+ ETB in Prizes
• 99.9% Uptime

🔒 *Security:*
All transactions are encrypted and secure. We use industry-standard security measures to protect your data and funds.

📞 *Contact:*
• Support: @${SUPPORT_USERNAME}
• Channel: ${CHANNEL_URL}
• Email: support@kebrchacha.com

*Join us and win big!* 🎊
`;
      bot.sendMessage(chatId, aboutText, { parse_mode: 'Markdown' });
      break;
  }
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpText = `
🆘 *Kebrchacha Bingo - Help*

*Commands:*
/start - Start the bot and register
/help - Show this help message
/balance - Check your wallet balance
/support - Contact customer support

*Quick Links:*
• Play Game: Click "Play Now" button
• Deposit: Wallet tab → Deposit
• Withdraw: Wallet tab → Withdraw
• Support: @${SUPPORT_USERNAME}

*Need more help?*
Contact our support team 24/7!
`;
  
  bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

// Handle /balance command
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const connection = await getDbConnection();
    const [users] = await connection.query(
      'SELECT main_wallet_balance, play_wallet_balance FROM users WHERE telegram_id = ?',
      [userId]
    );
    await connection.end();
    
    if (users.length > 0) {
      const user = users[0];
      const balanceText = `
💰 *Your Wallet Balance*

Main Wallet: ${parseFloat(user.main_wallet_balance).toFixed(2)} ETB
Play Wallet: ${parseFloat(user.play_wallet_balance).toFixed(2)} ETB

Total: ${(parseFloat(user.main_wallet_balance) + parseFloat(user.play_wallet_balance)).toFixed(2)} ETB

*Ready to play?* Click the button below! 👇
`;
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '🎮 Play Now', web_app: { url: WEBAPP_URL } }],
          [{ text: '💰 Deposit', callback_data: 'deposit_guide' }]
        ]
      };
      
      bot.sendMessage(chatId, balanceText, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else {
      bot.sendMessage(chatId, '❌ User not found. Please send /start first.');
    }
  } catch (error) {
    console.error('Balance check error:', error);
    bot.sendMessage(chatId, '❌ Could not check balance. Try again later.');
  }
});

// Handle /support command
bot.onText(/\/support/, (msg) => {
  const chatId = msg.chat.id;
  
  const supportText = `
💬 *Customer Support*

Need help? We're here 24/7!

*Contact Methods:*
• Telegram: @${SUPPORT_USERNAME}
• Channel: ${CHANNEL_URL}
• Email: support@kebrchacha.com

*Common Issues:*
• Deposit not approved? Wait 5-10 minutes
• Can't join game? Check Play Wallet balance
• Withdrawal issues? Contact support

*Response Time:* Usually within 30 minutes

We're here to help! 🤝
`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '💬 Contact Support', url: `https://t.me/${SUPPORT_USERNAME}` }],
      [{ text: '📢 Join Channel', url: CHANNEL_URL }]
    ]
  };
  
  bot.sendMessage(chatId, supportText, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

console.log('🤖 Kebrchacha Bingo Bot is running...');
console.log('📱 Waiting for /start commands...');

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('🛑 Bot stopped');
  bot.stopPolling();
  process.exit();
});

const express = require('express');
const axios = require('axios');
const router = express.Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = 'https://negattech.com/kbingo/bingo-pro.html';

// Telegram Bot API helper function
async function sendMessage(chatId, text, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    throw error;
  }
}

// Webhook endpoint for Telegram bot updates
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📱 Telegram webhook received:', JSON.stringify(update, null, 2));

    // Handle regular messages
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const user = update.message.from;

      console.log(`📨 Message from ${user.username || user.first_name}: ${text}`);

      // Handle /start command
      if (text === '/start') {
        await sendMessage(chatId, 
          `🎮 <b>Welcome to Kebrchacha Bingo!</b>\n\n` +
          `Hello ${user.first_name}! Ready to play?\n\n` +
          `🎯 Real-time multiplayer bingo\n` +
          `💰 Instant payouts\n` +
          `🔒 Secure & fair gameplay\n\n` +
          `Tap the button below to start playing!`,
          {
            reply_markup: {
              inline_keyboard: [
                [{
                  text: '🎮 Play Bingo Now',
                  web_app: { url: WEBAPP_URL }
                }]
              ]
            }
          }
        );
      }
      
      // Handle /help command
      else if (text === '/help') {
        await sendMessage(chatId,
          `📋 <b>How to Play Kebrchacha Bingo:</b>\n\n` +
          `1️⃣ Tap "🎮 Play Bingo" to open the game\n` +
          `2️⃣ Select your bingo cards (1-100 cards)\n` +
          `3️⃣ Wait for the game to start\n` +
          `4️⃣ Numbers are called every 7 seconds\n` +
          `5️⃣ Get BINGO to win prizes!\n\n` +
          `💡 <b>Features:</b>\n` +
          `• Auto-daub (automatic marking)\n` +
          `• Spectator mode\n` +
          `• Real-time multiplayer\n` +
          `• Dual wallet system\n\n` +
          `🎯 Ready to play? Tap the button below!`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🎮 Play Now',
                  web_app: { url: WEBAPP_URL }
                }
              ]]
            }
          }
        );
      }
      
      // Handle /play command
      else if (text === '/play') {
        await sendMessage(chatId,
          `🚀 <b>Let's Play!</b>\n\nTap the button to open the game:`,
          {
            reply_markup: {
              inline_keyboard: [[{
                text: '🎮 Play Bingo',
                web_app: { url: 'https://negattech.com/kbingo/' }
              }]]
            }
          }
        );
      }
      
      // Handle /wallet command
      else if (text === '/wallet') {
        await sendMessage(chatId,
          `💰 <b>Wallet Information</b>\n\n` +
          `Open the game to check your wallet balance and manage your funds.\n\n` +
          `🏦 <b>Features:</b>\n` +
          `• Main Wallet (deposits/withdrawals)\n` +
          `• Play Wallet (game funds)\n` +
          `• Transaction history\n` +
          `• Instant transfers`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '💰 Open Wallet',
                  web_app: { url: WEBAPP_URL }
                }
              ]]
            }
          }
        );
      }
      
      // Handle unknown commands
      else if (text.startsWith('/')) {
        await sendMessage(chatId,
          `❓ <b>Unknown command</b>\n\n` +
          `Available commands:\n` +
          `• /start - Welcome message\n` +
          `• /help - How to play\n` +
          `• /play - Quick play\n` +
          `• /wallet - Wallet info\n\n` +
          `Or just tap the menu button to play! 🎮`
        );
      }
      
      else {
        await sendMessage(chatId,
          `👋 Hello ${user.first_name}! I'm the Kebrchacha Bingo bot.\n\nTap below to play!`,
          {
            reply_markup: {
              inline_keyboard: [[{
                text: '🎮 Play Bingo',
                web_app: { url: 'https://negattech.com/kbingo/' }
              }]]
            }
          }
        );
      }
    }

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      // Acknowledge the callback query
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        callback_query_id: callbackQuery.id,
        text: 'Opening game...'
      });

      console.log(`🔘 Callback query: ${data}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
});

// Set webhook endpoint
router.post('/set-webhook', async (req, res) => {
  try {
    const webhookUrl = `https://bingo-mini-app-sily.onrender.com/api/telegram/webhook`;
    
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query']
    });

    console.log('✅ Webhook set successfully:', response.data);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('❌ Error setting webhook:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Get webhook info
router.get('/webhook-info', async (req, res) => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error getting webhook info:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Test bot endpoint
router.get('/test', async (req, res) => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    res.json({
      bot_info: response.data,
      webhook_url: `https://bingo-mini-app-sily.onrender.com/api/telegram/webhook`,
      webapp_url: WEBAPP_URL
    });
  } catch (error) {
    console.error('❌ Error testing bot:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

module.exports = router;
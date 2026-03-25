/**
 * Firebase Cloud Function for Telegram Bot Webhook
 * 
 * Setup Instructions:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Initialize Firebase: firebase init functions
 * 3. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const TelegramBot = require('node-telegram-bot-api');

// Initialize bot WITHOUT polling (webhook mode)
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

// Import your existing handlers
const { registerHandlers } = require('./handlers');

// Register all command and callback handlers
registerHandlers(bot);

// Export the webhook function
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Get update from request body
    const update = req.body;
    
    // Process the update
    await bot.processUpdate(update);
    
    // Send success response
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).send('Error');
  }
});

// Optional: Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).send('Telegram Bot is running!');
});

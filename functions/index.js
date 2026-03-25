/**
 * Telegram Escrow Bot - Firebase Cloud Functions Entry Point
 */

const functions = require('firebase-functions');
const TelegramBot = require('node-telegram-bot-api');

// Initialize bot WITHOUT polling (webhook mode)
const bot = new TelegramBot(functions.config().bot.token, { polling: false });

// Import configuration
const config = require('./config');

// Import handlers
const { registerHandlers } = require('./handlers');

// Register all command and callback handlers
registerHandlers(bot);

// Export the webhook function
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Get update from request body
    const update = req.body;
    
    if (!update) {
      return res.status(400).send('Bad Request: No update provided');
    }
    
    // Process the update
    await bot.processUpdate(update);
    
    // Send success response
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).send('Error processing update');
  }
});

// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).send('Telegram Escrow Bot is running! 🚀');
});

// Bot info endpoint for debugging
exports.botInfo = functions.https.onRequest(async (req, res) => {
  try {
    const info = await bot.getMe();
    res.status(200).json({
      success: true,
      bot: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

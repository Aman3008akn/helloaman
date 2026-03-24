/**
 * Telegram Escrow Bot - Main Entry Point
 * Production-grade escrow bot for secure group transactions
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const connectDatabase = require('./config/database');
const { connectRedis } = require('./config/redis');
const config = require('./config');
const { registerHandlers } = require('./handlers');
const { initializeScheduledJobs } = require('./jobs/scheduledJobs');
const { rateLimiter, blacklistCheck, updateActivity } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Validate required environment variables
if (!config.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in .env file');
  process.exit(1);
}

console.log('🚀 Starting Telegram Escrow Bot...');

// Initialize bot
const bot = new TelegramBot(config.BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Initialize services
const initialize = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis (optional)
    await connectRedis();
    
    // Register command handlers
    registerHandlers(bot);
    
    // Initialize scheduled jobs
    initializeScheduledJobs(bot);
    
    // Set bot commands menu
    await bot.setMyCommands([
      { command: 'start', description: '👋 Start the bot & see menu' },
      { command: 'mystats', description: '📊 View your trading stats' },
      { command: 'mypending', description: '⏳ Your pending deals' },
      { command: 'history', description: '📜 Deal history' },
      { command: 'trade', description: '📄 View trade by ID' },
      { command: 'leaderboard', description: '🏆 Top traders' },
    ]);
    
    // Admin commands (shown only to admins in private chat)
    await bot.setMyCommands([
      { command: 'add', description: '➕ Create new escrow deal' },
      { command: 'paid', description: '✅ Mark as paid' },
      { command: 'deliver', description: '📦 Mark as delivered' },
      { command: 'release', description: '💰 Release funds' },
      { command: 'cancel', description: '❌ Cancel deal' },
      { command: 'dispute', description: '⚠️ Open dispute' },
      { command: 'setfee', description: '💸 Set global fee %' },
      { command: 'blacklist', description: '🚫 Ban user' },
      { command: 'unblacklist', description: '✅ Unban user' },
      { command: 'stats', description: '📊 Admin analytics' },
      { command: 'pending', description: '📋 Pending deals' },
      { command: 'alltrades', description: '📜 All trades' },
    ]);
    
    console.log('✅ Bot initialized successfully!');
    console.log(`🤖 Bot Username: @${config.BOT_USERNAME || 'Not set'}`);
    console.log('📡 Polling started...');
    console.log('\n━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 AVAILABLE COMMANDS:\n');
    console.log('User Commands:');
    console.log('  /start - Start bot & see menu');
    console.log('  /mystats - Your trading stats');
    console.log('  /mypending - Pending deals');
    console.log('  /history - Deal history');
    console.log('  /trade [ID] - View trade details');
    console.log('  /leaderboard - Top traders\n');
    console.log('Admin Commands:');
    console.log('  /add @buyer @seller amount - Create deal');
    console.log('  /paid [ID] - Mark as paid');
    console.log('  /deliver [ID] - Mark delivered');
    console.log('  /release [ID] - Release funds');
    console.log('  /cancel [ID] - Cancel deal');
    console.log('  /dispute [ID] reason - Open dispute');
    console.log('  /setfee percent - Set global fee');
    console.log('  /blacklist @user reason - Ban user');
    console.log('  /unblacklist @user - Unban user');
    console.log('  /stats - Analytics dashboard');
    console.log('  /pending - View pending deals');
    console.log('  /alltrades - All trades list\n');
    console.log('━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Failed to initialize bot:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️ Shutting down gracefully...');
  try {
    await bot.stopPolling();
    console.log('✅ Bot stopped');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the bot
initialize();

module.exports = bot;

require('dotenv').config();

module.exports = {
  // Bot Configuration
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_USERNAME: process.env.BOT_USERNAME,
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-escrow',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Admin Settings
  DEFAULT_FEE_PERCENT: parseFloat(process.env.DEFAULT_FEE_PERCENT) || 3,
  AUTO_CANCEL_TIMEOUT_MINUTES: parseInt(process.env.AUTO_CANCEL_TIMEOUT_MINUTES) || 120,
  REMINDER_INTERVAL_MINUTES: parseInt(process.env.REMINDER_INTERVAL_MINUTES) || 30,
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  
  // Admin Roles (comma-separated usernames)
  SUPER_ADMINS: process.env.SUPER_ADMINS ? process.env.SUPER_ADMINS.split(',') : [],
  MODERATORS: process.env.MODERATORS ? process.env.MODERATORS.split(',') : [],
  ESCROWERS: process.env.ESCROWERS ? process.env.ESCROWERS.split(',') : [],
};

/**
 * Webhook Setup Script for Telegram Bot
 * Use this to set/unset webhook for Firebase deployment
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in .env file');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const args = process.argv.slice(2);
const command = args[0];

// Set webhook
const setWebhook = async () => {
  if (!WEBHOOK_URL) {
    console.error('❌ WEBHOOK_URL is missing in .env file');
    console.log('\n📝 Add this to your .env file:');
    console.log('WEBHOOK_URL=https://your-app.web.app');
    process.exit(1);
  }

  try {
    const result = await bot.setWebHook(WEBHOOK_URL);
    console.log('✅ Webhook set successfully!');
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    console.log('📡 Telegram will now forward updates to this URL');
    console.log('\n⚠️  IMPORTANT: Make sure your Firebase Function is deployed and running!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
    process.exit(1);
  }
};

// Delete webhook (back to polling)
const deleteWebhook = async () => {
  try {
    const result = await bot.deleteWebHook();
    console.log('✅ Webhook deleted successfully!');
    console.log('📡 Bot will use polling mode now');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to delete webhook:', error.message);
    process.exit(1);
  }
};

// Get webhook info
const getWebhookInfo = async () => {
  try {
    const info = await bot.getWebHookInfo();
    console.log('📊 Webhook Information:');
    console.log(`   URL: ${info.url || 'Not set'}`);
    console.log(`   Has custom certificate: ${info.has_custom_certificate}`);
    console.log(`   Pending updates: ${info.pending_update_count}`);
    
    if (info.last_error_date) {
      console.log(`   Last error date: ${new Date(info.last_error_date * 1000).toISOString()}`);
      console.log(`   Last error message: ${info.last_error_message}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to get webhook info:', error.message);
    process.exit(1);
  }
};

// Show usage
const showUsage = () => {
  console.log('\n📋 USAGE:\n');
  console.log('  node webhook-setup.js set     - Set webhook URL');
  console.log('  node webhook-setup.js delete  - Delete webhook (back to polling)');
  console.log('  node webhook-setup.js info    - Get webhook information');
  console.log('\n📝 Before setting webhook:');
  console.log('  1. Deploy your Firebase Function');
  console.log('  2. Get your function URL');
  console.log('  3. Add WEBHOOK_URL to .env file');
  console.log('  4. Run: node webhook-setup.js set');
  console.log('');
  process.exit(0);
};

// Main logic
switch (command) {
  case 'set':
    setWebhook();
    break;
  case 'delete':
  case 'unset':
  case 'remove':
    deleteWebhook();
    break;
  case 'info':
    getWebhookInfo();
    break;
  default:
    showUsage();
}

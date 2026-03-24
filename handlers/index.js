/**
 * Handler Registration - Central command routing
 */

// Admin Commands
const handleAddDeal = require('./commands/admin/addDeal');
const handlePaid = require('./commands/admin/paid');
const handleDeliver = require('./commands/admin/deliver');
const handleRelease = require('./commands/admin/release');
const handleCancel = require('./commands/admin/cancel');
const handleDispute = require('./commands/admin/dispute');
const handleSetFee = require('./commands/admin/setfee');
const handleBlacklist = require('./commands/admin/blacklist');
const handleUnblacklist = require('./commands/admin/unblacklist');
const handleStats = require('./commands/admin/stats');
const handlePending = require('./commands/admin/pending');
const handleAllTrades = require('./commands/admin/alltrades');
const handleRefund = require('./commands/admin/refund');
const handleExtend = require('./commands/admin/extend');
const handleUserSearch = require('./commands/admin/usersearch');
const handleFeeInfo = require('./commands/admin/feeinfo');
const handleDeals = require('./commands/admin/deals');
const handleMakeAdmin = require('./commands/admin/makeadmin');

// User Commands
const handleStart = require('./commands/user/start');
const handleMyStats = require('./commands/user/mystats');
const handleMyPending = require('./commands/user/mypending');
const handleHistory = require('./commands/user/history');
const handleTrade = require('./commands/user/trade');
const handleLeaderboard = require('./commands/user/leaderboard');
const handleHelp = require('./commands/user/help');
const handleAppeal = require('./commands/user/appeal');
const handleContact = require('./commands/user/contact');
const handleReport = require('./commands/user/report');
const handleInvoice = require('./commands/user/invoice');
const handleDashboard = require('./commands/user/dashboard');

// Callback Handlers
const handleCallback = require('./callbacks/buttonHandlers');

/**
 * Register all command handlers with the bot
 */
const registerHandlers = (bot) => {
  console.log('📝 Registering command handlers...');
  
  // Helper function to wrap handlers for node-telegram-bot-api
  const wrapHandler = (handler) => {
    return async (message, match) => {
      // Create a context-like object
      const ctx = {
        from: message.from,
        chat: message.chat,
        message: message,
        bot: bot,
        reply: (text, options) => bot.sendMessage(message.chat.id, text, options),
        answerCbQuery: (text, showAlert) => bot.answerCallbackQuery(message.message_id, { text, show_alert: showAlert }),
        editMessageText: (text, options) => bot.editMessageText(text, {
          chat_id: message.chat.id,
          message_id: message.message_id,
          ...options
        }),
      };
      
      try {
        await handler(ctx);
      } catch (error) {
        console.error(`Error in handler:`, error);
      }
    };
  };
  
  // User Commands
  bot.onText(/\/start/, wrapHandler(handleStart));
  bot.onText(/\/mystats/i, wrapHandler(handleMyStats));
  bot.onText(/\/mypending/i, wrapHandler(handleMyPending));
  bot.onText(/\/history/i, wrapHandler(handleHistory));
  bot.onText(/\/trade\s+(\S+)/, wrapHandler(handleTrade));
  bot.onText(/\/leaderboard/i, wrapHandler(handleLeaderboard));
  bot.onText(/\/help/i, wrapHandler(handleHelp));
  bot.onText(/\/appeal\s+.+/, wrapHandler(handleAppeal));
  bot.onText(/\/contact/i, wrapHandler(handleContact));
  bot.onText(/\/report\s+.+/, wrapHandler(handleReport));
  bot.onText(/\/invoice\s+(\S+)/, wrapHandler(handleInvoice));
  bot.onText(/\/dashboard/i, wrapHandler(handleDashboard));
  
  // Admin Commands
  bot.onText(/\/add\s+.+/, wrapHandler(handleAddDeal));
  bot.onText(/\/paid\s+(\S+)/, wrapHandler(handlePaid));
  bot.onText(/\/deliver\s+(\S+)/, wrapHandler(handleDeliver));
  bot.onText(/\/release\s+(\S+)/, wrapHandler(handleRelease));
  bot.onText(/\/cancel\s+(\S+)/, wrapHandler(handleCancel));
  bot.onText(/\/dispute\s+.+/, wrapHandler(handleDispute));
  bot.onText(/\/setfee\s+(\d+)/, wrapHandler(handleSetFee));
  bot.onText(/\/blacklist\s+.+/, wrapHandler(handleBlacklist));
  bot.onText(/\/unblacklist\s+(\S+)/, wrapHandler(handleUnblacklist));
  bot.onText(/\/stats/i, wrapHandler(handleStats));
  bot.onText(/\/pending/i, wrapHandler(handlePending));
  bot.onText(/\/alltrades/i, wrapHandler(handleAllTrades));
  bot.onText(/\/refund\s+(\S+)/, wrapHandler(handleRefund));
  bot.onText(/\/extend\s+(\S+)\s+(\d+)/, wrapHandler(handleExtend));
  bot.onText(/\/usersearch\s+(\S+)/, wrapHandler(handleUserSearch));
  bot.onText(/\/feeinfo\s+(\S+)/, wrapHandler(handleFeeInfo));
  bot.onText(/\/deals/i, wrapHandler(handleDeals));
  bot.onText(/\/makeadmin\s+(.+)/, wrapHandler(handleMakeAdmin));
  
  // Handle /trade without arguments
  bot.onText(/^\/trade$/, async (message) => {
    await bot.sendMessage(message.chat.id, '❌ Trade ID required.\n\nUsage: /trade TRADE_ID\nExample: /trade #TID123456');
  });
  
  // Callback Query Handler (inline buttons)
  bot.on('callback_query', async (callbackQuery) => {
    const ctx = {
      from: callbackQuery.from,
      callbackQuery: callbackQuery,
      bot: bot,
      answerCbQuery: (text, showAlert) => bot.answerCallbackQuery(callbackQuery.id, { text, show_alert: showAlert }),
      editMessageText: (text, options) => bot.editMessageText(text, {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        ...options
      }),
    };
    
    try {
      await handleCallback(ctx);
    } catch (error) {
      console.error('Error in callback:', error);
    }
  });
  
  console.log('✅ Command handlers registered');
};

module.exports = {
  registerHandlers,
};

const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /cancel command - Cancel a deal
 * Usage: /cancel TRADE_ID
 */
const handleCancel = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('💫 This command only works in group chats.');
      return;
    }
    
    const username = ctx.from.username;
    
    // Check admin permissions
    const userId = ctx.from.id.toString();
    const isAdmin = await SecurityService.isAdmin(username, userId);
    if (!isAdmin) {
      await ctx.reply('🚫 Only admins can cancel deals.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    
    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /cancel TRADE_ID')
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!tradeId || !trade) {
      await ctx.reply(errorTemplate('Invalid trade ID', `No trade with ID ${tradeId || tradeIdInput}`));
      return;
    }
    
    if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(trade.status)) {
      await ctx.reply(
        errorTemplate('Already finalized', `Cannot cancel a ${trade.status} trade.`)
      );
      return;
    }
    
    const updatedTrade = await TradeService.cancelDeal(tradeId);
    
    const message = `❌ DEAL CANCELLED

📋 Trade ID: *${tradeId}*
📊 Status: *CANCELLED*

⚠️ *This deal has been cancelled.* No funds will be released.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyDealCancelled(updatedTrade);
    
  } catch (error) {
    console.error('Error in /cancel command:', error);
    await ctx.reply(errorTemplate('Failed to cancel deal', error.message));
  }
};

module.exports = handleCancel;

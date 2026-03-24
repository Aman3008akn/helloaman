const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /release command - Complete deal and release funds
 * Usage: /release TRADE_ID
 */
const handleRelease = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can release funds.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    
    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /release TRADE_ID')
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!tradeId || !trade) {
      await ctx.reply(errorTemplate('Invalid trade ID', `No trade with ID ${tradeId || tradeIdInput}`));
      return;
    }
    
    if (!['PAID', 'DELIVERED'].includes(trade.status)) {
      await ctx.reply(
        errorTemplate('Invalid state', 'Cannot release funds. Trade must be PAID or DELIVERED.')
      );
      return;
    }
    
    const updatedTrade = await TradeService.completeDeal(tradeId);
    
    const message = `💰 FUNDS RELEASED

📋 Trade ID: *${tradeId}*
✅ Status: *COMPLETED*
💵 Released: *₹${updatedTrade.releaseAmount.toLocaleString()}*

*Funds have been released to the seller. Deal completed successfully!*`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyDealCompleted(updatedTrade);
    
  } catch (error) {
    console.error('Error in /release command:', error);
    await ctx.reply(errorTemplate('Failed to release funds', error.message));
  }
};

module.exports = handleRelease;

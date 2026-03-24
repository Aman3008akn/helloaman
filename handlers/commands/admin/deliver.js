const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /deliver command - Mark deal as delivered
 * Usage: /deliver TRADE_ID
 */
const handleDeliver = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can mark deals as delivered.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    
    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /deliver TRADE_ID')
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    
    if (!tradeId) {
      await ctx.reply(
        errorTemplate('Invalid trade ID format', 'Use format #TID123456')
      );
      return;
    }
    
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!trade) {
      await ctx.reply(errorTemplate('Trade not found', `No trade with ID ${tradeId}`));
      return;
    }
    
    if (trade.status !== 'PAID') {
      await ctx.reply(
        errorTemplate('Invalid state', `Trade is ${trade.status}, not PAID`)
      );
      return;
    }
    
    const updatedTrade = await TradeService.markAsDelivered(tradeId);
    
    const message = `✅ DELIVERY CONFIRMED

📋 Trade ID: *${tradeId}*
📦 Status: *Delivered*

*Buyer has received the goods/services.* Admin can now release funds.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyDeliveryConfirmed(updatedTrade);
    
  } catch (error) {
    console.error('Error in /deliver command:', error);
    await ctx.reply(errorTemplate('Failed to confirm delivery', error.message));
  }
};

module.exports = handleDeliver;

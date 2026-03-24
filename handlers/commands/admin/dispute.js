const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /dispute command - Open a dispute on a trade
 * Usage: /dispute TRADE_ID reason
 */
const handleDispute = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can open disputes.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    const reason = args.slice(2).join(' ');
    
    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /dispute TRADE_ID reason')
      );
      return;
    }
    
    if (!reason) {
      await ctx.reply(
        errorTemplate('Reason required', 'Please provide a reason for the dispute.')
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!tradeId || !trade) {
      await ctx.reply(errorTemplate('Invalid trade ID', `No trade with ID ${tradeId || tradeIdInput}`));
      return;
    }
    
    if (['COMPLETED', 'CANCELLED', 'REFUNDED', 'DISPUTED'].includes(trade.status)) {
      await ctx.reply(
        errorTemplate('Cannot dispute', `Cannot dispute a ${trade.status} trade.`)
      );
      return;
    }
    
    const updatedTrade = await TradeService.openDispute(tradeId, reason, {
      userId: ctx.from.id.toString(),
      username,
    });
    
    const message = `⚠️ DISPUTE OPENED

📋 Trade ID: *${tradeId}*
🔍 Reason: *${reason}*
👮 Disputed By: @${username}

*This trade is now under review.* Admin will investigate and resolve the dispute.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyDisputeOpened(updatedTrade);
    
  } catch (error) {
    console.error('Error in /dispute command:', error);
    await ctx.reply(errorTemplate('Failed to open dispute', error.message));
  }
};

module.exports = handleDispute;

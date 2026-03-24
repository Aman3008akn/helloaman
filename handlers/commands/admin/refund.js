const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /refund command - Refund a cancelled deal to buyer
 * Usage: /refund TRADE_ID
 */
const handleRefund = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('🚫 This command only works in group chats.');
      return;
    }

    const username = ctx.from.username;
    
    // Check admin permissions
    const userId = ctx.from.id.toString();
    const isAdmin = await SecurityService.isAdmin(username, userId);
    if (!isAdmin) {
      await ctx.reply('🚫 Only admins can process refunds.');
      return;
    }

    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];

    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate(
          'Trade ID required',
          'Usage: /refund TRADE_ID'
        )
      );
      return;
    }

    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);

    if (!tradeId || !trade) {
      await ctx.reply(errorTemplate('Invalid trade ID', `No trade with ID ${tradeId || tradeIdInput}`));
      return;
    }

    if (trade.status !== 'CANCELLED') {
      await ctx.reply(
        errorTemplate('Cannot refund', `Only CANCELLED deals can be refunded. Current status: ${trade.status}`)
      );
      return;
    }

    // Mark as refunded
    const updatedTrade = await TradeService.updateTradeStatus(tradeId, 'REFUNDED');

    const message = `💰 REFUND PROCESSED

📋 Trade ID: *${tradeId}*
👤 Buyer: @${trade.buyer.username}
💵 Refund Amount: *₹${trade.amount.toLocaleString()}*
✅ Status: *REFUNDED*

Buyer has been notified of the refund.`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

    // Notify buyer
    const notificationService = new NotificationService(ctx.bot);
    const refundMessage = `✅ *REFUND APPROVED*

Your deal ${trade.tradeId} has been refunded.

💵 Refund Amount: ₹${trade.amount.toLocaleString()}

The funds should appear in your account shortly.`;
    
    await notificationService.sendDM(trade.buyer.userId, refundMessage);

  } catch (error) {
    console.error('Error in /refund command:', error);
    await ctx.reply(errorTemplate('Failed to process refund', error.message));
  }
};

module.exports = handleRefund;

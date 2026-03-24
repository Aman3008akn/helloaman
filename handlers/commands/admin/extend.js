const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /extend command - Extend payment deadline for a deal
 * Usage: /extend TRADE_ID hours
 */
const handleExtend = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can extend deadlines.');
      return;
    }

    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    const hoursStr = args[2];

    if (!tradeIdInput || !hoursStr) {
      await ctx.reply(
        errorTemplate(
          'Invalid syntax',
          'Usage: /extend TRADE_ID hours\nExample: /extend TID123456 24'
        )
      );
      return;
    }

    const hours = parseInt(hoursStr);
    if (isNaN(hours) || hours <= 0 || hours > 720) {
      await ctx.reply(
        errorTemplate('Invalid hours', 'Hours must be between 1 and 720 (30 days)')
      );
      return;
    }

    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);

    if (!tradeId || !trade) {
      await ctx.reply(errorTemplate('Invalid trade ID', `No trade with ID ${tradeId || tradeIdInput}`));
      return;
    }

    if (trade.status !== 'WAITING_PAYMENT') {
      await ctx.reply(
        errorTemplate('Cannot extend', `Only WAITING_PAYMENT deals can be extended. Current: ${trade.status}`)
      );
      return;
    }

    // Extend deadline
    const extensionMs = hours * 60 * 60 * 1000;
    const newDeadline = new Date(Date.now() + extensionMs);
    
    const updatedTrade = await TradeService.updateTradeStatus(tradeId, trade.status, {
      'metadata.paymentDeadline': newDeadline
    });

    const message = `⏱️ DEADLINE EXTENDED

📋 Trade ID: *${tradeId}*
⏰ Extended By: *${hours} hours*
📅 New Deadline: *${newDeadline.toLocaleString()}*

Buyer has been notified of the extended deadline.`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

    // Notify buyer
    const notificationService = new NotificationService(ctx.bot);
    const extendMessage = `⏱️ *PAYMENT DEADLINE EXTENDED*

Your deal ${trade.tradeId} deadline has been extended.

⏰ New Deadline: ${newDeadline.toLocaleString()}
💰 Amount Due: ₹${trade.amount.toLocaleString()}

Please complete payment by the new deadline.`;
    
    await notificationService.sendDM(trade.buyer.userId, extendMessage);

  } catch (error) {
    console.error('Error in /extend command:', error);
    await ctx.reply(errorTemplate('Failed to extend deadline', error.message));
  }
};

module.exports = handleExtend;

const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate, paymentConfirmedTemplate } = require('../../../utils/messageTemplates');

/**
 * /paid command - Mark deal as paid
 * Usage: /paid TRADE_ID
 */
const handlePaid = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can mark deals as paid.');
      return;
    }
    
    // Parse trade ID from command
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    
    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate(
          'Trade ID required',
          'Usage: /paid TRADE_ID\nExample: /paid #TID123456'
        )
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    
    if (!tradeId) {
      await ctx.reply(
        errorTemplate(
          'Invalid trade ID format',
          'Trade ID should be in format #TID123456 or just 123456'
        )
      );
      return;
    }
    
    // Find trade
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!trade) {
      await ctx.reply(errorTemplate('Trade not found', `No trade with ID ${tradeId} exists.`));
      return;
    }
    
    // Check current status
    if (trade.status !== 'WAITING_PAYMENT') {
      await ctx.reply(
        errorTemplate(
          'Invalid state',
          `This trade is already ${trade.status}. Cannot mark as paid.`
        )
      );
      return;
    }
    
    // Update trade status
    const updatedTrade = await TradeService.markAsPaid(tradeId);
    
    // Format success message
    const message = `✅ PAYMENT CONFIRMED

📋 Trade ID: *${tradeId}*
💰 Amount: *₹${updatedTrade.amount.toLocaleString()}*
📊 Status: *Paid (Escrow Secured)*

The seller has confirmed receipt of payment. Buyer should now mark delivery.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    // Send notifications
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyPaymentConfirmed(updatedTrade);
    
  } catch (error) {
    console.error('Error in /paid command:', error);
    await ctx.reply(errorTemplate('Failed to confirm payment', error.message));
  }
};

module.exports = handlePaid;

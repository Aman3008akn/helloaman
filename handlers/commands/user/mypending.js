const TradeService = require('../../../services/TradeService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /mypending command - Show user's pending deals
 */
const handleMyPending = async (ctx) => {
  try {
    console.log(`[/mypending] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    const userId = ctx.from.id.toString();
    
    const trades = await TradeService.getTradesByUserId(userId, null, 50);
    
    const pendingStatuses = ['WAITING_PAYMENT', 'PAID', 'DELIVERED', 'DISPUTED'];
    const pendingTrades = trades.filter(t => pendingStatuses.includes(t.status));
    
    if (pendingTrades.length === 0) {
      await ctx.reply('✅ You have no pending deals.\n\nAll your deals are completed or cancelled.');
      return;
    }
    
    let message = `⏳ YOUR PENDING DEALS (${pendingTrades.length})\n\n`;
    
    pendingTrades.forEach((trade, index) => {
      message += `${index + 1}. *${trade.tradeId}* - *₹${trade.amount.toLocaleString()}*\n`;
      message += `   Status: ${trade.status}\n`;
      message += `   Role: ${trade.buyer.userId === userId ? '👤 Buyer' : '🛒 Seller'}\n\n`;
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /mypending command:', error);
    await ctx.reply(errorTemplate('Failed to fetch pending deals', error.message));
  }
};

module.exports = handleMyPending;

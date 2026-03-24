const TradeService = require('../../../services/TradeService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /history command - Show user's deal history (completed/cancelled)
 */
const handleHistory = async (ctx) => {
  try {
    console.log(`[/history] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    const userId = ctx.from.id.toString();
    
    const trades = await TradeService.getTradesByUserId(userId, null, 50);
    
    const finalizedStatuses = ['COMPLETED', 'CANCELLED', 'REFUNDED'];
    const historyTrades = trades.filter(t => finalizedStatuses.includes(t.status));
    
    if (historyTrades.length === 0) {
      await ctx.reply('📜 You have no deal history yet.\n\nYour completed and cancelled deals will appear here.');
      return;
    }
    
    let message = `📜 YOUR DEAL HISTORY (${historyTrades.length})\n\n`;
    
    historyTrades.forEach((trade, index) => {
      message += `${index + 1}. *${trade.tradeId}* - *₹${trade.amount.toLocaleString()}*\n`;
      message += `   Status: ${trade.status}\n`;
      message += `   Role: ${trade.buyer.userId === userId ? '👤 Buyer' : '🛒 Seller'}\n`;
      if (trade.timestamps?.completedAt || trade.timestamps?.cancelledAt) {
        const date = trade.timestamps.completedAt || trade.timestamps.cancelledAt;
        message += `   Date: ${new Date(date).toLocaleDateString()}\n`;
      }
      message += '\n';
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /history command:', error);
    await ctx.reply(errorTemplate('Failed to fetch deal history', error.message));
  }
};

module.exports = handleHistory;

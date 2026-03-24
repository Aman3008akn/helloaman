const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /pending command - Show all pending deals
 */
const handlePending = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can view pending deals.');
      return;
    }
    
    const pendingTrades = await TradeService.getPendingTrades();
    
    if (pendingTrades.length === 0) {
      await ctx.reply('✅ No pending deals at the moment.\n\nAll deals are either completed or cancelled.');
      return;
    }
    
    let message = `📋 PENDING DEALS (${pendingTrades.length})\n\n`;
    
    pendingTrades.slice(0, 20).forEach((trade, index) => {
      message += `${index + 1}. *${trade.tradeId}* - *₹${trade.amount.toLocaleString()}* [${trade.status}]\n`;
      message += `   Buyer: @${trade.buyer.username} | Seller: @${trade.seller.username}\n\n`;
    });
    
    if (pendingTrades.length > 20) {
      message += `\n... and ${pendingTrades.length - 20} more deals`;
    }
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /pending command:', error);
    await ctx.reply(errorTemplate('Failed to fetch pending deals', error.message));
  }
};

module.exports = handlePending;

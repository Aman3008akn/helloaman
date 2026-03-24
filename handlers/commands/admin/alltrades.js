const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const { createDealCard } = require('../../../utils/messageTemplates');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /alltrades command - Show all trades with pagination
 */
const handleAllTrades = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can view all trades.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const page = parseInt(args[1]) || 1;
    
    const result = await TradeService.getAllTrades(page, 50);
    
    if (result.trades.length === 0) {
      await ctx.reply('✅ No trades found.\n\nCreate your first deal with /add command.');
      return;
    }
    
    let message = `📋 ALL TRADES - Page ${result.page}\nTotal: ${result.total} trades\n\n`;
    
    result.trades.forEach((trade, index) => {
      message += `${index + 1}. ${trade.tradeId} | ₹${trade.amount.toLocaleString()} | ${trade.status}\n`;
    });
    
    if (result.hasMore) {
      message += `\nUse /alltrades ${page + 1} to see more...`;
    }
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /alltrades command:', error);
    await ctx.reply(errorTemplate('Failed to fetch trades', error.message));
  }
};

module.exports = handleAllTrades;

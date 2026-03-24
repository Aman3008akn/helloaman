const TradeService = require('../../../services/TradeService');
const { createDealCard, errorTemplate } = require('../../../utils/messageTemplates');
const { parseTradeId } = require('../../../utils/validators');
const { getViewDetailsButton } = require('../../../keyboards/replyKeyboards');

/**
 * /trade command - Show details of a specific trade
 * Usage: /trade TRADE_ID
 */
const handleTrade = async (ctx) => {
  try {
    console.log(`[/trade] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];
    
    if (!tradeIdInput) {
      await ctx.reply(
        '❌ Trade ID required.\n\nUsage: /trade TRADE_ID\nExample: /trade #TID123456'
      );
      return;
    }
    
    const tradeId = parseTradeId(tradeIdInput);
    
    if (!tradeId) {
      await ctx.reply(
        '❌ Invalid trade ID format.\n\nUse format #TID123456 or just 123456'
      );
      return;
    }
    
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!trade) {
      await ctx.reply(`❌ Trade not found.\n\nNo trade with ID ${tradeId} exists.`);
      return;
    }
    
    // Check if user is involved in this trade
    const userId = ctx.from.id.toString();
    const isParticipant = 
      trade.buyer.userId === userId ||
      trade.seller.userId === userId ||
      trade.escrower.userId === userId;
    
    // Only show full details to participants or admins
    if (!isParticipant) {
      // Check if admin (simple check by username)
      const username = ctx.from.username;
      const superAdmins = (process.env.SUPER_ADMINS || '').split(',');
      const moderators = (process.env.MODERATORS || '').split(',');
      
      const isAdmin = superAdmins.includes(username) || moderators.includes(username);
      
      if (!isAdmin) {
        await ctx.reply('❌ You do not have permission to view this trade.');
        return;
      }
    }
    
    const message = createDealCard(trade);
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: getViewDetailsButton(tradeId),
    });
    
  } catch (error) {
    console.error('Error in /trade command:', error);
    await ctx.reply(errorTemplate('Failed to fetch trade details', error.message));
  }
};

module.exports = handleTrade;

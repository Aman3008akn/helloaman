const TradeService = require('../../services/TradeService');
const SecurityService = require('../../services/SecurityService');
const NotificationService = require('../../services/NotificationService');

/**
 * Handle callback queries from inline buttons
 */
const handleCallback = async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    const tradeId = data.split(':')[1];
    const action = data.split(':')[0];
    
    // Acknowledge callback
    await ctx.answerCbQuery('Processing...');
    
    // Get trade
    const trade = await TradeService.findTradeById(tradeId);
    
    if (!trade) {
      await ctx.editMessageText('❌ Trade not found.');
      return;
    }
    
    const username = ctx.from.username;
    
    switch (action) {
      case 'view_details':
        // Just refresh the details
        await ctx.answerCbQuery('Details loaded');
        break;
        
      case 'confirm_payment':
        // Only admins can confirm
        const isAdmin1 = await SecurityService.isAdmin(username);
        if (!isAdmin1) {
          await ctx.answerCbQuery('🚫 Admins only', true);
          return;
        }
        await TradeService.markAsPaid(tradeId);
        await ctx.editMessageText(`✅ Payment confirmed for ${tradeId}`);
        break;
        
      case 'mark_delivered':
        const isAdmin2 = await SecurityService.isAdmin(username);
        if (!isAdmin2) {
          await ctx.answerCbQuery('🚫 Admins only', true);
          return;
        }
        await TradeService.markAsDelivered(tradeId);
        await ctx.editMessageText(`📦 Delivery marked for ${tradeId}`);
        break;
        
      case 'release_funds':
        const isAdmin3 = await SecurityService.isAdmin(username);
        if (!isAdmin3) {
          await ctx.answerCbQuery('🚫 Admins only', true);
          return;
        }
        await TradeService.completeDeal(tradeId);
        await ctx.editMessageText(`💰 Funds released for ${tradeId}`);
        break;
        
      case 'cancel_deal':
        const isAdmin4 = await SecurityService.isAdmin(username);
        if (!isAdmin4) {
          await ctx.answerCbQuery('🚫 Admins only', true);
          return;
        }
        await TradeService.cancelDeal(tradeId);
        await ctx.editMessageText(`❌ Deal cancelled for ${tradeId}`);
        break;
        
      case 'raise_dispute':
        // For this we need a reason, so just acknowledge
        await ctx.answerCbQuery('Please use /dispute command with reason');
        break;
        
      default:
        await ctx.answerCbQuery('Unknown action');
    }
    
  } catch (error) {
    console.error('Error handling callback:', error);
    await ctx.answerCbQuery('❌ Error occurred');
  }
};

module.exports = handleCallback;

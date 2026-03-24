const TradeService = require('../../../services/TradeService');
const UserService = require('../../../services/UserService');
const SecurityService = require('../../../services/SecurityService');
const NotificationService = require('../../../services/NotificationService');
const { getWaitingPaymentButtons } = require('../../../keyboards/replyKeyboards');
const { isValidAmount, extractUserMention } = require('../../../utils/validators');
const { errorTemplate, successTemplate } = require('../../../utils/messageTemplates');

/**
 * /add command - Create a new escrow deal
 * Usage: /add @buyer @seller amount
 */
const handleAddDeal = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('🚫 This command only works in group chats.');
      return;
    }
    
    const username = ctx.from.username;
    const userId = ctx.from.id.toString();
    
    // Check admin permissions
    const isAdmin = await SecurityService.isAdmin(username, userId);
    if (!isAdmin) {
      await ctx.reply('🚫 Only admins can create deals.');
      return;
    }
    
    // Parse arguments
    const args = ctx.message.text.split(/\s+/);
    
    if (args.length < 4) {
      await ctx.reply(
        errorTemplate(
          'Invalid command format',
          'Usage: /add @buyer @seller amount\nExample: /add @john @jane 100'
        )
      );
      return;
    }
    
    // Extract buyer mention
    const buyerMention = extractUserMention(ctx.message);
    if (!buyerMention || !buyerMention.username) {
      await ctx.reply(errorTemplate('Invalid buyer mention', 'Please mention the buyer with @username'));
      return;
    }
    
    // Find seller (second mention or text)
    const sellerUsername = args[2].replace('@', '');
    if (!sellerUsername) {
      await ctx.reply(errorTemplate('Invalid seller username', 'Please provide seller @username'));
      return;
    }
    
    // Get amount
    const amountStr = args[3];
    if (!isValidAmount(amountStr)) {
      await ctx.reply(errorTemplate('Invalid amount', 'Please enter a valid positive number'));
      return;
    }
    
    const amount = parseFloat(amountStr);
    
    // Get user IDs (try to fetch from chat members or use placeholder)
    const buyerUserId = buyerMention.userId || `user_${buyerMention.username}`;
    const sellerUserId = `user_${sellerUsername}`;
    const escrowerUserId = ctx.from.id.toString();
    
    // Create the deal
    const trade = await TradeService.createDeal({
      buyer: {
        userId: buyerUserId,
        username: buyerMention.username,
      },
      seller: {
        userId: sellerUserId,
        username: sellerUsername,
      },
      escrower: {
        userId: escrowerUserId,
        username: username,
      },
      amount,
      groupChatId: ctx.chat.id.toString(),
    });
    
    // Ensure users exist in database
    await UserService.getOrCreateUser(buyerUserId, buyerMention.username);
    await UserService.getOrCreateUser(sellerUserId, sellerUsername);
    
    // Format success message
    const message = `✅ DEAL CREATED SUCCESSFULLY

📋 Trade ID: ${trade.tradeId}
👤 Buyer: @${trade.buyer.username}
🛒 Seller: @${trade.seller.username}
💰 Amount: ₹${trade.amount.toLocaleString('en-IN')}
📊 Fee (${trade.feePercent}%): ₹${trade.feeAmount.toLocaleString('en-IN')}
💵 Release Amount: ₹${trade.releaseAmount.toLocaleString('en-IN')}

Status: ⏳ Waiting Payment

The deal has been created. Buyer and seller have been notified.`;
    
    // Send to group with inline buttons
    await ctx.reply(message, {
      reply_markup: getWaitingPaymentButtons(trade.tradeId),
    });
    
    // Send notifications
    const notificationService = new NotificationService(ctx.bot);
    await notificationService.notifyDealCreated(trade);
    
    // Log action
    await UserService.updateLastActive(escrowerUserId);
    
  } catch (error) {
    console.error('Error in /add command:', error);
    await ctx.reply(errorTemplate('Failed to create deal', error.message));
  }
};

module.exports = handleAddDeal;

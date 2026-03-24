const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /deals [status] command - Filter deals by status
 * Usage: /deals or /deals WAITING_PAYMENT
 */
const handleDeals = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can filter deals.');
      return;
    }

    const args = ctx.message.text.split(/\s+/);
    const statusFilter = args[1]?.toUpperCase();

    const validStatuses = ['WAITING_PAYMENT', 'PAID', 'DELIVERED', 'DISPUTED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

    if (statusFilter && !validStatuses.includes(statusFilter)) {
      await ctx.reply(
        errorTemplate(
          'Invalid status',
          `Valid statuses: ${validStatuses.join(', ')}`
        )
      );
      return;
    }

    let deals;
    if (statusFilter) {
      deals = await TradeService.getPendingTrades();
      deals = deals.filter(d => d.status === statusFilter);
    } else {
      deals = await TradeService.getPendingTrades();
    }

    if (deals.length === 0) {
      const statusText = statusFilter ? ` with status ${statusFilter}` : '';
      await ctx.reply(`✅ No deals found${statusText}.`);
      return;
    }

    let message = `📊 *DEALS FILTER* ${statusFilter ? `- ${statusFilter}` : 'ALL PENDING'}\n`;
    message += `Total: ${deals.length} deals\n\n`;

    deals.slice(0, 30).forEach((deal, index) => {
      const statusEmoji = {
        'WAITING_PAYMENT': '⏳',
        'PAID': '💰',
        'DELIVERED': '📦',
        'COMPLETED': '✅',
        'CANCELLED': '❌',
        'DISPUTED': '⚠️',
        'REFUNDED': '💵'
      }[deal.status] || '❓';

      message += `${index + 1}. ${statusEmoji} *${deal.tradeId}* | *₹${deal.amount.toLocaleString()}*\n`;
      message += `   ${deal.buyer.username} → ${deal.seller.username}\n`;
      message += `   Created: ${new Date(deal.createdAt).toLocaleDateString()}\n\n`;
    });

    if (deals.length > 30) {
      message += `\n... and ${deals.length - 30} more deals`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /deals command:', error);
    await ctx.reply(errorTemplate('Failed to fetch deals', error.message));
  }
};

module.exports = handleDeals;

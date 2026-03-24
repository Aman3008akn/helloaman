const UserService = require('../../../services/UserService');
const TradeService = require('../../../services/TradeService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /dashboard command - Quick user dashboard
 */
const handleDashboard = async (ctx) => {
  try {
    console.log(`[/dashboard] User ${ctx.from.username} (${ctx.from.id}) viewed dashboard`);
    
    const userId = ctx.from.id.toString();
    
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      await ctx.reply('❌ User profile not found. Please use /start first.');
      return;
    }

    // Get pending deals count
    const allTrades = await TradeService.getTradesByUserId(userId, null, 100);
    const pendingCount = allTrades.filter(t => ['WAITING_PAYMENT', 'PAID', 'DELIVERED'].includes(t.status)).length;
    const completedCount = allTrades.filter(t => t.status === 'COMPLETED').length;
    const disputedCount = allTrades.filter(t => t.status === 'DISPUTED').length;

    const rank = await UserService.getUserRank(userId);
    const rankDisplay = rank ? `#${rank}` : 'N/A';

    const message = `📊 *QUICK DASHBOARD*

━━━━━━━━━━━━━━━━━━━━━━

*👤 PROFILE*
├─ Username: @${user.username}
├─ Status: ${user.isBlacklisted ? '🚫 BLACKLISTED' : '✅ ACTIVE'}
└─ Global Rank: ${rankDisplay}

*📈 QUICK STATS*
├─ Total Deals: *${user.totalDeals}*
├─ Completed: *${completedCount}*
├─ Pending: *${pendingCount}*
└─ Disputed: *${disputedCount}*

*💰 FINANCIAL*
├─ Total Volume: *₹${user.totalVolume.toLocaleString()}*
├─ Avg Deal Size: *₹${(user.totalVolume / (user.totalDeals || 1)).toFixed(0)}*
└─ Success Rate: *${user.successRate.toFixed(1)}%*

*🎯 QUICK ACTIONS*
• /mystats - Full statistics
• /mypending - View pending deals
• /history - Completed deals
• /leaderboard - Top traders

━━━━━━━━━━━━━━━━━━━━━━`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /dashboard command:', error);
    await ctx.reply(errorTemplate('Failed to load dashboard', error.message));
  }
};

module.exports = handleDashboard;

const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /stats command - Show admin analytics dashboard
 */
const handleStats = async (ctx) => {
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
      await ctx.reply('🚫 Only admins can view statistics.');
      return;
    }
    
    const Trade = require('../../../models/Trade');
    const User = require('../../../models/User');
    
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayDeals = await Trade.find({
      'timestamps.createdAt': { $gte: today, $lt: tomorrow },
    });
    
    const todayCompleted = await Trade.find({
      status: 'COMPLETED',
      'timestamps.completedAt': { $gte: today, $lt: tomorrow },
    });
    
    const todayVolume = todayDeals.reduce((sum, trade) => sum + trade.amount, 0);
    const todayFees = todayDeals.reduce((sum, trade) => sum + trade.feeAmount, 0);
    
    // Get weekly stats (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekDeals = await Trade.find({
      'timestamps.createdAt': { $gte: weekAgo },
    });
    
    const weekCompleted = weekDeals.filter(t => t.status === 'COMPLETED');
    const successRate = weekDeals.length > 0 
      ? ((weekCompleted.length / weekDeals.length) * 100).toFixed(1)
      : 0;
    
    const avgDealSize = weekDeals.length > 0
      ? weekDeals.reduce((sum, t) => sum + t.amount, 0) / weekDeals.length
      : 0;
    
    // Get active escrows
    const activeEscrows = await Trade.countDocuments({
      status: { $in: ['WAITING_PAYMENT', 'PAID', 'DELIVERED'] },
    });
    
    // Get pending deals
    const pendingDeals = await Trade.countDocuments({
      status: { $in: ['WAITING_PAYMENT', 'PAID', 'DELIVERED', 'DISPUTED'] },
    });
    
    // Get user stats
    const totalUsers = await User.countDocuments();
    const blacklisted = await User.countDocuments({ isBlacklisted: true });
    
    // Find top trader
    const topTrader = await User.findOne({ isBlacklisted: false })
      .sort({ totalVolume: -1 })
      .lean();
    
    const message = `📊 ADMIN ANALYTICS DASHBOARD

📈 *TODAY'S STATS*
├─ New Deals: *${todayDeals.length}*
├─ Completed: *${todayCompleted.length}*
├─ Total Volume: *₹${todayVolume.toLocaleString()}*
├─ Fees Earned: *₹${todayFees.toLocaleString()}*
└─ Active Escrows: *${activeEscrows}*

📊 *WEEKLY OVERVIEW*
├─ Total Deals: *${weekDeals.length}*
├─ Success Rate: *${successRate}%*
├─ Avg Deal Size: *₹${avgDealSize.toFixed(2)}*
└─ Top Trader: *${topTrader ? `@${topTrader.username}` : 'N/A'}* (*₹${topTrader ? topTrader.totalVolume.toLocaleString() : '0'}*)

💼 *SYSTEM STATS*
├─ Total Users: *${totalUsers}*
├─ Blacklisted: *${blacklisted}*
└─ Pending Deals: *${pendingDeals}*`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /stats command:', error);
    await ctx.reply(errorTemplate('Failed to fetch statistics', error.message));
  }
};

module.exports = handleStats;

const UserService = require('../../../services/UserService');
const { leaderboardTemplate, errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /leaderboard command - Show top traders by volume
 */
const handleLeaderboard = async (ctx) => {
  try {
    console.log(`[/leaderboard] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    const topUsers = await UserService.getLeaderboard(10);
    
    if (topUsers.length === 0) {
      await ctx.reply('🏆 LEADERBOARD\n\nNo traders yet. Be the first to make a deal!');
      return;
    }
    
    const message = leaderboardTemplate(topUsers);
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /leaderboard command:', error);
    await ctx.reply(errorTemplate('Failed to fetch leaderboard', error.message));
  }
};

module.exports = handleLeaderboard;

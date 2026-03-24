const UserService = require('../../../services/UserService');
const { userStatsTemplate, errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /mystats command - Show user's trading statistics
 */
const handleMyStats = async (ctx) => {
  try {
    console.log(`[/mystats] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    const userId = ctx.from.id.toString();
    
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      console.log(`[/mystats] User profile not found for ${userId}`);
      await ctx.reply('❌ *User profile not found.*\n\nPlease use /start command first to create your profile.');
      return;
    }
    
    const rank = await UserService.getUserRank(userId);
    const message = userStatsTemplate(user, rank);
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /mystats command:', error);
    await ctx.reply(errorTemplate('Failed to fetch your stats', error.message));
  }
};

module.exports = handleMyStats;

const UserService = require('../../../services/UserService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /unblacklist command - Remove a user from blacklist
 * Usage: /unblacklist @username
 */
const handleUnblacklist = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('🚫 This command only works in group chats.');
      return;
    }
    
    const username = ctx.from.username;
    
    // Check super admin permissions
    const isSuperAdmin = await SecurityService.isSuperAdmin(username);
    if (!isSuperAdmin) {
      await ctx.reply('🚫 Only super admins can unblacklist users.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const targetUsername = args[1]?.replace('@', '');
    
    if (!targetUsername) {
      await ctx.reply(
        errorTemplate('Username required', 'Usage: /unblacklist @username')
      );
      return;
    }
    
    const userId = `user_${targetUsername}`;
    
    await UserService.unblacklistUser(userId);
    
    const message = `✅ USER UNBLACKLISTED

👤 User: @${targetUsername}
👮 Action By: @${username}

This user can now use the bot again.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /unblacklist command:', error);
    await ctx.reply(errorTemplate('Failed to unblacklist user', error.message));
  }
};

module.exports = handleUnblacklist;

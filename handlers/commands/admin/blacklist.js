const UserService = require('../../../services/UserService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /blacklist command - Ban a user from the bot
 * Usage: /blacklist @username reason
 */
const handleBlacklist = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('💫 This command only works in group chats.');
      return;
    }
    
    const username = ctx.from.username;
    const adminId = ctx.from.id.toString();
    
    // Check admin permissions
    const isAdmin = await SecurityService.isAdmin(username, adminId);
    if (!isAdmin) {
      await ctx.reply('🚫 Only admins can blacklist users.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const targetUsername = args[1]?.replace('@', '');
    const reason = args.slice(2).join(' ') || 'Violation of terms';
    
    if (!targetUsername) {
      await ctx.reply(
        errorTemplate('Username required', 'Usage: /blacklist @username reason')
      );
      return;
    }
    
    // Get user ID (if available in chat)
    const targetUserId = `user_${targetUsername}`;
    
    await UserService.blacklistUser(targetUserId, targetUsername, reason, username);
    
    const message = `✅ USER BLACKLISTED

👤 User: @${targetUsername}
🔍 Reason: ${reason}
👮 Action By: @${username}

This user can no longer use the bot.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /blacklist command:', error);
    await ctx.reply(errorTemplate('Failed to blacklist user', error.message));
  }
};

module.exports = handleBlacklist;

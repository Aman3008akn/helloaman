const UserService = require('../../../services/UserService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /usersearch command - Search and view user information (Admin only)
 * Usage: /usersearch @username
 */
const handleUserSearch = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('🚫 This command only works in group chats.');
      return;
    }

    const username = ctx.from.username;
    
    // Check admin permissions
    const userId = ctx.from.id.toString();
    const isAdmin = await SecurityService.isAdmin(username, userId);
    if (!isAdmin) {
      await ctx.reply('🚫 Only admins can search users.');
      return;
    }

    const args = ctx.message.text.split(/\s+/);
    const searchUsername = args[1]?.replace('@', '');

    if (!searchUsername) {
      await ctx.reply(
        errorTemplate('Username required', 'Usage: /usersearch @username')
      );
      return;
    }

    // Search by username
    const user = await UserService.getUserByUsername(searchUsername);

    if (!user) {
      await ctx.reply(errorTemplate('User not found', `No user found with username @${searchUsername}`));
      return;
    }

    const status = user.isBlacklisted ? '🚫 BLACKLISTED' : '✅ ACTIVE';
    const blacklistInfo = user.isBlacklisted 
      ? `\n\n⚠️ *BLACKLIST INFO*\n├─ Reason: ${user.blacklistReason}\n└─ By: ${user.blacklistedBy}`
      : '';

    const message = `👤 *USER PROFILE*

*Username:* @${user.username}
*User ID:* ${user._id}
*Status:* ${status}

*📊 STATS*
├─ Total Deals: ${user.totalDeals}
├─ Completed: ${user.completedDeals}
├─ Success Rate: ${user.successRate.toFixed(1)}%
└─ Total Volume: ₹${user.totalVolume.toLocaleString()}

*💰 FINANCIALS*
├─ Highest Deal: ₹${user.highestDeal.toLocaleString()}
├─ Avg Deal Size: ₹${(user.totalVolume / (user.totalDeals || 1)).toFixed(0)}
└─ Total Deals Value: ₹${user.totalVolume.toLocaleString()}

*⏰ ACTIVITY*
├─ Joined: ${new Date(user.createdAt).toLocaleDateString()}
└─ Last Active: ${new Date(user.lastActive).toLocaleDateString()}${blacklistInfo}`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /usersearch command:', error);
    await ctx.reply(errorTemplate('Failed to search user', error.message));
  }
};

module.exports = handleUserSearch;

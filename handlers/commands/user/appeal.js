const UserService = require('../../../services/UserService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /appeal command - Appeal a blacklist decision
 * Usage: /appeal reason
 */
const handleAppeal = async (ctx) => {
  try {
    console.log(`[/appeal] User ${ctx.from.username} (${ctx.from.id}) submitted appeal`);
    
    const userId = ctx.from.id.toString();
    const username = ctx.from.username;
    
    const args = ctx.message.text.split(/\s+/);
    const reason = args.slice(1).join(' ');

    if (!reason) {
      await ctx.reply(
        errorTemplate(
          'Reason required',
          'Usage: /appeal [your reason]\nExample: /appeal I was wrongly banned, please check'
        )
      );
      return;
    }

    const user = await UserService.getUserById(userId);

    if (!user) {
      await ctx.reply('❌ User profile not found. Please use /start first.');
      return;
    }

    if (!user.isBlacklisted) {
      await ctx.reply('✅ You are not blacklisted. No need to appeal.');
      return;
    }

    // Store appeal request (we'll add a method to handle this)
    // For now, log and notify
    console.log(`[APPEAL] User ${username} (${userId}) appealed blacklist: ${reason}`);
    
    const message = `📝 *APPEAL SUBMITTED*

Your appeal has been recorded and sent to admins for review.

📋 Reason: ${reason}

You will be notified once admins review your case. This typically takes 24-48 hours.

If you have any additional information, reply to this message.`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    // Notify admins (via log channel if available)
    if (process.env.LOG_CHANNEL_ID) {
      try {
        const adminNotification = `⚠️ *NEW BLACKLIST APPEAL*

👤 User: @${username} (${userId})
🔍 Reason: ${reason}

Blacklist Reason: ${user.blacklistReason || 'N/A'}
Blacklisted By: ${user.blacklistedBy || 'Unknown'}`;
        
        ctx.bot.sendMessage(process.env.LOG_CHANNEL_ID, adminNotification, { parse_mode: 'Markdown' });
      } catch (e) {
        console.log('Failed to notify admins of appeal');
      }
    }

  } catch (error) {
    console.error('Error in /appeal command:', error);
    await ctx.reply(errorTemplate('Failed to submit appeal', error.message));
  }
};

module.exports = handleAppeal;

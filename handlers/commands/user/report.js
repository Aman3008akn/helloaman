const UserService = require('../../../services/UserService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /report command - Report a user for rule violation
 * Usage: /report @username reason
 */
const handleReport = async (ctx) => {
  try {
    console.log(`[/report] User ${ctx.from.username} (${ctx.from.id}) submitted report`);
    
    const args = ctx.message.text.split(/\s+/);
    const targetUsername = args[1]?.replace('@', '');
    const reason = args.slice(2).join(' ');

    if (!targetUsername || !reason) {
      await ctx.reply(
        errorTemplate(
          'Invalid syntax',
          'Usage: /report @username reason\nExample: /report @scammer Fraud and theft'
        )
      );
      return;
    }

    const reporterId = ctx.from.id.toString();
    const reporterUsername = ctx.from.username;

    // Prevent self-reporting
    if (reporterUsername.toLowerCase() === targetUsername.toLowerCase()) {
      await ctx.reply('❌ You cannot report yourself.');
      return;
    }

    // Store report (log to channel if available)
    const reportData = {
      targetUsername,
      reporterId,
      reporterUsername,
      reason,
      reportedAt: new Date(),
      chatType: ctx.chat.type,
      chatId: ctx.chat.id
    };

    console.log(`[REPORT FILED] ${reporterUsername} reported @${targetUsername}: ${reason}`);

    if (process.env.LOG_CHANNEL_ID) {
      try {
        const adminNotification = `⚠️ *NEW USER REPORT*

👤 Reported User: @${targetUsername}
📝 Reason: ${reason}
🔔 Reported By: @${reporterUsername}
⏰ Time: ${new Date().toLocaleString()}

Review and take appropriate action.`;
        
        ctx.bot.sendMessage(process.env.LOG_CHANNEL_ID, adminNotification, { parse_mode: 'Markdown' });
      } catch (e) {
        console.log('Failed to notify admins of report');
      }
    }

    const message = `📋 *REPORT SUBMITTED*

Your report has been documented and sent to admins for investigation.

👤 Reported User: @${targetUsername}
📝 Reason: ${reason}

⏰ Review Time: 24-48 hours
✅ Action will be taken if rules are violated.

Thank you for helping keep our community safe!`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /report command:', error);
    await ctx.reply(errorTemplate('Failed to submit report', error.message));
  }
};

module.exports = handleReport;

const UserService = require('../../../services/UserService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /contact command - Show admin contact information
 */
const handleContact = async (ctx) => {
  try {
    console.log(`[/contact] User ${ctx.from.username} (${ctx.from.id}) requested contact info`);
    
    const superAdmins = (process.env.SUPER_ADMINS || '').split(',').filter(a => a);
    const moderators = (process.env.MODERATORS || '').split(',').filter(a => a);

    const message = `📞 *ADMIN CONTACT INFORMATION*

━━━━━━━━━━━━━━━━━━━━━━━

*🔐 SUPER ADMINS*
${superAdmins.length > 0 ? superAdmins.map((a, i) => `${i + 1}. @${a.trim()}`).join('\n') : 'No super admins assigned'}

*👮 MODERATORS*
${moderators.length > 0 ? moderators.map((a, i) => `${i + 1}. @${a.trim()}`).join('\n') : 'No moderators assigned'}

*📧 SUPPORT CHANNELS*
• Report Issues: /report @user reason
• Appeal Decision: /appeal your reason
• File Dispute: /dispute [ID] reason

*⏰ RESPONSE TIME*
• Disputes: 24-48 hours
• Appeals: 48-72 hours
• Support: Best effort basis

━━━━━━━━━━━━━━━━━━━━━━━

For urgent matters, contact any admin directly in the group chat.`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /contact command:', error);
    await ctx.reply(errorTemplate('Failed to load contact info', error.message));
  }
};

module.exports = handleContact;

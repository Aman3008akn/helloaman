const User = require('../../../models/User');
const AdminSetting = require('../../../models/Admin');
const SecurityService = require('../../../services/SecurityService');

const handleMakeAdmin = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const chatType = ctx.chat.type;

    // Group-only check
    if (chatType === 'private') {
      return ctx.reply('🚫 This command only works in group chats.', { parse_mode: 'Markdown' });
    }

    // Check if caller is super admin
    const isSuperAdmin = await SecurityService.isSuperAdmin(username);
    if (!isSuperAdmin) {
      console.log(`[/makeadmin] Unauthorized attempt by user ${username} (${userId})`);
      return ctx.reply('🚫 *Only super admins can create new admins!*', { parse_mode: 'Markdown' });
    }

    // Get target user ID/username from message
    const args = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!args) {
      return ctx.reply('⚠️ *Usage:* `/makeadmin <user_id or @username> [level]`\n\n*Example:* `/makeadmin @username moderator`\n*Levels:* moderator (default), escrower', { parse_mode: 'Markdown' });
    }

    const parts = args.split(/\s+/);
    const target = parts[0];
    const level = (parts[1] || 'moderator').toLowerCase();

    if (!['moderator', 'escrower'].includes(level)) {
      return ctx.reply('⚠️ *Invalid level!* Use: `moderator` or `escrower`', { parse_mode: 'Markdown' });
    }

    let targetUserId = null;
    let targetUsername = target;

    // Parse target (could be ID or @username)
    if (target.startsWith('@')) {
      targetUsername = target.substring(1);
      // Find user by username
      const user = await User.findOne({ username: targetUsername });
      if (!user) {
        return ctx.reply(`❌ *User not found:* @${targetUsername}\n\nMake sure they've used /start command first.`, { parse_mode: 'Markdown' });
      }
      targetUserId = user.telegramId;
    } else if (/^\d+$/.test(target)) {
      targetUserId = parseInt(target);
      // Verify user exists in database
      const user = await User.findOne({ telegramId: targetUserId });
      if (!user) {
        return ctx.reply(`❌ *User with ID ${targetUserId} not found in database.*\n\nMake sure they've used /start command first.`, { parse_mode: 'Markdown' });
      }
      targetUsername = user.username || `User${targetUserId}`;
    } else {
      return ctx.reply('⚠️ *Invalid format!* Please provide a user ID or @username.', { parse_mode: 'Markdown' });
    }

    // Get or create AdminSetting document
    let settings = await AdminSetting.getSettings();

    // Normalize username for comparison
    const cleanTargetUsername = targetUsername.toLowerCase();

    // Check if already admin in any level
    const isModerator = settings.moderators.some(u => u.toLowerCase() === cleanTargetUsername);
    const isEscrower = settings.escrowers.some(u => u.toLowerCase() === cleanTargetUsername);

    if (isModerator || isEscrower) {
      const currentLevel = isModerator ? 'moderator' : 'escrower';
      return ctx.reply(`⚠️ *@${targetUsername} is already a ${currentLevel}!*`, { parse_mode: 'Markdown' });
    }

    // Cannot make another super admin regular admin
    const targetIsSuperAdmin = await SecurityService.isSuperAdmin(targetUsername);
    if (targetIsSuperAdmin) {
      return ctx.reply(`ℹ️ *@${targetUsername} is already a super admin!*`, { parse_mode: 'Markdown' });
    }

    // Add to appropriate list
    if (level === 'moderator') {
      settings.moderators.push(targetUsername);
    } else if (level === 'escrower') {
      settings.escrowers.push(targetUsername);
    }

    await settings.save();

    // Log the action
    console.log(`[/makeadmin] ${username} (${userId}) promoted @${targetUsername} (${targetUserId}) to ${level}`);

    // Confirmation message for super admin
    const confirmMessage = `✅ *Admin Created Successfully!*\n\n👤 *User:* @${targetUsername} (\`${targetUserId}\`)\n📋 *Level:* ${level.toUpperCase()}\n⏰ *Promoted By:* @${username}\n📅 *Timestamp:* ${new Date().toLocaleString('en-IN')}\n\n🔑 *${level === 'moderator' ? 'Full admin permissions' : 'Escrower permissions'}*`;

    await ctx.reply(confirmMessage, { parse_mode: 'Markdown' });

    // Try to notify the new admin
    try {
      const notifyMessage = `🎉 *Congratulations!*\n\nYou have been promoted to *${level === 'moderator' ? 'Moderator' : 'Escrower'}* in the Escrow Bot! 🤖\n\n*Your new permissions:*\n• ➕ Create deals (/add)\n• 💰 Mark payments (/paid)\n• 📦 Confirm deliveries (/deliver)\n• 💸 Release funds (/release)\n• ❌ Cancel deals (/cancel)\n• ⚠️ Open disputes (/dispute)\n${level === 'moderator' ? '• 🚫 Blacklist users (/blacklist)\n• 📊 View statistics (/stats)' : ''}\n\nUse /help to view all available commands.\n\n👑 *Promoted by:* @${username}`;

      await ctx.telegram.sendMessage(targetUserId, notifyMessage, { parse_mode: 'Markdown' }).catch(() => {
        console.log(`[/makeadmin] Failed to notify new admin ${targetUsername} (${targetUserId})`);
      });
    } catch (error) {
      console.log(`[/makeadmin] Could not send notification to new admin: ${error.message}`);
    }

  } catch (error) {
    console.error(`[/makeadmin] Error:`, error);
    await ctx.reply(`❌ *Error creating admin:* \`${error.message}\``, { parse_mode: 'Markdown' });
  }
};

module.exports = handleMakeAdmin;

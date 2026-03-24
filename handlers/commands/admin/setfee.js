const FeeService = require('../../../services/FeeService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate, successTemplate } = require('../../../utils/messageTemplates');

/**
 * /setfee command - Update global fee percentage
 * Usage: /setfee percent
 */
const handleSetFee = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('💫 This command only works in group chats.');
      return;
    }
    
    const username = ctx.from.username;
    
    // Check super admin permissions
    const isSuperAdmin = await SecurityService.isSuperAdmin(username);
    if (!isSuperAdmin) {
      await ctx.reply('🚫 Only super admins can change the global fee.');
      return;
    }
    
    const args = ctx.message.text.split(/\s+/);
    const percentStr = args[1];
    
    if (!percentStr) {
      await ctx.reply(
        errorTemplate('Percentage required', 'Usage: /setfee percent\nExample: /setfee 3')
      );
      return;
    }
    
    const percent = parseFloat(percentStr);
    
    if (isNaN(percent) || percent < 0 || percent > 100) {
      await ctx.reply(
        errorTemplate('Invalid percentage', 'Please enter a number between 0 and 100.')
      );
      return;
    }
    
    await FeeService.updateDefaultFee(percent);
    
    const message = `✅ FEE UPDATED

Global fee has been set to ${percent}%

This will apply to all new deals created from now.`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /setfee command:', error);
    await ctx.reply(errorTemplate('Failed to update fee', error.message));
  }
};

module.exports = handleSetFee;

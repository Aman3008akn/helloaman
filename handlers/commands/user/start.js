const UserService = require('../../../services/UserService');
const { getMainMenuKeyboard } = require('../../../keyboards/replyKeyboards');
const { EMOJIS } = require('../../../utils/constants');

/**
 * /start command - Welcome message and main menu
 */
const handleStart = async (ctx) => {
  try {
    console.log(`[/start] User ${ctx.from.username} (${ctx.from.id}) started bot`);
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || 'User';
    
    // Get or create user
    const user = await UserService.getOrCreateUser(userId, username);
    console.log(`[/start] User profile created/updated for ${username}`);
    
    const message = `👋 *WELCOME TO CRAZY WORLD ESCROW BOT!*

${EMOJIS.ESCROWER} Secure | Trusted | Reliable

I help facilitate safe transactions between buyers and sellers in group chats.

🔹 Full escrow protection
🔹 Automatic fee calculation
🔹 Complete audit trail

*Available Commands in Personal Messages:*
• /mystats - View your trading stats
• /mypending - View your pending deals
• /history - View deal history
• /trade [ID] - View deal details
• /leaderboard - Top traders

*Use bot in groups to create and manage deals.*

Need help? Contact an admin.`;
    
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: getMainMenuKeyboard(),
    });
    
  } catch (error) {
    console.error('Error in /start command:', error);
    await ctx.reply('❌ Error occurred. Please try again.');
  }
};

module.exports = handleStart;

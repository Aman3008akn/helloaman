/**
 * /help command - Show detailed help information
 */
const handleHelp = async (ctx) => {
  try {
    console.log(`[/help] User ${ctx.from.username} (${ctx.from.id}) from ${ctx.chat.type}`);
    
    const message = `📚 *COMPLETE COMMAND GUIDE*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*👤 USER COMMANDS (Available in DM & Groups)*

*/start* - Welcome & menu setup
*/mystats* - View your trading statistics
*/mypending* - View your active deals
*/history* - View completed deals
*/trade [ID]* - View specific deal details
*/leaderboard* - Top 10 traders by volume

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🔧 ADMIN COMMANDS (Group Only)*

*/add @buyer @seller amount* 
Creates a new escrow deal
Example: /add @john @jane 5000

*/paid [ID]* - Mark payment received
*/deliver [ID]* - Mark goods delivered
*/release [ID]* - Release funds to seller
*/cancel [ID]* - Cancel deal & refund
*/refund [ID]* - Process refund

*/dispute [ID] reason* - Open dispute investigation
*/extend [ID] [hours]* - Extend payment deadline

*/stats* - Admin analytics dashboard
*/pending* - List pending deals
*/alltrades [page]* - All deals list

*/setfee percent* - Set global fee (Super Admin)
*/blacklist @user reason* - Ban user
*/unblacklist @user* - Unban user
*/usersearch @username* - Search user info

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*💡 DEAL WORKFLOW*

1️⃣ Admin creates deal: /add @buyer @seller amount
2️⃣ Buyer pays (Status: WAITING_PAYMENT)
3️⃣ Admin confirms: /paid [ID]
4️⃣ Seller delivers (Status: PAID)
5️⃣ Admin confirms: /deliver [ID]
6️⃣ Admin releases: /release [ID]
7️⃣ Deal complete! ✅

*Alternative flows:*
- Cancel if buyer doesn't pay: /cancel [ID]
- If dispute: /dispute [ID] reason

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*📊 IMPORTANT FEATURES*

✅ Automatic user profile creation
✅ Auto reminders after 24 hours
✅ Auto-cancel after 48 hours no payment
✅ Complete audit logs
✅ Instant notifications to users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need more help? Contact admin or type /start`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error in /help command:', error);
    await ctx.reply('❌ Failed to load help. Try again later.');
  }
};

module.exports = handleHelp;

const TradeService = require('../../../services/TradeService');
const SecurityService = require('../../../services/SecurityService');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /feeinfo command - Show detailed fee breakdown for a deal
 * Usage: /feeinfo TRADE_ID
 */
const handleFeeInfo = async (ctx) => {
  try {
    // Only allow in groups
    if (ctx.chat.type === 'private') {
      await ctx.reply('🚫 This command only works in group chats.');
      return;
    }

    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];

    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /feeinfo TRADE_ID')
      );
      return;
    }

    const TradeModel = require('../../../models/Trade');
    const trade = await TradeModel.findOne({ tradeId: tradeIdInput });

    if (!trade) {
      await ctx.reply(errorTemplate('Trade not found', `No trade with ID ${tradeIdInput}`));
      return;
    }

    const feePercent = trade.feePercent;
    const totalAmount = trade.amount;
    const feeAmount = trade.feeAmount;
    const releaseAmount = trade.releaseAmount;

    const message = `💰 *FEE BREAKDOWN - ${trade.tradeId}*

━━━━━━━━━━━━━━━━━━━━━━━

*TRANSACTION DETAILS*
├─ Total Amount: *₹${totalAmount.toLocaleString()}*
├─ Fee Percentage: *${feePercent}%*
└─ Fee Amount: *₹${feeAmount.toLocaleString()}*

*FINAL SETTLEMENT*
├─ Seller Receives: *₹${releaseAmount.toLocaleString()}*
└─ Platform Earns: *₹${feeAmount.toLocaleString()}*

*CALCULATION*
Fee = ${totalAmount} × ${feePercent}% = ₹${feeAmount.toLocaleString()}
Release = ${totalAmount} - ${feeAmount.toLocaleString()} = ₹${releaseAmount.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /feeinfo command:', error);
    await ctx.reply(errorTemplate('Failed to fetch fee info', error.message));
  }
};

module.exports = handleFeeInfo;

const TradeService = require('../../../services/TradeService');
const { parseTradeId } = require('../../../utils/validators');
const { errorTemplate } = require('../../../utils/messageTemplates');

/**
 * /invoice command - Generate and send invoice/receipt for a deal
 * Usage: /invoice TRADE_ID
 */
const handleInvoice = async (ctx) => {
  try {
    console.log(`[/invoice] User ${ctx.from.username} (${ctx.from.id}) requested invoice`);
    
    const args = ctx.message.text.split(/\s+/);
    const tradeIdInput = args[1];

    if (!tradeIdInput) {
      await ctx.reply(
        errorTemplate('Trade ID required', 'Usage: /invoice TRADE_ID\nExample: /invoice TID123456')
      );
      return;
    }

    const tradeId = parseTradeId(tradeIdInput);
    const trade = await TradeService.findTradeById(tradeId);

    if (!trade) {
      await ctx.reply(errorTemplate('Trade not found', `No trade with ID ${tradeId}`));
      return;
    }

    // Check if user is involved in this trade
    const userId = ctx.from.id.toString();
    const isParticipant = 
      trade.buyer.userId === userId ||
      trade.seller.userId === userId ||
      trade.escrower.userId === userId;

    if (!isParticipant) {
      await ctx.reply('❌ You do not have permission to view this invoice.');
      return;
    }

    const invoiceDate = new Date().toLocaleDateString('en-IN');
    const createdDate = new Date(trade.createdAt).toLocaleDateString('en-IN');

    const message = `📄 *INVOICE / RECEIPT*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*TRANSACTION DETAILS*
├─ Invoice #: *${trade.tradeId}*
├─ Generated: ${invoiceDate}
└─ Original Date: ${createdDate}

*PARTIES INVOLVED*
├─ Buyer: @${trade.buyer.username}
├─ Seller: @${trade.seller.username}
└─ Escrow Agent: @${trade.escrower.username}

*AMOUNT DETAILS*
├─ Gross Amount: ₹${trade.amount.toLocaleString()}
├─ Commission (${trade.feePercent}%): ₹${trade.feeAmount.toLocaleString()}
└─ Net Amount (to Seller): ₹${trade.releaseAmount.toLocaleString()}

*TRANSACTION STATUS*
├─ Current Status: *${trade.status}*
├─ Created: ${createdDate}
${trade.timestamps?.paymentAt ? `├─ Payment Confirmed: ${new Date(trade.timestamps.paymentAt).toLocaleDateString('en-IN')}` : ''}
${trade.timestamps?.deliveredAt ? `├─ Delivered: ${new Date(trade.timestamps.deliveredAt).toLocaleDateString('en-IN')}` : ''}
${trade.timestamps?.completedAt ? `└─ Completed: ${new Date(trade.timestamps.completedAt).toLocaleDateString('en-IN')}` : ''}

*TERMS & CONDITIONS*
✓ Amount held in escrow until delivery confirmed
✓ Commission deducted before releasing funds to seller
✓ All parties agree to platform's terms of service

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*This is an official receipt. Keep it for your records.*`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error in /invoice command:', error);
    await ctx.reply(errorTemplate('Failed to generate invoice', error.message));
  }
};

module.exports = handleInvoice;

const { STATUS_DISPLAY, EMOJIS } = require('./constants');

/**
 * Format a number as currency
 */
const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Premium Deal Card Template - Main trade information display
 */
const createDealCard = (trade) => {
  const separator = '━━━━━━━━━━━━━━━━━━━━';
  
  let message = `${separator}
${EMOJIS.ESCROWER} ESCROW DEAL ${trade.status === 'CREATED' ? 'CREATED' : 'UPDATE'}
${separator}

${EMOJIS.TRADE} DEAL DETAILS
├─ Trade ID: ${trade.tradeId}
├─ Buyer: @${trade.buyer.username}
├─ Seller: @${trade.seller.username}
└─ Escrowed By: @${trade.escrower.username}

${EMOJIS.MONEY} AMOUNT BREAKDOWN
├─ Total Amount: ${formatCurrency(trade.amount)}
├─ Fee (${trade.feePercent}%): ${formatCurrency(trade.feeAmount)}
└─ Release Amount: ${formatCurrency(trade.releaseAmount)}

${EMOJIS.CHART} STATUS: ${STATUS_DISPLAY[trade.status]}
${EMOJIS.CLOCK} Created: ${formatDate(trade.timestamps?.createdAt || trade.createdAt)}`;

  if (trade.timestamps?.paymentAt) {
    message += `\n${EMOJIS.CHECK} *Paid:* ${formatDate(trade.timestamps.paymentAt)}`;
  }
  
  if (trade.timestamps?.deliveredAt) {
    message += `\n${EMOJIS.CHECK} *Delivered:* ${formatDate(trade.timestamps.deliveredAt)}`;
  }
  
  if (trade.timestamps?.completedAt) {
    message += `\n${EMOJIS.SUCCESS} *Completed:* ${formatDate(trade.timestamps.completedAt)}`;
  }
  
  if (trade.disputeReason) {
    message += `\n\n${EMOJIS.WARNING} DISPUTE REASON:\n"${trade.disputeReason}"`;
  }

  message += `\n${separator}`;
  
  return message;
};

/**
 * Deal Created Notification
 */
const dealCreatedTemplate = (trade) => {
  return `🎉 ${EMOJIS.SUCCESS} DEAL CREATED SUCCESSFULLY

${createDealCard(trade)}

⚠️ NEXT STEPS:
• Buyer should send payment to seller
• Seller confirms receipt with /paid command
• Buyer marks delivery with /deliver command
• Admin releases funds with /release command

Use /trade ${trade.tradeId} to view this deal anytime.`;
};

/**
 * Payment Confirmation Template
 */
const paymentConfirmedTemplate = (trade) => {
  return `💰 ${EMOJIS.SUCCESS} PAYMENT CONFIRMED

${createDealCard(trade)}

✅ Funds are now held in escrow.
📦 Seller should proceed with delivery.`;
};

/**
 * Delivery Confirmed Template
 */
const deliveryConfirmedTemplate = (trade) => {
  return `📦 ${EMOJIS.SUCCESS} DELIVERY CONFIRMED

${createDealCard(trade)}

✅ Buyer has confirmed receipt of goods/services.
💰 Admin can now release funds to seller.`;
};

/**
 * Deal Completed Template
 */
const dealCompletedTemplate = (trade) => {
  return `✅ ${EMOJIS.SUCCESS} DEAL COMPLETED

${createDealCard(trade)}

💸 Funds have been released to seller.
🎉 Transaction successful! Thank you for using our escrow service.`;
};

/**
 * Deal Cancelled Template
 */
const dealCancelledTemplate = (trade) => {
  return `❌ ${EMOJIS.ERROR} DEAL CANCELLED

${createDealCard(trade)}

⚠️ This deal has been cancelled.
No funds will be released.`;
};

/**
 * Dispute Opened Template
 */
const disputeOpenedTemplate = (trade) => {
  return `⚠️ ${EMOJIS.WARNING} DISPUTE OPENED

${createDealCard(trade)}

🔍 This trade is now under review.
👮 Admin will investigate and resolve the dispute.`;
};

/**
 * User Stats Template
 */
const userStatsTemplate = (user, rank = null) => {
  const separator = '━━━━━━━━━━━━━━━━━━━━';
  
  return `${separator}
${EMOJIS.CHART} YOUR TRADING PROFILE
${separator}

👤 Username: @${user.username}

📊 STATISTICS
├─ Total Deals: ${user.totalDeals}
├─ Completed: ${user.completedDeals}
├─ Cancelled: ${user.cancelledDeals}
├─ Disputed: ${user.disputedDeals}
└─ Success Rate: ${user.successRate.toFixed(1)}%

💰 FINANCIALS
├─ Total Volume: ${formatCurrency(user.totalVolume)}
└─ Highest Deal: ${formatCurrency(user.highestDeal)}

${rank ? `🏆 GLOBAL RANK: #${rank}` : ''}

${separator}`;
};

/**
 * Leaderboard Template
 */
const leaderboardTemplate = (topUsers) => {
  const separator = '━━━━━━━━━━━━━━━━━━━━';
  
  let message = `${separator}
${EMOJIS.GRAPH} TOP TRADERS LEADERBOARD
${separator}

🏆 TOP 10 BY VOLUME

`;
  
  topUsers.forEach((user, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    message += `${medal} @${user.username} - ${formatCurrency(user.totalVolume)}\n`;
  });
  
  message += `\n${separator}`;
  
  return message;
};

/**
 * Admin Stats Dashboard
 */
const adminStatsTemplate = (stats) => {
  const separator = '━━━━━━━━━━━━━━━━━━━━';
  
  return `${separator}
${EMOJIS.GRAPH} ADMIN ANALYTICS DASHBOARD
${separator}

📈 TODAY'S STATS
├─ New Deals: ${stats.today.newDeals}
├─ Completed: ${stats.today.completed}
├─ Total Volume: ${formatCurrency(stats.today.volume)}
├─ Fees Earned: ${formatCurrency(stats.today.fees)}
└─ Active Escrows: ${stats.activeEscrows}

📊 WEEKLY OVERVIEW
├─ Total Deals: ${stats.weekly.totalDeals}
├─ Success Rate: ${stats.weekly.successRate}%
├─ Avg Deal Size: ${formatCurrency(stats.weekly.avgDealSize)}
└─ Top Trader: @${stats.weekly.topTrader?.username || 'N/A'} (${formatCurrency(stats.weekly.topTrader?.totalVolume || 0)})

💼 SYSTEM STATS
├─ Total Users: ${stats.totalUsers}
├─ Blacklisted: ${stats.blacklisted}
└─ Pending Deals: ${stats.pendingDeals}

${separator}`;
};

/**
 * Error Message Template
 */
const errorTemplate = (message, suggestion = null) => {
  let text = `❌ ERROR: ${message}`;
  
  if (suggestion) {
    text += `\n\n💡 Tip: ${suggestion}`;
  }
  
  return text;
};

/**
 * Success Message Template
 */
const successTemplate = (message) => {
  return `✅ ${message}`;
};

module.exports = {
  formatCurrency,
  formatDate,
  createDealCard,
  dealCreatedTemplate,
  paymentConfirmedTemplate,
  deliveryConfirmedTemplate,
  dealCompletedTemplate,
  dealCancelledTemplate,
  disputeOpenedTemplate,
  userStatsTemplate,
  leaderboardTemplate,
  adminStatsTemplate,
  errorTemplate,
  successTemplate,
};

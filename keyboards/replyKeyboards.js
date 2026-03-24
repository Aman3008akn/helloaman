const { EMOJIS } = require('../utils/constants');

/**
 * Main Menu Reply Keyboard for Users
 */
const getMainMenuKeyboard = () => {
  return {
    keyboard: [
      // Main menu buttons hidden - users will use commands directly
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
};

/**
 * Admin Menu Reply Keyboard
 */
const getAdminMenuKeyboard = () => {
  return {
    keyboard: [
      [`${EMOJIS.CHART} My Stats`, `${EMOJIS.CLOCK} Pending Deals`],
      [`${EMOJIS.GRAPH} All Trades`, `${EMOJIS.ADMIN} Admin Stats`],
      [`${EMOJIS.MESSAGE} Broadcast`],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
};

/**
 * Inline Buttons for Deal Created (Waiting Payment)
 */
const getWaitingPaymentButtons = (tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '✅ Confirm Payment', callback_data: `confirm_payment:${tradeId}` },
        { text: '📄 View Details', callback_data: `view_details:${tradeId}` },
      ],
      [
        { text: '❌ Cancel Deal', callback_data: `cancel_deal:${tradeId}` },
      ],
    ],
  };
};

/**
 * Inline Buttons for Paid Status (Escrow Secured)
 */
const getPaidButtons = (tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '📦 Mark Delivered', callback_data: `mark_delivered:${tradeId}` },
        { text: '⚠️ Raise Dispute', callback_data: `raise_dispute:${tradeId}` },
      ],
      [
        { text: '📄 View Details', callback_data: `view_details:${tradeId}` },
      ],
    ],
  };
};

/**
 * Inline Buttons for Delivered Status
 */
const getDeliveredButtons = (tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '💰 Release Funds', callback_data: `release_funds:${tradeId}` },
        { text: '⚠️ Raise Dispute', callback_data: `raise_dispute:${tradeId}` },
      ],
      [
        { text: '📄 View Proof', callback_data: `view_proof:${tradeId}` },
      ],
    ],
  };
};

/**
 * Inline Buttons for Disputed Status
 */
const getDisputedButtons = (tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '📎 Submit Proof', callback_data: `submit_proof:${tradeId}` },
        { text: '👮 Contact Admin', callback_data: `contact_admin:${tradeId}` },
      ],
      [
        { text: '✅ Resolve in Favor of Seller', callback_data: `resolve_seller:${tradeId}` },
        { text: '💰 Refund to Buyer', callback_data: `refund_buyer:${tradeId}` },
      ],
    ],
  };
};

/**
 * Generic View Details Button
 */
const getViewDetailsButton = (tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '📄 View Details', callback_data: `view_details:${tradeId}` },
      ],
    ],
  };
};

/**
 * Confirmation Buttons (Yes/No)
 */
const getConfirmationButtons = (action, tradeId) => {
  return {
    inline_keyboard: [
      [
        { text: '✅ Yes', callback_data: `confirm_${action}:${tradeId}` },
        { text: '❌ No', callback_data: `cancel_${action}:${tradeId}` },
      ],
    ],
  };
};

/**
 * Pagination Buttons for Lists
 */
const getPaginationButtons = (page, hasMore) => {
  const buttons = [];
  
  if (page > 1) {
    buttons.push({ text: '⬅️ Previous', callback_data: `page:${page - 1}` });
  }
  
  if (hasMore) {
    buttons.push({ text: 'Next ➡️', callback_data: `page:${page + 1}` });
  }
  
  return {
    inline_keyboard: [buttons],
  };
};

module.exports = {
  getMainMenuKeyboard,
  getAdminMenuKeyboard,
  getWaitingPaymentButtons,
  getPaidButtons,
  getDeliveredButtons,
  getDisputedButtons,
  getViewDetailsButton,
  getConfirmationButtons,
  getPaginationButtons,
};

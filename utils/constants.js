/**
 * Status Enum - All possible trade statuses
 */
const TRADE_STATUS = {
  CREATED: 'CREATED',
  WAITING_PAYMENT: 'WAITING_PAYMENT',
  PAID: 'PAID',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
};

/**
 * Status Display Text with Emojis
 */
const STATUS_DISPLAY = {
  CREATED: '🆕 Created',
  WAITING_PAYMENT: '⏳ Waiting Payment',
  PAID: '✅ Paid (Escrow Secured)',
  DELIVERED: '📦 Delivered',
  COMPLETED: '✅ Completed',
  CANCELLED: '❌ Cancelled',
  DISPUTED: '⚠️ Disputed',
  REFUNDED: '💰 Refunded',
};

/**
 * Emoji Set for Various Uses
 */
const EMOJIS = {
  // General
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  
  // Money
  MONEY: '💰',
  FEE: '💸',
  WALLET: '💳',
  
  // Users
  BUYER: '👤',
  SELLER: '🛒',
  ADMIN: '👮',
  ESCROWER: '🛡️',
  
  // Actions
  CHECK: '✔️',
  CROSS: '✖️',
  CLOCK: '⏰',
  CALENDAR: '📅',
  
  // Trade
  TRADE: '📋',
  CHART: '📊',
  GRAPH: '📈',
  
  // Communication
  MESSAGE: '💬',
  BROADCAST: '📢',
};

/**
 * Role Definitions
 */
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator',
  ESCROWER: 'escrower',
  USER: 'user',
};

module.exports = {
  TRADE_STATUS,
  STATUS_DISPLAY,
  EMOJIS,
  ROLES,
};

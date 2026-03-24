/**
 * Input Validation Utilities
 */

/**
 * Validate Telegram username format
 * @param {string} username - Username with or without @ prefix
 * @returns {boolean}
 */
const isValidUsername = (username) => {
  if (!username) return false;
  
  // Remove @ if present
  const cleanUsername = username.replace('@', '');
  
  // Telegram usernames: 5-32 characters, letters, numbers, underscores
  const regex = /^[a-zA-Z0-9_]{5,32}$/;
  return regex.test(cleanUsername);
};

/**
 * Clean username (remove @ prefix)
 * @param {string} username 
 * @returns {string}
 */
const cleanUsername = (username) => {
  return username.replace('@', '').trim();
};

/**
 * Validate amount (positive number)
 * @param {number|string} amount 
 * @returns {boolean}
 */
const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000000; // Max 1 billion
};

/**
 * Validate percentage (0-100)
 * @param {number|string} percent 
 * @returns {boolean}
 */
const isValidPercentage = (percent) => {
  const num = parseFloat(percent);
  return !isNaN(num) && num >= 0 && num <= 100;
};

/**
 * Parse trade ID from various formats
 * @param {string} input - Trade ID with or without # prefix
 * @returns {string} Normalized trade ID
 */
const parseTradeId = (input) => {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  // Already has #TID format
  if (/^#TID\d{6}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Just the number part
  if (/^\d{6}$/.test(trimmed)) {
    return `#TID${trimmed}`;
  }
  
  return null;
};

/**
 * Extract user mention from message
 * @param {Object} message - Telegram message object
 * @returns {Object|null} User info or null
 */
const extractUserMention = (message) => {
  if (!message.entities || message.entities.length === 0) {
    return null;
  }
  
  const mentionEntity = message.entities.find(
    entity => entity.type === 'mention' || entity.type === 'text_mention'
  );
  
  if (!mentionEntity) {
    return null;
  }
  
  const username = message.text.substring(
    mentionEntity.offset,
    mentionEntity.offset + mentionEntity.length
  );
  
  return {
    username: cleanUsername(username),
    userId: mentionEntity.user?.id?.toString() || null,
  };
};

module.exports = {
  isValidUsername,
  cleanUsername,
  isValidAmount,
  isValidPercentage,
  parseTradeId,
  extractUserMention,
};

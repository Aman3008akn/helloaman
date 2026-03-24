const Trade = require('../models/Trade');

/**
 * Generate a unique trade ID in format #TIDXXXXXX
 * Collision-safe with retry mechanism
 */
const generateUniqueTradeId = async () => {
  const prefix = '#TID';
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    // Generate 6-digit random number
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const tradeId = `${prefix}${randomNum}`;
    
    // Check if this ID already exists in database
    const existing = await Trade.findOne({ tradeId });
    
    if (!existing) {
      return tradeId;
    }
    
    attempts++;
  }
  
  // If we fail after 3 attempts, throw error
  throw new Error('Failed to generate unique trade ID after multiple attempts');
};

module.exports = generateUniqueTradeId;

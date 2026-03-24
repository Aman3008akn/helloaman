const AdminSetting = require('../models/Admin');

/**
 * Fee Service - Handles all fee calculations
 */

/**
 * Get current default fee percentage
 */
const getDefaultFeePercent = async () => {
  const settings = await AdminSetting.getSettings();
  return settings.defaultFeePercent;
};

/**
 * Update global fee percentage
 */
const updateDefaultFee = async (newPercent) => {
  const settings = await AdminSetting.getSettings();
  settings.defaultFeePercent = newPercent;
  await settings.save();
  return newPercent;
};

/**
 * Calculate fee for a given amount
 * Supports tier-based pricing if configured
 */
const calculateFee = (amount, feePercent = null) => {
  if (feePercent === null || feePercent === undefined) {
    // Use default fee percent
    feePercent = process.env.DEFAULT_FEE_PERCENT || 3;
  }
  
  const feeAmount = amount * (feePercent / 100);
  const releaseAmount = amount - feeAmount;
  
  return {
    feePercent,
    feeAmount: parseFloat(feeAmount.toFixed(2)),
    releaseAmount: parseFloat(releaseAmount.toFixed(2)),
  };
};

/**
 * Calculate custom fee for specific trade
 */
const calculateCustomFee = (tradeId, amount, customPercent) => {
  if (customPercent < 0 || customPercent > 100) {
    throw new Error('Invalid fee percentage. Must be between 0 and 100.');
  }
  
  return calculateFee(amount, customPercent);
};

/**
 * Get tiered fee percentage based on amount (optional advanced feature)
 */
const getTieredFeePercent = (amount) => {
  // Example tier structure:
  // < $100: 5%
  // $100 - $500: 3%
  // > $500: 2%
  
  if (amount < 100) {
    return 5;
  } else if (amount <= 500) {
    return 3;
  } else {
    return 2;
  }
};

module.exports = {
  getDefaultFeePercent,
  updateDefaultFee,
  calculateFee,
  calculateCustomFee,
  getTieredFeePercent,
};

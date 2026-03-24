const Trade = require('../models/Trade');
const User = require('../models/User');
const generateUniqueTradeId = require('../utils/tradeIdGenerator');
const { calculateFee } = require('./FeeService');
const { TRADE_STATUS } = require('../utils/constants');

/**
 * Trade Service - Core business logic for trade management
 */

/**
 * Create a new escrow deal
 */
const createDeal = async (params) => {
  const {
    buyer,
    seller,
    escrower,
    amount,
    groupChatId,
    feePercent = null,
  } = params;
  
  // Generate unique trade ID
  const tradeId = await generateUniqueTradeId();
  
  // Calculate fees
  const feeData = calculateFee(amount, feePercent);
  
  // Get auto-cancel timeout
  const autoCancelTimeoutMinutes = parseInt(process.env.AUTO_CANCEL_TIMEOUT_MINUTES) || 120;
  const autoCancelAt = new Date(Date.now() + autoCancelTimeoutMinutes * 60000);
  
  // Create trade
  const trade = await Trade.create({
    tradeId,
    buyer: {
      userId: buyer.userId,
      username: buyer.username,
    },
    seller: {
      userId: seller.userId,
      username: seller.username,
    },
    escrower: {
      userId: escrower.userId,
      username: escrower.username,
    },
    amount,
    feePercent: feeData.feePercent,
    feeAmount: feeData.feeAmount,
    releaseAmount: feeData.releaseAmount,
    status: TRADE_STATUS.WAITING_PAYMENT,
    groupChatId,
    autoCancelAt,
  });
  
  return trade;
};

/**
 * Find trade by ID
 */
const findTradeById = async (tradeId) => {
  return await Trade.findOne({ tradeId }).lean();
};

/**
 * Update trade status with validation
 */
const updateTradeStatus = async (tradeId, newStatus, additionalFields = {}) => {
  const trade = await findTradeById(tradeId);
  
  if (!trade) {
    throw new Error('Trade not found');
  }
  
  // Validate state transitions
  validateStateTransition(trade.status, newStatus);
  
  const updateData = {
    status: newStatus,
    ...additionalFields,
  };
  
  // Set appropriate timestamp based on status
  switch (newStatus) {
    case TRADE_STATUS.PAID:
      updateData['timestamps.paymentAt'] = new Date();
      break;
    case TRADE_STATUS.DELIVERED:
      updateData['timestamps.deliveredAt'] = new Date();
      break;
    case TRADE_STATUS.COMPLETED:
      updateData['timestamps.completedAt'] = new Date();
      break;
    case TRADE_STATUS.CANCELLED:
      updateData['timestamps.cancelledAt'] = new Date();
      break;
  }
  
  const updatedTrade = await Trade.findOneAndUpdate(
    { tradeId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  return updatedTrade;
};

/**
 * Validate state transitions
 */
const validateStateTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [TRADE_STATUS.WAITING_PAYMENT]: [
      TRADE_STATUS.PAID,
      TRADE_STATUS.CANCELLED,
    ],
    [TRADE_STATUS.PAID]: [
      TRADE_STATUS.DELIVERED,
      TRADE_STATUS.DISPUTED,
      TRADE_STATUS.CANCELLED,
    ],
    [TRADE_STATUS.DELIVERED]: [
      TRADE_STATUS.COMPLETED,
      TRADE_STATUS.DISPUTED,
      TRADE_STATUS.CANCELLED,
    ],
    [TRADE_STATUS.DISPUTED]: [
      TRADE_STATUS.COMPLETED,
      TRADE_STATUS.REFUNDED,
      TRADE_STATUS.CANCELLED,
    ],
  };
  
  // Allow some transitions from any state
  if ([TRADE_STATUS.CANCELLED, TRADE_STATUS.COMPLETED, TRADE_STATUS.REFUNDED].includes(newStatus)) {
    return true;
  }
  
  const allowed = validTransitions[currentStatus] || [];
  
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
  }
  
  return true;
};

/**
 * Mark deal as paid
 */
const markAsPaid = async (tradeId) => {
  return await updateTradeStatus(tradeId, TRADE_STATUS.PAID, {});
};

/**
 * Mark deal as delivered
 */
const markAsDelivered = async (tradeId) => {
  return await updateTradeStatus(tradeId, TRADE_STATUS.DELIVERED, {});
};

/**
 * Complete deal and release funds
 */
const completeDeal = async (tradeId) => {
  const trade = await updateTradeStatus(tradeId, TRADE_STATUS.COMPLETED, {});
  
  // Update user stats
  await updateUserStats(trade);
  
  return trade;
};

/**
 * Cancel deal
 */
const cancelDeal = async (tradeId) => {
  const trade = await updateTradeStatus(tradeId, TRADE_STATUS.CANCELLED, {});
  
  // Update user stats
  await updateUserStats(trade);
  
  return trade;
};

/**
 * Open dispute
 */
const openDispute = async (tradeId, reason, disputedBy) => {
  return await updateTradeStatus(tradeId, TRADE_STATUS.DISPUTED, {
    disputeReason: reason,
    disputedBy: {
      userId: disputedBy.userId,
      username: disputedBy.username,
    },
    disputedAt: new Date(),
  });
};

/**
 * Refund deal
 */
const refundDeal = async (tradeId) => {
  const trade = await updateTradeStatus(tradeId, TRADE_STATUS.REFUNDED, {});
  
  // Update user stats
  await updateUserStats(trade);
  
  return trade;
};

/**
 * Update user statistics after trade completion/cancellation
 */
const updateUserStats = async (trade) => {
  try {
    // Update buyer stats
    let buyer = await User.findOne({ userId: trade.buyer.userId });
    if (!buyer) {
      buyer = await User.create({
        userId: trade.buyer.userId,
        username: trade.buyer.username,
      });
    }
    await buyer.updateStats(trade);
    
    // Update seller stats
    let seller = await User.findOne({ userId: trade.seller.userId });
    if (!seller) {
      seller = await User.create({
        userId: trade.seller.userId,
        username: trade.seller.username,
      });
    }
    await seller.updateStats(trade);
  } catch (error) {
    console.error('Error updating user stats:', error);
    // Don't throw - this is not critical to the trade flow
  }
};

/**
 * Get trades by user ID
 */
const getTradesByUserId = async (userId, status = null, limit = 20) => {
  const query = {
    $or: [
      { 'buyer.userId': userId },
      { 'seller.userId': userId },
    ],
  };
  
  if (status) {
    query.status = status;
  }
  
  return await Trade.find(query)
    .sort({ 'timestamps.createdAt': -1 })
    .limit(limit)
    .lean();
};

/**
 * Get pending trades
 */
const getPendingTrades = async () => {
  return await Trade.find({
    status: {
      $in: [
        TRADE_STATUS.WAITING_PAYMENT,
        TRADE_STATUS.PAID,
        TRADE_STATUS.DELIVERED,
      ],
    },
  })
    .sort({ 'timestamps.createdAt': -1 })
    .lean();
};

/**
 * Get all trades with pagination
 */
const getAllTrades = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const trades = await Trade.find()
    .sort({ 'timestamps.createdAt': -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Trade.countDocuments();
  
  return {
    trades,
    total,
    page,
    hasMore: skip + trades.length < total,
  };
};

/**
 * Add proof to trade
 */
const addProof = async (tradeId, proofData) => {
  return await Trade.findOneAndUpdate(
    { tradeId },
    {
      $push: {
        proofs: {
          ...proofData,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  );
};

/**
 * Get expired trades (for auto-cancel)
 */
const getExpiredTrades = async () => {
  const now = new Date();
  
  return await Trade.find({
    autoCancelAt: { $lte: now },
    status: { $in: [TRADE_STATUS.WAITING_PAYMENT, TRADE_STATUS.CREATED] },
  }).lean();
};

module.exports = {
  createDeal,
  findTradeById,
  updateTradeStatus,
  markAsPaid,
  markAsDelivered,
  completeDeal,
  cancelDeal,
  openDispute,
  refundDeal,
  getTradesByUserId,
  getPendingTrades,
  getAllTrades,
  addProof,
  getExpiredTrades,
  updateUserStats,
};

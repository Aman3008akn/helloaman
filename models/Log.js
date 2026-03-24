const mongoose = require('mongoose');

/**
 * Log Schema - Audit trail for all actions
 */
const logSchema = new mongoose.Schema({
  // Type of action
  actionType: {
    type: String,
    required: true,
    enum: [
      'DEAL_CREATED',
      'PAYMENT_CONFIRMED',
      'DELIVERY_MARKED',
      'FUNDS_RELEASED',
      'DEAL_CANCELLED',
      'DISPUTE_OPENED',
      'DEAL_REFUNDED',
      'USER_BLACKLISTED',
      'USER_UNBLACKLISTED',
      'FEE_UPDATED',
      'BROADCAST_SENT',
      'ADMIN_ACTION',
    ],
    index: true,
  },
  
  // User who performed the action
  performedBy: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  
  // Related trade (if applicable)
  targetTradeId: {
    type: String,
    default: null,
    index: true,
  },
  
  // Additional details
  details: {
    type: Object,
    default: {},
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries by user
logSchema.index({ 'performedBy.userId': 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);

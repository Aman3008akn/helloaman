const mongoose = require('mongoose');

/**
 * Trade Schema - Represents an escrow deal/transaction
 * Tracks the complete lifecycle from creation to completion
 */
const tradeSchema = new mongoose.Schema({
  // Unique trade identifier (e.g., #TID847293)
  tradeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Buyer information
  buyer: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  
  // Seller information
  seller: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  
  // Escrower (admin who created the deal)
  escrower: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
  },
  
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  feePercent: {
    type: Number,
    required: true,
    default: 3,
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  releaseAmount: {
    type: Number,
    required: true,
  },
  
  // Deal status
  status: {
    type: String,
    enum: [
      'CREATED',
      'WAITING_PAYMENT',
      'PAID',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
      'DISPUTED',
      'REFUNDED',
    ],
    default: 'CREATED',
    index: true,
  },
  
  // Group chat where deal was created
  groupChatId: {
    type: String,
    required: true,
  },
  
  // Dispute information
  disputeReason: {
    type: String,
    default: null,
  },
  disputedBy: {
    userId: String,
    username: String,
  },
  disputedAt: Date,
  
  // Proof uploads (payment screenshots, delivery proof, etc.)
  proofs: [{
    type: {
      type: String,
      enum: ['payment', 'delivery', 'other'],
      required: true,
    },
    fileId: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  
  // Comprehensive timestamps
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    paymentAt: Date,
    deliveredAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  
  // Auto-cancel timing
  autoCancelAt: {
    type: Date,
    index: true,
  },
  
  // Additional notes
  notes: String,
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Index for efficient queries
tradeSchema.index({ 'buyer.userId': 1, status: 1 });
tradeSchema.index({ 'seller.userId': 1, status: 1 });
tradeSchema.index({ tradeId: 1, status: 1 });

// Static method to generate next trade ID
tradeSchema.statics.generateTradeId = async function() {
  const prefix = '#TID';
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
    const tradeId = `${prefix}${randomNum}`;
    
    // Check if this ID already exists
    const existing = await this.findOne({ tradeId });
    if (!existing) {
      return tradeId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique trade ID after multiple attempts');
};

module.exports = mongoose.model('Trade', tradeSchema);

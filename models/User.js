const mongoose = require('mongoose');

/**
 * User Schema - Tracks user profiles and trading statistics
 */
const userSchema = new mongoose.Schema({
  // Unique Telegram user ID
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Telegram username
  username: {
    type: String,
    required: true,
    index: true,
  },
  
  // Deal statistics
  totalDeals: {
    type: Number,
    default: 0,
  },
  completedDeals: {
    type: Number,
    default: 0,
  },
  cancelledDeals: {
    type: Number,
    default: 0,
  },
  disputedDeals: {
    type: Number,
    default: 0,
  },
  
  // Financial metrics
  totalVolume: {
    type: Number,
    default: 0,
  },
  highestDeal: {
    type: Number,
    default: 0,
  },
  
  // Success rate (calculated field, stored for performance)
  successRate: {
    type: Number,
    default: 0,
  },
  
  // Ranking (updated periodically)
  rank: {
    type: Number,
    default: 0,
  },
  
  // Blacklist status
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for leaderboard queries
userSchema.index({ totalVolume: -1 });
userSchema.index({ completedDeals: -1 });

// Method to update user stats based on completed deal
userSchema.methods.updateStats = async function(trade) {
  this.totalDeals += 1;
  
  if (trade.status === 'COMPLETED') {
    this.completedDeals += 1;
    this.totalVolume += trade.amount;
    
    if (trade.amount > this.highestDeal) {
      this.highestDeal = trade.amount;
    }
  } else if (trade.status === 'CANCELLED') {
    this.cancelledDeals += 1;
  } else if (trade.status === 'DISPUTED') {
    this.disputedDeals += 1;
  }
  
  // Calculate success rate
  if (this.totalDeals > 0 && this.completedDeals > 0) {
    this.successRate = (this.completedDeals / this.totalDeals) * 100;
  }
  
  this.lastActiveAt = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);

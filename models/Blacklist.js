const mongoose = require('mongoose');

/**
 * Blacklist Schema - Tracks banned users
 */
const blacklistSchema = new mongoose.Schema({
  // Telegram user ID
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Username at time of blacklisting
  username: {
    type: String,
    required: true,
  },
  
  // Reason for blacklisting
  reason: {
    type: String,
    default: 'Violation of terms',
  },
  
  // Admin who blacklisted
  blacklistedBy: {
    type: String,
    required: true,
  },
  
  // Timestamp
  blacklistedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Blacklist', blacklistSchema);

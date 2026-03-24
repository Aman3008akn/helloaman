const mongoose = require('mongoose');

/**
 * Admin Settings Schema - Global configuration for the bot
 */
const adminSettingsSchema = new mongoose.Schema({
  // Default fee percentage
  defaultFeePercent: {
    type: Number,
    default: 3,
    min: 0,
    max: 100,
  },
  
  // Auto-cancel timeout in minutes
  autoCancelTimeoutMinutes: {
    type: Number,
    default: 120,
  },
  
  // Reminder interval in minutes
  reminderIntervalMinutes: {
    type: Number,
    default: 30,
  },
  
  // Log channel ID for audit trail
  logChannelId: {
    type: String,
    default: null,
  },
  
  // Role-based access control
  superAdmins: [{
    type: String,
    trim: true,
  }],
  moderators: [{
    type: String,
    trim: true,
  }],
  escrowers: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Static method to get or create default settings
adminSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({
      defaultFeePercent: 3,
      autoCancelTimeoutMinutes: 120,
      reminderIntervalMinutes: 30,
    });
  }
  
  return settings;
};

module.exports = mongoose.model('AdminSetting', adminSettingsSchema);

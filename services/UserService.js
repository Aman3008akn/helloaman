const User = require('../models/User');

/**
 * User Service - Manages user profiles and statistics
 */

/**
 * Get or create user profile
 */
const getOrCreateUser = async (userId, username) => {
  let user = await User.findOne({ userId });
  
  if (!user) {
    user = await User.create({
      userId,
      username,
    });
  } else {
    // Update username if changed
    if (user.username !== username) {
      user.username = username;
      await user.save();
    }
  }
  
  return user;
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  return await User.findOne({ userId }).lean();
};

/**
 * Get user by username
 */
const getUserByUsername = async (username) => {
  const cleanUsername = username.replace('@', '');
  return await User.findOne({ username: cleanUsername }).lean();
};

/**
 * Update user last active timestamp
 */
const updateLastActive = async (userId) => {
  await User.findOneAndUpdate(
    { userId },
    { lastActiveAt: new Date() }
  );
};

/**
 * Get leaderboard (top users by volume)
 */
const getLeaderboard = async (limit = 10) => {
  return await User.find({
    totalVolume: { $gt: 0 },
    isBlacklisted: false,
  })
    .sort({ totalVolume: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get user rank by volume
 */
const getUserRank = async (userId) => {
  const user = await User.findOne({ userId });
  
  if (!user) {
    return null;
  }
  
  const rank = await User.countDocuments({
    totalVolume: { $gt: user.totalVolume },
  }) + 1;
  
  return rank;
};

/**
 * Get all users count
 */
const getTotalUsersCount = async () => {
  return await User.countDocuments();
};

/**
 * Get blacklisted users count
 */
const getBlacklistedCount = async () => {
  return await User.countDocuments({ isBlacklisted: true });
};

/**
 * Mark user as blacklisted
 */
const blacklistUser = async (userId, username, reason, blacklistedBy) => {
  await User.findOneAndUpdate(
    { userId },
    { isBlacklisted: true }
  );
  
  // Also create blacklist record
  const Blacklist = require('../models/Blacklist');
  await Blacklist.create({
    userId,
    username,
    reason,
    blacklistedBy,
  });
};

/**
 * Remove user from blacklist
 */
const unblacklistUser = async (userId) => {
  await User.findOneAndUpdate(
    { userId },
    { isBlacklisted: false }
  );
  
  // Remove from blacklist collection
  const Blacklist = require('../models/Blacklist');
  await Blacklist.deleteOne({ userId });
};

/**
 * Check if user is blacklisted
 */
const isUserBlacklisted = async (userId) => {
  const user = await User.findOne({ userId });
  return user?.isBlacklisted || false;
};

module.exports = {
  getOrCreateUser,
  getUserById,
  getUserByUsername,
  updateLastActive,
  getLeaderboard,
  getUserRank,
  getTotalUsersCount,
  getBlacklistedCount,
  blacklistUser,
  unblacklistUser,
  isUserBlacklisted,
};

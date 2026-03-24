const { checkRateLimit } = require('../config/redis');
const UserService = require('../services/UserService');
const { errorTemplate } = require('../utils/messageTemplates');

/**
 * Rate Limiting Middleware
 * Limits requests per user using Redis
 */
const rateLimiter = async (ctx, next) => {
  const userId = ctx.from?.id?.toString();
  
  if (!userId) {
    return await next();
  }
  
  // Check rate limit (10 requests per 60 seconds)
  const limit = await checkRateLimit(userId, 10, 60);
  
  if (!limit.allowed) {
    const message = errorTemplate(
      'Rate limit exceeded. Please slow down.',
      `Please wait ${limit.retryAfter} seconds before trying again.`
    );
    
    await ctx.reply(message);
    return;
  }
  
  await next();
};

/**
 * Blacklist Check Middleware
 * Prevents blacklisted users from using the bot
 */
const blacklistCheck = async (ctx, next) => {
  const userId = ctx.from?.id?.toString();
  const username = ctx.from?.username;
  
  if (!userId) {
    return await next();
  }
  
  try {
    const isBlacklisted = await UserService.isUserBlacklisted(userId);
    
    if (isBlacklisted) {
      await ctx.reply(
        '🚫 You have been blacklisted from using this bot.\n\nContact an admin if you believe this is a mistake.'
      );
      return;
    }
  } catch (error) {
    console.error('Blacklist check error:', error);
    // Fail open - allow user through if check fails
  }
  
  await next();
};

/**
 * Update last active timestamp
 */
const updateActivity = async (ctx, next) => {
  const userId = ctx.from?.id?.toString();
  const username = ctx.from?.username;
  
  if (userId && username) {
    try {
      await UserService.updateLastActive(userId);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }
  
  await next();
};

module.exports = {
  rateLimiter,
  blacklistCheck,
  updateActivity,
};

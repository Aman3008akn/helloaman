const AdminSetting = require('../models/Admin');
const { ROLES } = require('../utils/constants');

/**
 * Security Service - Role-based access control and authorization
 */

/**
 * Get user's role/permission level
 */
const getUserRole = async (username, userId = null) => {
  const cleanUsername = username ? username.replace('@', '').toLowerCase() : null;
  
  // Check environment variables first (support both usernames and numeric IDs)
  const superAdmins = (process.env.SUPER_ADMINS || '').split(',').map(u => u.toLowerCase().trim());
  const moderators = (process.env.MODERATORS || '').split(',').map(u => u.toLowerCase().trim());
  const escrowers = (process.env.ESCROWERS || '').split(',').map(u => u.toLowerCase().trim());
  
  // Check if user ID or username matches any admin list
  if (superAdmins.includes(cleanUsername) || (userId && superAdmins.includes(userId.toString()))) {
    return ROLES.SUPER_ADMIN;
  }
  
  if (moderators.includes(cleanUsername) || (userId && moderators.includes(userId.toString()))) {
    return ROLES.MODERATOR;
  }
  
  if (escrowers.includes(cleanUsername) || (userId && escrowers.includes(userId.toString()))) {
    return ROLES.ESCROWER;
  }
  
  // Check database settings
  try {
    const settings = await AdminSetting.getSettings();
    
    if (settings.superAdmins.some(u => u.toLowerCase() === cleanUsername)) {
      return ROLES.SUPER_ADMIN;
    }
    
    if (settings.moderators.some(u => u.toLowerCase() === cleanUsername)) {
      return ROLES.MODERATOR;
    }
    
    if (settings.escrowers.some(u => u.toLowerCase() === cleanUsername)) {
      return ROLES.ESCROWER;
    }
  } catch (error) {
    console.error('Error checking user role:', error);
  }
  
  return ROLES.USER;
};

/**
 * Check if user is admin (any level)
 */
const isAdmin = async (username) => {
  const role = await getUserRole(username);
  return [ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.ESCROWER].includes(role);
};

/**
 * Check if user is super admin
 */
const isSuperAdmin = async (username) => {
  const role = await getUserRole(username);
  return role === ROLES.SUPER_ADMIN;
};

/**
 * Check if user can execute specific command
 */
const canExecuteCommand = async (username, command, trade = null) => {
  const role = await getUserRole(username);
  
  // Super admins can do everything
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // Define command permissions by role
  const moderatorCommands = [
    '/add', '/paid', '/deliver', '/release', '/cancel', '/dispute',
    '/alltrades', '/pending', '/stats', '/blacklist',
  ];
  
  const escrowerCommands = [
    '/add', '/paid', '/deliver', '/release', '/cancel', '/dispute',
  ];
  
  const superAdminOnlyCommands = [
    '/setfee', '/setcustomfee', '/unblacklist', '/broadcast',
  ];
  
  // Check super-admin-only commands
  if (superAdminOnlyCommands.includes(command)) {
    return false;
  }
  
  // Check moderator commands
  if (moderatorCommands.includes(command)) {
    return role === ROLES.MODERATOR || role === ROLES.SUPER_ADMIN;
  }
  
  // Check escrower commands
  if (escrowerCommands.includes(command)) {
    return [ROLES.ESCROWER, ROLES.MODERATOR, ROLES.SUPER_ADMIN].includes(role);
  }
  
  // Default: allow
  return true;
};

/**
 * Middleware to protect admin commands
 */
const requireAdmin = async (ctx, next) => {
  const username = ctx.from?.username;
  
  if (!username) {
    await ctx.reply('❌ Error: Username not found. Please set a Telegram username.');
    return;
  }
  
  const admin = await isAdmin(username);
  
  if (!admin) {
    await ctx.reply('🚫 You do not have permission to use this command.\n\nOnly admins can execute this action.');
    return;
  }
  
  await next();
};

/**
 * Middleware to require super admin
 */
const requireSuperAdmin = async (ctx, next) => {
  const username = ctx.from?.username;
  
  if (!username) {
    await ctx.reply('❌ Error: Username not found. Please set a Telegram username.');
    return;
  }
  
  const superAdmin = await isSuperAdmin(username);
  
  if (!superAdmin) {
    await ctx.reply('🚫 You do not have permission to use this command.\n\nOnly super admins can execute this action.');
    return;
  }
  
  await next();
};

module.exports = {
  getUserRole,
  isAdmin,
  isSuperAdmin,
  canExecuteCommand,
  requireAdmin,
  requireSuperAdmin,
};

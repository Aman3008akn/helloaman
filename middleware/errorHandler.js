const { logToDatabase } = require('../utils/logger');

/**
 * Error Handler Middleware
 * Catches and handles all errors gracefully
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error occurred:', error);
    
    // Log error to database
    try {
      await logToDatabase({
        actionType: 'ADMIN_ACTION',
        performedBy: {
          userId: ctx.from?.id?.toString() || 'unknown',
          username: ctx.from?.username || 'unknown',
        },
        details: {
          error: error.message,
          stack: error.stack,
          command: ctx.message?.text,
        },
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    // Send user-friendly error message
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('not found')) {
      await ctx.reply(
        '❌ The requested item was not found.\n\nPlease check your input and try again.'
      );
    } else if (errorMessage.includes('permission') || errorMessage.includes('authorized')) {
      await ctx.reply(
        '🚫 You do not have permission to perform this action.\n\nContact an admin if you need access.'
      );
    } else if (errorMessage.includes('transition')) {
      await ctx.reply(
        '⚠️ This action cannot be performed in the current state of the trade.\n\nPlease check the trade status and try again.'
      );
    } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      await ctx.reply(
        '⚠️ A duplicate entry already exists.\n\nThis action has already been performed.'
      );
    } else {
      await ctx.reply(
        `❌ An error occurred while processing your request.\n\nError: ${error.message}\n\nPlease try again or contact support if the issue persists.`
      );
    }
  }
};

module.exports = errorHandler;

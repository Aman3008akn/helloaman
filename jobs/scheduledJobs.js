const cron = require('node-cron');
const TradeService = require('../services/TradeService');
const NotificationService = require('../services/NotificationService');
const { TRADE_STATUS } = require('../utils/constants');

/**
 * Scheduled Jobs - Automation using node-cron
 */

let botInstance = null;

/**
 * Initialize all scheduled jobs
 */
const initializeScheduledJobs = (bot) => {
  botInstance = bot;
  
  // Job 1: Check for expired trades every 5 minutes
  // Auto-cancel trades that haven't been paid within timeout period
  cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Running auto-cancel check...');
    await checkAndCancelExpiredTrades();
  });
  
  // Job 2: Send payment reminders every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏰ Running payment reminder check...');
    await sendPaymentReminders();
  });
  
  // Job 3: Send delivery reminders every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running delivery reminder check...');
    await sendDeliveryReminders();
  });
  
  console.log('✅ Scheduled jobs initialized');
};

/**
 * Check and cancel expired trades
 */
const checkAndCancelExpiredTrades = async () => {
  try {
    const expiredTrades = await TradeService.getExpiredTrades();
    
    if (expiredTrades.length === 0) {
      return;
    }
    
    console.log(`Found ${expiredTrades.length} expired trades to cancel`);
    
    const notificationService = new NotificationService(botInstance);
    
    for (const trade of expiredTrades) {
      try {
        // Cancel the trade
        await TradeService.cancelDeal(trade.tradeId);
        
        // Notify parties
        await notificationService.notifyDealCancelled(trade);
        
        console.log(`Auto-cancelled trade ${trade.tradeId}`);
      } catch (error) {
        console.error(`Failed to cancel trade ${trade.tradeId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in auto-cancel job:', error);
  }
};

/**
 * Send payment reminders for pending trades
 */
const sendPaymentReminders = async () => {
  try {
    const pendingTrades = await TradeService.getPendingTrades();
    
    const waitingPayment = pendingTrades.filter(
      t => t.status === TRADE_STATUS.WAITING_PAYMENT
    );
    
    if (waitingPayment.length === 0) {
      return;
    }
    
    console.log(`Sending ${waitingPayment.length} payment reminders`);
    
    const notificationService = new NotificationService(botInstance);
    
    for (const trade of waitingPayment) {
      try {
        // Only send reminder if trade is not too old (within first 24 hours)
        const ageInHours = (Date.now() - new Date(trade.timestamps.createdAt)) / (1000 * 60 * 60);
        
        if (ageInHours < 24) {
          await notificationService.sendPaymentReminder(trade);
        }
      } catch (error) {
        console.error(`Failed to send payment reminder for ${trade.tradeId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in payment reminder job:', error);
  }
};

/**
 * Send delivery reminders for paid trades
 */
const sendDeliveryReminders = async () => {
  try {
    const pendingTrades = await TradeService.getPendingTrades();
    
    const paidTrades = pendingTrades.filter(
      t => t.status === TRADE_STATUS.PAID
    );
    
    if (paidTrades.length === 0) {
      return;
    }
    
    console.log(`Sending ${paidTrades.length} delivery reminders`);
    
    const notificationService = new NotificationService(botInstance);
    
    for (const trade of paidTrades) {
      try {
        // Only send reminder if payment was made more than 2 hours ago
        const paymentAgeInHours = trade.timestamps.paymentAt 
          ? (Date.now() - new Date(trade.timestamps.paymentAt)) / (1000 * 60 * 60)
          : 999;
        
        if (paymentAgeInHours > 2 && paymentAgeInHours < 48) {
          await notificationService.sendDeliveryReminder(trade);
        }
      } catch (error) {
        console.error(`Failed to send delivery reminder for ${trade.tradeId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in delivery reminder job:', error);
  }
};

module.exports = {
  initializeScheduledJobs,
};

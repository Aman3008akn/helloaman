const {
  dealCreatedTemplate,
  paymentConfirmedTemplate,
  deliveryConfirmedTemplate,
  dealCompletedTemplate,
  dealCancelledTemplate,
  disputeOpenedTemplate,
} = require('../utils/messageTemplates');

/**
 * Notification Service - Handles all user notifications and log channel updates
 */

class NotificationService {
  constructor(bot) {
    this.bot = bot;
    this.logChannelId = process.env.LOG_CHANNEL_ID;
  }

  /**
   * Send message to user (private DM)
   */
  async sendDM(userId, message) {
    try {
      // Use Markdown for template messages containing bold formatting
      const hasMarkdown = message.includes('*') || message.includes('_');
      
      const options = {
        disable_web_page_preview: true,
      };
      
      if (hasMarkdown) {
        options.parse_mode = 'Markdown';
      }
      
      await this.bot.sendMessage(userId, message, options);
    } catch (error) {
      console.error(`Failed to send DM to ${userId}:`, error.message);
      // User might have blocked the bot
    }
  }

  /**
   * Send message to group
   */
  async sendToGroup(chatId, message, options = {}) {
    try {
      await this.bot.sendMessage(chatId, message, {
        disable_web_page_preview: true,
        ...options,
      });
    } catch (error) {
      console.error(`Failed to send to group ${chatId}:`, error.message);
    }
  }

  /**
   * Forward message to log channel
   */
  async logToChannel(message, extraData = null) {
    if (!this.logChannelId) {
      return; // Skip if no log channel configured
    }

    try {
      let fullMessage = message;
      
      if (extraData) {
        fullMessage += `\n\n📎 Details:\n${JSON.stringify(extraData, null, 2)}`;
      }

      await this.bot.sendMessage(this.logChannelId, fullMessage, {
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error('Failed to send to log channel:', error.message);
    }
  }

  /**
   * Notify on deal creation
   */
  async notifyDealCreated(trade) {
    const message = dealCreatedTemplate(trade);
    
    // Notify buyer
    await this.sendDM(trade.buyer.userId, message);
    
    // Notify seller
    await this.sendDM(trade.seller.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `🆕 NEW DEAL CREATED\n\nTrade ID: ${trade.tradeId}\nBuyer: @${trade.buyer.username}\nSeller: @${trade.seller.username}\nAmount: ₹${trade.amount}`,
      { tradeId: trade.tradeId }
    );
  }

  /**
   * Notify on payment confirmation
   */
  async notifyPaymentConfirmed(trade) {
    const message = paymentConfirmedTemplate(trade);
    
    // Notify seller
    await this.sendDM(trade.seller.userId, message);
    
    // Notify buyer
    await this.sendDM(trade.buyer.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `💰 PAYMENT CONFIRMED\n\nTrade ID: ${trade.tradeId}`,
      { tradeId: trade.tradeId }
    );
  }

  /**
   * Notify on delivery confirmation
   */
  async notifyDeliveryConfirmed(trade) {
    const message = deliveryConfirmedTemplate(trade);
    
    // Notify seller
    await this.sendDM(trade.seller.userId, message);
    
    // Notify buyer
    await this.sendDM(trade.buyer.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `📦 DELIVERY CONFIRMED\n\nTrade ID: ${trade.tradeId}`,
      { tradeId: trade.tradeId }
    );
  }

  /**
   * Notify on deal completion
   */
  async notifyDealCompleted(trade) {
    const message = dealCompletedTemplate(trade);
    
    // Notify both parties
    await this.sendDM(trade.buyer.userId, message);
    await this.sendDM(trade.seller.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `✅ DEAL COMPLETED\n\nTrade ID: ${trade.tradeId}\nAmount: ₹${trade.amount}\nFee: ₹${trade.feeAmount}`,
      { tradeId: trade.tradeId }
    );
  }

  /**
   * Notify on deal cancellation
   */
  async notifyDealCancelled(trade) {
    const message = dealCancelledTemplate(trade);
    
    // Notify both parties
    await this.sendDM(trade.buyer.userId, message);
    await this.sendDM(trade.seller.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `❌ DEAL CANCELLED\n\nTrade ID: ${trade.tradeId}`,
      { tradeId: trade.tradeId }
    );
  }

  /**
   * Notify on dispute opened
   */
  async notifyDisputeOpened(trade) {
    const message = disputeOpenedTemplate(trade);
    
    // Notify both parties
    await this.sendDM(trade.buyer.userId, message);
    await this.sendDM(trade.seller.userId, message);
    
    // Log to channel
    await this.logToChannel(
      `⚠️ DISPUTE OPENED\n\nTrade ID: ${trade.tradeId}\nReason: ${trade.disputeReason}`,
      { tradeId: trade.tradeId, reason: trade.disputeReason }
    );
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(trade) {
    const message = `⏰ PAYMENT REMINDER

Dear @${trade.buyer.username},

This is a friendly reminder that payment for deal *${trade.tradeId}* is still pending.

*Amount:* ₹${trade.amount}
*Status:* Waiting Payment

Please complete the payment as soon as possible to avoid automatic cancellation.

Use /trade ${trade.tradeId} to view deal details.`;

    await this.sendDM(trade.buyer.userId, message);
  }

  /**
   * Send delivery reminder
   */
  async sendDeliveryReminder(trade) {
    const message = `⏰ DELIVERY REMINDER

Dear @${trade.seller.username},

This is a friendly reminder that delivery for deal *${trade.tradeId}* is pending.

The buyer has made payment and is waiting for your delivery.

Please mark the deal as delivered using /deliver ${trade.tradeId}`;

    await this.sendDM(trade.seller.userId, message);
  }
}

module.exports = NotificationService;

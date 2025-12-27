import axios from 'axios';
import config from '../config/config.js';

class WhatsAppService {
  constructor() {
    this.apiUrl = `https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`;
    this.messageLogs = [];
  }

  async sendMessage(to, message) {
    if (!config.whatsapp.apiToken || !config.whatsapp.phoneNumberId) {
      console.log('⚠️ WhatsApp API credentials not configured');
      this.addLog(to, message, 'failed', 'WhatsApp not configured');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${config.whatsapp.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Message sent to ${to}`);
      this.addLog(to, message, 'sent', null, response.data.messages[0]?.id);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Failed to send message to ${to}:`, error.message);
      this.addLog(to, message, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  addLog(to, message, status, error = null, messageId = null) {
    this.messageLogs.unshift({
      id: Date.now() + Math.random(),
      to,
      message,
      status,
      error,
      messageId,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 1000 logs
    if (this.messageLogs.length > 1000) {
      this.messageLogs = this.messageLogs.slice(0, 1000);
    }
  }

  getMessageLogs(limit = 100) {
    return this.messageLogs.slice(0, limit);
  }

  clearLogs() {
    this.messageLogs = [];
  }

  formatMessage(teacher, student, date, time) {
    return `Hello! This is a reminder about your scheduled meeting:

👨‍🏫 Teacher: ${teacher}
👨‍🎓 Student: ${student}
📅 Date: ${date}
🕐 Time: ${time}

Please be on time. Thank you!`;
  }
}

export default new WhatsAppService();

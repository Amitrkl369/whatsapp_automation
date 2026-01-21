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

  async sendTemplateMessage(to, templateName, languageCode, parameters = [], header = null) {
    if (!config.whatsapp.apiToken || !config.whatsapp.phoneNumberId) {
      console.log('⚠️ WhatsApp API credentials not configured');
      this.addLog(to, `Template: ${templateName}`, 'failed', 'WhatsApp not configured');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      // Only add components if needed
      const components = [];
      // Add header if provided (for templates with header)
      if (header) {
        components.push({
          type: 'header',
          parameters: [{ type: 'text', text: header }]
        });
      }
      // Add body parameters if provided
      if (parameters.length > 0) {
        components.push({
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        });
      }
      if (components.length > 0) {
        payload.template.components = components;
      }

      const response = await axios.post(
        this.apiUrl,
        payload,
        {
          headers: {
            Authorization: `Bearer ${config.whatsapp.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Template message sent to ${to}`);
      this.addLog(to, `Template: ${templateName}`, 'sent', null, response.data.messages[0]?.id);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Failed to send template to ${to}:`, error.response?.data || error.message);
      this.addLog(to, `Template: ${templateName}`, 'failed', error.response?.data?.error?.message || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async sendTeacherReminder(to, teacherName) {
    // Teacher template: "Hi {{1}}, just a quick reminder about your session today. Could you please confirm?"
    const templateName = config.whatsapp.teacherTemplate;
    const language = config.whatsapp.templateLanguage;
    
    if (templateName === 'hello_world') {
      // Fallback to hello_world if custom template not created yet
      console.log('⚠️ Using hello_world template. Create teacher_reminder template in Meta Business Manager');
      return this.sendTemplateMessage(to, templateName, language);
    }
    
    return this.sendTemplateMessage(to, templateName, language, [teacherName]);
  }

  async sendStudentReminder(to, date, time) {
    // Student template: "Hi ma'am, Just a quick reminder about today's class at {{1}} {{2}} IST. Looking forward to seeing you in the session!"
    const templateName = config.whatsapp.studentTemplate;
    const language = config.whatsapp.templateLanguage;
    
    if (templateName === 'hello_world') {
      // Fallback to hello_world if custom template not created yet
      console.log('⚠️ Using hello_world template. Create student_reminder template in Meta Business Manager');
      return this.sendTemplateMessage(to, templateName, language);
    }
    
    return this.sendTemplateMessage(to, templateName, language, [date, time]);
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

  updateMessageStatus(messageId, status) {
    const log = this.messageLogs.find(l => l.messageId === messageId);
    if (log) {
      log.status = status;
      log.lastUpdated = new Date().toISOString();
      console.log(`📊 Updated message ${messageId} status to: ${status}`);
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

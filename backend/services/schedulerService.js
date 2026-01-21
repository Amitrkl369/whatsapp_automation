import cron from 'node-cron';
import googleSheetsService from './googleSheetsService.js';
import whatsappService from './whatsappService.js';
import databaseService from './databaseService.js';
import config from '../config/config.js';

class SchedulerService {
  constructor() {
    this.isRunning = false;
    this.lastSync = null;
    this.lastCheck = null;
    this.messagesSent = 0;
    this.messagesFailed = 0;
    this.syncTask = null;
    this.checkTask = null;
    this.activeReminders = new Map(); // Track active setTimeout IDs
  }
  /**
   * Add a new meeting with automated reminders
   */
  async addMeeting({ teacherId, teacherName, teacherPhone, studentId, studentName, studentPhone, date, time, reminderTime }) {
    const meeting = databaseService.addMeeting({
      teacherId,
      teacherName,
      teacherPhone,
      studentId,
      studentName,
      studentPhone,
      date,
      time,
      reminderTime: reminderTime || 120, // Default 2 hours (120 minutes)
      status: 'scheduled',
      reminderSent: false
    });
    
    // Schedule automatic reminders based on custom time
    this.scheduleReminder(meeting);
    
    return meeting;
  }

  /**
   * Schedule automated reminder at custom time before the meeting
   */
  scheduleReminder(meeting) {
    console.log(`📥 Received meeting time: "${meeting.time}"`);
    console.log(`📥 Received meeting date: "${meeting.date}"`);
    console.log(`⏰ Reminder will be sent ${meeting.reminderTime || 120} minutes before`);
    
    // Parse time in 24-hour format (e.g., "15:30") or 12-hour format (e.g., "3:30pm")
    const parseTime = (timeStr) => {
      // Try 24-hour format first (HH:MM)
      const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (match24) {
        const hours = parseInt(match24[1]);
        const minutes = parseInt(match24[2]);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          console.log(`🔍 Parsed 24-hour time: ${hours}:${minutes}`);
          return { hours, minutes };
        }
      }
      
      // Try 12-hour format (h:MMam/pm)
      const match12 = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)/i);
      if (match12) {
        let hours = parseInt(match12[1]);
        const minutes = parseInt(match12[2]);
        const isPM = match12[3].toLowerCase() === 'pm';
        
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        console.log(`🔍 Parsed 12-hour time: ${hours}:${minutes} (isPM: ${isPM})`);
        return { hours, minutes };
      }
      
      return null;
    };

    const time = parseTime(meeting.time);
    if (!time) {
      console.log(`❌ Invalid time format: ${meeting.time}`);
      return;
    }

    const meetingDateTime = new Date(meeting.date);
    meetingDateTime.setHours(time.hours, time.minutes, 0, 0);
    
    // Calculate reminder time using custom reminderTime (in minutes)
    const reminderMinutes = meeting.reminderTime || 120; // Default to 2 hours
    const reminderTime = new Date(meetingDateTime.getTime() - (reminderMinutes * 60 * 1000));
    const now = new Date();

    console.log(`📅 Meeting scheduled for: ${meetingDateTime.toLocaleString()}`);
    console.log(`⏰ Reminder will trigger at: ${reminderTime.toLocaleString()}`);
    console.log(`🕐 Current time: ${now.toLocaleString()}`);

    if (reminderTime > now) {
      const delay = reminderTime - now;
      console.log(`⏳ Delay until reminder: ${Math.round(delay / 1000)} seconds`);
      
      const timeoutId = setTimeout(async () => {
        await this.sendAutomatedReminders(meeting);
      }, delay);
      
      // Store the timeout ID so we can cancel it if needed
      this.activeReminders.set(meeting.id, timeoutId);

      const reminderTimeText = reminderMinutes >= 60 
        ? `${reminderMinutes / 60} hour${reminderMinutes / 60 > 1 ? 's' : ''}`
        : `${reminderMinutes} minutes`;
      console.log(`⏰ Reminder scheduled for ${meeting.teacherName} & ${meeting.studentName} at ${reminderTime.toLocaleString()} (${reminderTimeText} before meeting)`);
    } else {
      // If reminder time already passed, send immediately
      console.log(`⏰ Sending reminder immediately for ${meeting.teacherName} & ${meeting.studentName}`);
      this.sendAutomatedReminders(meeting);
    }
  }

  /**
   * Send automated reminders to teacher and student
   */
  async sendAutomatedReminders(meeting) {
    try {
      const meetingDate = new Date(meeting.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });

      // Send template message to teacher
      console.log(`📤 Sending template to teacher: ${meeting.teacherName} (${meeting.teacherPhone})`);
      await whatsappService.sendTeacherReminder(meeting.teacherPhone, meeting.teacherName);
      console.log(`✅ Reminder sent to teacher: ${meeting.teacherName}`);

      // Send template message to student
      console.log(`📤 Sending template to student: ${meeting.studentName} (${meeting.studentPhone})`);
      await whatsappService.sendStudentReminder(meeting.studentPhone, meetingDate, meeting.time);
      console.log(`✅ Reminder sent to student: ${meeting.studentName}`);

      // Update meeting status in database
      databaseService.updateMeetingStatus(meeting.id, 'reminded', true);
      
      // Remove from active reminders
      this.activeReminders.delete(meeting.id);

      this.messagesSent += 2;
    } catch (error) {
      console.error(`❌ Failed to send reminders for meeting ${meeting.id}:`, error.message);
      this.messagesFailed += 2;
    }
  }

  /**
   * Get all meetings
   */
  async getMeetings() {
    return databaseService.getAllMeetings();
  }

  /**
   * Start the scheduler
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    console.log('🚀 Starting scheduler...');
    
    // Schedule message checking (every minute)
    const checkCron = `*/${config.scheduler.checkInterval} * * * *`;
    this.checkTask = cron.schedule(checkCron, async () => {
      await this.checkAndSendMessages();
    });

    // Schedule sheet sync (every 5 minutes or configured interval)
    const syncCron = `*/${config.scheduler.syncInterval} * * * *`;
    this.syncTask = cron.schedule(syncCron, async () => {
      await this.syncSheet();
    });

    this.isRunning = true;
    console.log(`✅ Scheduler started (Check: every ${config.scheduler.checkInterval}min, Sync: every ${config.scheduler.syncInterval}min)`);
    
    // Restore pending reminders from database
    await this.restorePendingReminders();
    
    // Run initial check immediately
    this.checkAndSendMessages();
  }

  /**
   * Restore pending reminders from database on server restart
   */
  async restorePendingReminders() {
    try {
      const pendingMeetings = databaseService.getPendingMeetings();
      console.log(`🔄 Restoring ${pendingMeetings.length} pending reminder(s)...`);
      
      for (const meeting of pendingMeetings) {
        this.scheduleReminder(meeting);
      }
      
      console.log(`✅ Restored ${pendingMeetings.length} pending reminder(s)`);
    } catch (error) {
      console.error('❌ Error restoring pending reminders:', error.message);
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Scheduler is not running');
      return;
    }

    if (this.checkTask) {
      this.checkTask.stop();
    }
    if (this.syncTask) {
      this.syncTask.stop();
    }

    this.isRunning = false;
    console.log('🛑 Scheduler stopped');
  }

  /**
   * Check for pending messages and send them
   */
  async checkAndSendMessages() {
    try {
      console.log('🔍 Checking for messages to send...');
      this.lastCheck = new Date();

      const pendingMessages = await googleSheetsService.getPendingMessages();
      
      if (pendingMessages.length === 0) {
        console.log('✅ No messages to send at this time');
        return;
      }

      console.log(`📤 Found ${pendingMessages.length} message(s) to send`);

      for (const message of pendingMessages) {
        await this.processMessage(message);
      }

      console.log(`✅ Processed ${pendingMessages.length} message(s)`);
    } catch (error) {
      console.error('❌ Error in checkAndSendMessages:', error.message);
    }
  }

  /**
   * Process a single message
   * @param {Object} messageData - Message data from Google Sheet
   */
  async processMessage(messageData) {
    try {
      const { 
        rowIndex, 
        phone_number, 
        message, 
        teacher_name, 
        student_name,
        meeting_date,
        meeting_time 
      } = messageData;

      console.log(`📨 Processing message for ${student_name} (${phone_number})`);

      // Validate phone number
      if (!whatsappService.validatePhoneNumber(phone_number)) {
        console.error(`❌ Invalid phone number: ${phone_number}`);
        await googleSheetsService.updateRowStatus(rowIndex, 'Failed', new Date().toISOString());
        this.messagesFailed++;
        return;
      }

      // Format message with data
      const formattedMessage = whatsappService.formatMessage(message, {
        teacher_name,
        student_name,
        meeting_date,
        meeting_time,
      });

      // Send WhatsApp message with retry
      const result = await whatsappService.sendMessageWithRetry(
        phone_number, 
        formattedMessage,
        3 // Max retries
      );

      if (result.success) {
        // Update status to "Sent"
        await googleSheetsService.updateRowStatus(rowIndex, 'Sent', new Date().toISOString());
        this.messagesSent++;
        console.log(`✅ Message sent successfully to ${phone_number}`);
      } else {
        // Update status to "Failed"
        await googleSheetsService.updateRowStatus(rowIndex, 'Failed', new Date().toISOString());
        this.messagesFailed++;
        console.error(`❌ Failed to send message to ${phone_number}`);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
      
      // Update status to "Failed"
      try {
        await googleSheetsService.updateRowStatus(messageData.rowIndex, 'Failed', new Date().toISOString());
        this.messagesFailed++;
      } catch (updateError) {
        console.error('❌ Failed to update status:', updateError.message);
      }
    }
  }

  /**
   * Sync sheet data (refresh cache)
   */
  async syncSheet() {
    try {
      console.log('🔄 Syncing Google Sheet data...');
      this.lastSync = new Date();
      
      // Just trigger a read to refresh any caches
      await googleSheetsService.readSheet();
      
      console.log('✅ Sheet sync completed');
    } catch (error) {
      console.error('❌ Error syncing sheet:', error.message);
    }
  }

  /**
   * Manual trigger for checking messages
   */
  async triggerCheck() {
    console.log('🔄 Manual trigger: Checking messages...');
    await this.checkAndSendMessages();
  }

  /**
   * Manual trigger for syncing sheet
   */
  async triggerSync() {
    console.log('🔄 Manual trigger: Syncing sheet...');
    await this.syncSheet();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      lastCheck: this.lastCheck,
      messagesSent: this.messagesSent,
      messagesFailed: this.messagesFailed,
      checkInterval: `${config.scheduler.checkInterval} minute(s)`,
      syncInterval: `${config.scheduler.syncInterval} minute(s)`,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.messagesSent = 0;
    this.messagesFailed = 0;
    console.log('🔄 Statistics reset');
  }
}

export default new SchedulerService();

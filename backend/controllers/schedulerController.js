import schedulerService from '../services/schedulerService.js';
import whatsappService from '../services/whatsappService.js';
/**
 * Schedule a new meeting
 */
export const scheduleMeeting = async (req, res) => {
  try {
    const { teacherId, teacherName, teacherPhone, studentId, studentName, studentPhone, date, time, reminderTime } = req.body;
    
    // Validate required fields
    if (!teacherName || !studentName || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const meeting = await schedulerService.addMeeting({ 
      teacherId,
      teacherName, 
      teacherPhone,
      studentId,
      studentName, 
      studentPhone, 
      date, 
      time,
      reminderTime: reminderTime || 120 // Default 2 hours if not provided
    });
    
    res.json({ success: true, meeting });
  } catch (error) {
    console.error('❌ Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule meeting', error: error.message });
  }
};

/**
 * Get all scheduled meetings
 */
export const getMeetings = async (req, res) => {
  try {
    const meetings = await schedulerService.getMeetings();
    res.json({ success: true, meetings });
  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: error.message });
  }
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = (req, res) => {
  try {
    const status = schedulerService.getStatus();
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('❌ Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduler status',
      error: error.message,
    });
  }
};

/**
 * Manually trigger message check
 */
export const triggerCheck = async (req, res) => {
  try {
    await schedulerService.triggerCheck();
    
    res.json({
      success: true,
      message: 'Message check triggered successfully',
      data: {
        triggeredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error triggering check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger message check',
      error: error.message,
    });
  }
};

/**
 * Get message logs
 */
export const getMessageLogs = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = whatsappService.getMessageLogs(limit);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('❌ Error getting message logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message logs',
      error: error.message,
    });
  }
};

/**
 * Clear message logs
 */
export const clearMessageLogs = (req, res) => {
  try {
    whatsappService.clearMessageLogs();
    
    res.json({
      success: true,
      message: 'Message logs cleared successfully',
    });
  } catch (error) {
    console.error('❌ Error clearing message logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear message logs',
      error: error.message,
    });
  }
};

/**
 * Check WhatsApp API health
 */
export const checkWhatsAppHealth = async (req, res) => {
  try {
    const health = await whatsappService.checkHealth();
    
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('❌ Error checking WhatsApp health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check WhatsApp API health',
      error: error.message,
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const status = schedulerService.getStatus();
    const meetings = await schedulerService.getMeetings();
    const logs = whatsappService.getMessageLogs(1000);
    
    // Calculate stats from meetings
    const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;
    const remindedMeetings = meetings.filter(m => m.status === 'reminded').length;
    
    // Calculate stats from logs
    const sentMessages = logs.filter(l => l.status === 'sent').length;
    const failedMessages = logs.filter(l => l.status === 'failed').length;
    const totalMessages = logs.length;
    
    // Calculate daily averages (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = logs.filter(l => new Date(l.timestamp) >= sevenDaysAgo);
    const avgDailyMessages = Math.round(recentLogs.length / 7);
    
    // Calculate weekly trend data
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayLogs = logs.filter(l => {
        const logDate = new Date(l.timestamp);
        return logDate.toDateString() === date.toDateString();
      });
      weeklyData.push({
        day: days[date.getDay()],
        sent: dayLogs.filter(l => l.status === 'sent').length,
        pending: scheduledMeetings, // Static for now
        failed: dayLogs.filter(l => l.status === 'failed').length,
      });
    }
    
    // Calculate hourly data (last 24 hours)
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour += 4) {
      const hourLogs = logs.filter(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getHours() >= hour && logDate.getHours() < hour + 4;
      });
      hourlyData.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        messages: hourLogs.length,
      });
    }
    
    res.json({
      success: true,
      data: {
        stats: {
          total: totalMessages,
          pending: scheduledMeetings,
          sent: sentMessages,
          failed: failedMessages,
        },
        schedulerStatus: {
          running: status.isRunning,
          nextCheck: status.checkInterval,
          lastSync: status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never',
          messagesProcessed: status.messagesSent,
        },
        weeklyData,
        hourlyData,
        avgDailyMessages,
      },
    });
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    const dbPath = path.join(__dirname, '..', 'data', 'whatsapp_automation.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  /**
   * Initialize database tables
   */
  initializeTables() {
    // Meetings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherId TEXT,
        teacherName TEXT NOT NULL,
        teacherPhone TEXT NOT NULL,
        studentId TEXT,
        studentName TEXT NOT NULL,
        studentPhone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        reminderTime INTEGER DEFAULT 120,
        status TEXT DEFAULT 'scheduled',
        reminderSent INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add reminderTime column if it doesn't exist (migration for existing databases)
    try {
      const tableInfo = this.db.prepare("PRAGMA table_info(meetings)").all();
      const hasReminderTime = tableInfo.some(col => col.name === 'reminderTime');
      
      if (!hasReminderTime) {
        console.log('📦 Migrating database: Adding reminderTime column...');
        this.db.exec(`ALTER TABLE meetings ADD COLUMN reminderTime INTEGER DEFAULT 120`);
        console.log('✅ Database migration completed');
      }
    } catch (error) {
      console.log('⚠️ Migration check error (table may not exist yet):', error.message);
    }

    console.log('✅ Database tables initialized');
  }

  /**
   * Add a new meeting
   */
  addMeeting(meeting) {
    const stmt = this.db.prepare(`
      INSERT INTO meetings (
        teacherId, teacherName, teacherPhone,
        studentId, studentName, studentPhone,
        date, time, reminderTime, status, reminderSent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      meeting.teacherId || null,
      meeting.teacherName,
      meeting.teacherPhone,
      meeting.studentId || null,
      meeting.studentName,
      meeting.studentPhone,
      meeting.date,
      meeting.time,
      meeting.reminderTime || 120,
      meeting.status || 'scheduled',
      meeting.reminderSent ? 1 : 0
    );

    return {
      id: result.lastInsertRowid,
      ...meeting,
      reminderTime: meeting.reminderTime || 120,
      reminderSent: meeting.reminderSent || false,
      status: meeting.status || 'scheduled'
    };
  }

  /**
   * Get all meetings
   */
  getAllMeetings() {
    const stmt = this.db.prepare('SELECT * FROM meetings ORDER BY createdAt DESC');
    const meetings = stmt.all();
    
    // Convert reminderSent from 0/1 to boolean
    return meetings.map(m => ({
      ...m,
      reminderSent: Boolean(m.reminderSent)
    }));
  }

  /**
   * Get meeting by ID
   */
  getMeetingById(id) {
    const stmt = this.db.prepare('SELECT * FROM meetings WHERE id = ?');
    const meeting = stmt.get(id);
    
    if (meeting) {
      meeting.reminderSent = Boolean(meeting.reminderSent);
    }
    
    return meeting;
  }

  /**
   * Get pending meetings (not yet reminded)
   */
  getPendingMeetings() {
    const stmt = this.db.prepare(`
      SELECT * FROM meetings 
      WHERE status = 'scheduled' AND reminderSent = 0
      ORDER BY date ASC, time ASC
    `);
    const meetings = stmt.all();
    
    return meetings.map(m => ({
      ...m,
      reminderSent: Boolean(m.reminderSent)
    }));
  }

  /**
   * Update meeting status
   */
  updateMeetingStatus(id, status, reminderSent = null) {
    let stmt;
    
    if (reminderSent !== null) {
      stmt = this.db.prepare(`
        UPDATE meetings 
        SET status = ?, reminderSent = ?, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      stmt.run(status, reminderSent ? 1 : 0, id);
    } else {
      stmt = this.db.prepare(`
        UPDATE meetings 
        SET status = ?, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      stmt.run(status, id);
    }
  }

  /**
   * Delete a meeting
   */
  deleteMeeting(id) {
    const stmt = this.db.prepare('DELETE FROM meetings WHERE id = ?');
    return stmt.run(id);
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM meetings').get().count;
    const scheduled = this.db.prepare('SELECT COUNT(*) as count FROM meetings WHERE status = "scheduled"').get().count;
    const reminded = this.db.prepare('SELECT COUNT(*) as count FROM meetings WHERE status = "reminded"').get().count;
    const completed = this.db.prepare('SELECT COUNT(*) as count FROM meetings WHERE status = "completed"').get().count;

    return {
      total,
      scheduled,
      reminded,
      completed
    };
  }

  /**
   * Clear all meetings (for testing)
   */
  clearAllMeetings() {
    this.db.exec('DELETE FROM meetings');
    console.log('🗑️ All meetings cleared from database');
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

export default new DatabaseService();

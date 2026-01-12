import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    // Use /var/data for persistent storage on Render, fallback to local data dir
    const dataDir = process.env.NODE_ENV === 'production' 
      ? '/var/data' 
      : path.join(__dirname, '..', 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      console.log('📁 Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'whatsapp_automation.db');
    console.log(`💾 Database path: ${dbPath}`);
    
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  /**
   * Initialize database tables
   */
  initializeTables() {
    // Teachers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        message TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Students table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        message TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

  // ============ TEACHERS ============

  /**
   * Add or update teachers (bulk)
   */
  saveTeachers(teachers) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO teachers (id, name, phone, message)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((teachers) => {
      for (const teacher of teachers) {
        stmt.run(teacher.id, teacher.name, teacher.phone, teacher.message || '');
      }
    });

    insertMany(teachers);
    console.log(`✅ Saved ${teachers.length} teacher(s) to database`);
    return teachers.length;
  }

  /**
   * Get all teachers
   */
  getAllTeachers() {
    const stmt = this.db.prepare('SELECT * FROM teachers ORDER BY name');
    return stmt.all();
  }

  /**
   * Clear all teachers
   */
  clearTeachers() {
    this.db.exec('DELETE FROM teachers');
    console.log('🗑️ All teachers cleared from database');
  }

  // ============ STUDENTS ============

  /**
   * Add or update students (bulk)
   */
  saveStudents(students) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO students (id, name, phone, message)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((students) => {
      for (const student of students) {
        stmt.run(student.id, student.name, student.phone, student.message || '');
      }
    });

    insertMany(students);
    console.log(`✅ Saved ${students.length} student(s) to database`);
    return students.length;
  }

  /**
   * Get all students
   */
  getAllStudents() {
    const stmt = this.db.prepare('SELECT * FROM students ORDER BY name');
    return stmt.all();
  }

  /**
   * Clear all students
   */
  clearStudents() {
    this.db.exec('DELETE FROM students');
    console.log('🗑️ All students cleared from database');
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

export default new DatabaseService();

import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import databaseService from '../services/databaseService.js';

const router = express.Router();

// Use memory storage for Vercel compatibility
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload and parse CSV with contacts
router.post('/upload-contacts', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const results = [];
    
    // Create a readable stream from the buffer (memory storage)
    const bufferStream = Readable.from(req.file.buffer.toString());

    console.log('Processing file from memory, size:', req.file.size);

    bufferStream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('error', (err) => {
        console.error('CSV parse error:', err);
        res.status(500).json({ success: false, message: 'Error parsing CSV file' });
      })
      .on('end', () => {
        // Parse CSV data
        const teachers = [];
        const students = [];
        const teachersMap = new Map(); // To track unique teachers by phone

        // Log first row keys for debugging
        if (results.length > 0) {
          console.log('CSV columns found:', Object.keys(results[0]));
        }

        results.forEach((row, index) => {
          // Get column values - try different possible column names
          const keys = Object.keys(row);
          
          // Find teacher columns (flexible matching)
          const teacherNameKey = keys.find(k => k.toLowerCase().includes('teacher') && k.toLowerCase().includes('name'));
          const teacherPhoneKey = keys.find(k => k.toLowerCase().includes('teacher') && k.toLowerCase().includes('phone'));
          const teacherMsgKey = keys.find(k => k.toLowerCase().includes('teacher') && k.toLowerCase().includes('message'));
          
          // Find student columns (flexible matching)
          const studentNameKey = keys.find(k => k.toLowerCase().includes('student') && k.toLowerCase().includes('name'));
          const studentPhoneKey = keys.find(k => k.toLowerCase().includes('student') && k.toLowerCase().includes('phone'));
          const studentMsgKey = keys.find(k => k.toLowerCase().includes('student') && k.toLowerCase().includes('message'));

          // If no specific columns found, try positional (columns 0-2 teacher, 3-5 student)
          const values = Object.values(row);
          
          // Extract teacher data
          const teacherName = teacherNameKey ? row[teacherNameKey] : values[0];
          const teacherPhone = teacherPhoneKey ? row[teacherPhoneKey] : values[1];
          const teacherMsg = teacherMsgKey ? row[teacherMsgKey] : values[2];
          
          // Extract student data
          const studentName = studentNameKey ? row[studentNameKey] : values[3];
          const studentPhone = studentPhoneKey ? row[studentPhoneKey] : values[4];
          const studentMsg = studentMsgKey ? row[studentMsgKey] : values[5];

          if (teacherName && teacherPhone) {
            const phone = String(teacherPhone).trim();
            if (!teachersMap.has(phone)) {
              const teacher = {
                id: `teacher-${Date.now()}-${teachers.length}`,
                name: teacherName.trim(),
                phone: phone,
                message: teacherMsg || 'Hi {teacher}, just a quick reminder about your session today. Could you please confirm?'
              };
              teachers.push(teacher);
              teachersMap.set(phone, teacher);
            }
          }

          // Extract student data
          if (studentName && studentPhone) {
            students.push({
              id: `student-${Date.now()}-${students.length}`,
              name: studentName.trim(),
              phone: String(studentPhone).trim(),
              message: studentMsg || "Hi ma'am, Just a quick reminder about today's class at {date} {time} CST. Looking forward to seeing you in the session!"
            });
          }
        });

        console.log('Parsed teachers:', teachers.length);
        console.log('Parsed students:', students.length);

        // Save to database
        try {
          databaseService.saveTeachers(teachers);
          databaseService.saveStudents(students);
          
          res.json({
            success: true,
            message: 'Contacts uploaded and saved successfully',
            teachersCount: teachers.length,
            studentsCount: students.length
          });
        } catch (dbError) {
          console.error('Database save error:', dbError);
          res.status(500).json({ 
            success: false, 
            message: 'Failed to save contacts to database: ' + dbError.message 
          });
        }
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all teachers
router.get('/teachers', (req, res) => {
  try {
    const teachers = databaseService.getAllTeachers();
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Error getting teachers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all students
router.get('/students', (req, res) => {
  try {
    const students = databaseService.getAllStudents();
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

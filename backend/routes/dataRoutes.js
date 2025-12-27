import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for CSV uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `contacts-${Date.now()}.csv`);
  }
});

const upload = multer({ storage });

// In-memory storage for teachers and students (replace with database in production)
let teachers = [];
let students = [];

// Upload and parse CSV with contacts
router.post('/upload-contacts', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const results = [];
    const filePath = req.file.path;

    console.log('Processing file:', filePath);

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('error', (err) => {
        console.error('CSV parse error:', err);
        res.status(500).json({ success: false, message: 'Error parsing CSV file' });
      })
      .on('end', () => {
        // Parse CSV data
        teachers = [];
        students = [];

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
            const existingTeacher = teachers.find(t => t.name === teacherName);
            if (!existingTeacher) {
              teachers.push({
                id: `teacher-${teachers.length + 1}`,
                name: teacherName.trim(),
                phone: String(teacherPhone).trim(),
                message: teacherMsg || 'Hi {teacher}, just a quick reminder about your session today. Could you please confirm?'
              });
            }
          }

          // Extract student data
          if (studentName && studentPhone) {
            students.push({
              id: `student-${students.length + 1}`,
              name: studentName.trim(),
              phone: String(studentPhone).trim(),
              message: studentMsg || "Hi ma'am, Just a quick reminder about today's class at {date} {time} CST. Looking forward to seeing you in the session!"
            });
          }
        });

        console.log('Parsed teachers:', teachers.length);
        console.log('Parsed students:', students.length);

        // Delete uploaded file after processing
        fs.unlinkSync(filePath);

        res.json({
          success: true,
          message: 'Contacts uploaded successfully',
          teachersCount: teachers.length,
          studentsCount: students.length
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all teachers
router.get('/teachers', (req, res) => {
  res.json({ success: true, teachers });
});

// Get all students
router.get('/students', (req, res) => {
  res.json({ success: true, students });
});

export default router;

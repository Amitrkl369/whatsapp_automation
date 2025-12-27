# WhatsApp Automation - Class Scheduling System

Automated WhatsApp reminder system for managing class sessions between teachers and students.

## Features

- 📅 **Automated Scheduling**: Schedule classes with automatic WhatsApp reminders
- 👨‍🏫 **Teacher Management**: Select from pre-loaded teacher list with integrated phone numbers
- 👨‍🎓 **Student Management**: Select from pre-loaded student list with integrated phone numbers
- ⏰ **Auto-Reminders**: Sends automated messages 5 hours before scheduled classes
- 📊 **Dashboard**: View and manage all scheduled sessions
- 📤 **CSV Import**: Bulk upload teacher and student data

## CSV File Format

Upload a CSV file with the following columns:

```csv
Teacher Name,Teacher Phone,Message to Teacher,Student Name,Student Phone,Message to Student
Nikhil,+14155552671,Custom teacher message,Dikha,+14155552672,Custom student message
Anita,+14155552673,Custom teacher message,Dankita,+14155552674,Custom student message
```

**Required Columns:**
- `Teacher Name` - Name of the teacher
- `Teacher Phone` - WhatsApp phone number (with country code, e.g., +14155552671)
- `Student Name` - Name of the student
- `Student Phone` - WhatsApp phone number (with country code)

**Optional Columns:**
- `Message to Teacher` - Custom message template for teacher (uses default if empty)
- `Message to Student` - Custom message template for student (uses default if empty)

## How to Schedule a Class

1. **Import Contacts**: Go to "Import CSV" and upload your teacher/student data
2. **Select Teacher**: Choose from the dropdown list of teachers
3. **Select Student**: Choose from the dropdown list of students
4. **Select Date & Time**: Pick the class date and time slot
5. **Schedule**: Click "Schedule Class & Send Reminders"

## Automated Messages

### To Teacher (5 hours before class):
```
Hi {Teacher Name}, just a quick reminder about your session today. Could you please confirm?
```

### To Student (5 hours before class):
```
Hi ma'am, Just a quick reminder about today's class at {Date} {Time} CST. Looking forward to seeing you in the session!
```

## Tech Stack

**Backend:**
- Node.js + Express.js
- WhatsApp Cloud API (Meta)
- Google Sheets API
- CSV Parser
- Node-cron (scheduling)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- React Calendar

## Setup

1. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure `.env` file with your credentials

3. Run the application:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## Configuration

Edit `.env` file to configure:
- WhatsApp Cloud API credentials
- Google Sheets API
- Admin authentication
- Scheduler intervals

---

Built with ❤️ by RKL Digital
 

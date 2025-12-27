# 📱 WhatsApp Meeting Reminder System - User Guide

## 🎯 What This System Does

Automatically sends WhatsApp reminder messages to teachers and students **2 minutes before** scheduled meetings.

---

## 🚀 Quick Start

### Step 1: Login
1. Open the web application
2. Login with your admin credentials:
   - **Email**: (provided separately)
   - **Password**: (provided separately)

### Step 2: Upload Your Data

#### CSV File Format Required:
Your CSV file must have exactly **6 columns** in this order:

| Column 1 | Column 2 | Column 3 | Column 4 | Column 5 | Column 6 |
|----------|----------|----------|----------|----------|----------|
| Teacher Name | Teacher Phone | Message to Teacher | Student Name | Student Phone | Message to Student |

#### Example CSV:
```csv
Teacher Name,Teacher Phone,Message to Teacher,Student Name,Student Phone,Message to Student
John Smith,919876543210,Hi {teacher_name} reminder about meeting,Emma Wilson,917654321098,Hi {student_name} class reminder
```

#### Important Phone Number Rules:
- ✅ Include country code (e.g., 91 for India)
- ✅ No spaces, dashes, or special characters
- ✅ Example: `919876543210` (NOT `+91 98765 43210`)

### Step 3: Schedule Meetings

1. Go to **"Scheduler"** page
2. Click **"Schedule New Meeting"**
3. Fill in the form:
   - **Teacher Name**: Select from dropdown
   - **Student Name**: Select from dropdown
   - **Date**: Pick meeting date
   - **Time**: Select time in 24-hour format (e.g., 14:30 for 2:30 PM)
4. Click **"Schedule Meeting"**

✅ **Confirmation**: You'll see "Meeting scheduled successfully! Reminder will be sent 2 minutes before the meeting time."

---

## 📊 Dashboard Overview

The dashboard shows:

- **Total Messages**: All messages processed
- **Pending**: Meetings scheduled but not yet reminded
- **Sent**: Successfully delivered messages
- **Failed**: Messages that couldn't be sent

Charts show:
- Weekly message trends
- Message distribution
- Hourly activity patterns

---

## 📋 Pages Explained

### 🏠 **Dashboard**
- Overview of all statistics
- Real-time charts
- Scheduler status
- Recent meetings table

### 📅 **Scheduler**
- Schedule new meetings
- View all scheduled meetings
- Meeting status (Scheduled/Reminded)
- Auto-refreshes every 10 seconds

### 📨 **Messages**
- View all sent WhatsApp messages
- Filter by status (All/Sent/Failed)
- See message content and timestamps
- Clear logs when needed

### 📋 **Logs**
- Complete system activity log
- Same information as Messages page
- Track all sent reminders

### 📤 **Import CSV**
- Upload CSV files with teacher/student data
- Validate file format
- View upload history

### ⚙️ **Settings**
- Configure system preferences
- Update admin credentials
- Manage WhatsApp API settings

---

## ⏰ How Reminders Work

1. **You schedule a meeting** for 3:00 PM
2. **System calculates** reminder time: 2:58 PM
3. **At 2:58 PM exactly**, system sends:
   - ✉️ Message to **teacher**
   - ✉️ Message to **student**
4. **Status updates** to "Reminded"

### Example Timeline:
```
Meeting Time: 15:00 (3:00 PM)
Reminder Time: 14:58 (2:58 PM)
Messages Sent: 14:58 PM exactly
```

---

## 📱 WhatsApp Message Templates

### Default Messages:

**To Teacher:**
```
Hi {Teacher Name}, just a quick reminder about your session today. 
Could you please confirm?
```

**To Student:**
```
Hi ma'am, Just a quick reminder about today's class at {Date} {Time} CST. 
Looking forward to seeing you in the session!
```

> 💡 **Note**: Template messages can be customized in the CSV upload or in Settings

---

## ✅ Best Practices

### ✨ Scheduling Tips:
- Schedule meetings **at least 5 minutes ahead** for testing
- For production, schedule meetings hours/days in advance
- Check Dashboard regularly to verify status

### 📞 Phone Number Tips:
- Always verify phone numbers before uploading
- Test with one meeting first
- Ensure recipients have WhatsApp installed

### 📊 Monitoring:
- Check **Messages** page after each scheduled meeting
- Green badge = Successfully sent
- Red badge = Failed (check phone number)

---

## 🚨 Troubleshooting

### ❌ "Meeting not showing in list"
- Refresh the page (auto-refresh is every 10 seconds)
- Check if CSV upload was successful
- Verify you're logged in

### ❌ "Message not sent (Failed status)"
**Common reasons:**
1. **Invalid phone number** - Check format (must include country code)
2. **Recipient not on WhatsApp** - Verify they have WhatsApp
3. **WhatsApp API issue** - Contact support

**Solutions:**
- Re-check phone number format
- Test with a known working number
- View Logs for error details

### ❌ "Reminder not sent at scheduled time"
**Check:**
1. Is server running? (Dashboard shows "🟢 Running")
2. Was time set correctly? (Use 24-hour format)
3. Check Logs for any errors

---

## 🕐 Time Format Guide

### ✅ Correct 24-Hour Format:
- `00:00` = Midnight
- `09:00` = 9:00 AM
- `12:00` = Noon (12:00 PM)
- `15:30` = 3:30 PM
- `18:45` = 6:45 PM
- `23:59` = 11:59 PM

### When Scheduling:
Select **Hour** (0-23) and **Minute** (0-59) from dropdowns

---

## 📞 Support & Maintenance

### Daily Tasks:
- ✅ Check Dashboard for any failed messages
- ✅ Upload CSV if you have new teacher/student data
- ✅ Schedule upcoming meetings

### Weekly Tasks:
- ✅ Review Logs for patterns
- ✅ Clear old logs if needed
- ✅ Verify all scheduled meetings were reminded

### Monthly Tasks:
- ✅ Backup important data
- ✅ Review system performance

---

## 🎓 Training Checklist

Make sure you can:
- [ ] Login to the system
- [ ] Upload a CSV file
- [ ] Schedule a test meeting
- [ ] View messages in Messages page
- [ ] Understand Dashboard statistics
- [ ] Troubleshoot failed messages
- [ ] Use 24-hour time format

---

## 📧 Contact Support

If you encounter issues:
1. Check this guide first
2. Check Logs page for error messages
3. Contact technical support with:
   - Screenshot of error
   - Time when issue occurred
   - What you were trying to do

---

## 🔒 Security Notes

- **Never share** your admin login credentials
- **Log out** when finished using the system
- **Keep WhatsApp API tokens** confidential
- **Change password** regularly

---

## ✨ System Features

✅ Automatic 2-minute advance reminders  
✅ Persistent database (meetings saved even if server restarts)  
✅ Real-time dashboard with live updates  
✅ CSV bulk upload support  
✅ Message status tracking  
✅ Failed message retry capability  
✅ 24/7 operation  
✅ Secure authentication  

---

**Last Updated**: December 31, 2025  
**System Version**: 1.0.0

---

🎉 **You're all set!** Start scheduling meetings and the system will handle the rest!

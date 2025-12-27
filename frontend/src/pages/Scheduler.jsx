import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../api/axios';
import Layout from '../components/Layout';

const Scheduler = () => {
  const [form, setForm] = useState({
    teacherId: '',
    studentId: '',
    date: new Date(),
    time: '',
    reminderTime: 120 // Default: 2 hours before
  });
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('schedule');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Fetch teachers, students, and meetings from backend
  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchMeetings();
    
    // Poll for meeting status updates every 10 seconds
    const pollInterval = setInterval(() => {
      fetchMeetings();
    }, 10000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/data/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.log('Failed to fetch teachers');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/data/students');
      setStudents(res.data.students || []);
    } catch (err) {
      console.log('Failed to fetch students');
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/scheduler/meetings');
      setMeetings(res.data.meetings || []);
    } catch (err) {
      console.log('Failed to fetch meetings');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setForm({ ...form, date });
    setSelectedTime(null);
  };

  const handleTimeSlotClick = (time) => {
    setSelectedTime(time);
    setForm({ ...form, time });
    setShowForm(true);
  };

  // Generate time slots with 30-minute intervals
  const generateTimeSlots = () => {
    return [
      '9:00am', '9:30am', '10:00am', '10:30am', '11:00am', '11:30am', '12:00pm', '12:30pm',
      '1:00pm', '1:30pm', '2:00pm', '2:30pm', '3:00pm', '3:30pm', '4:00pm', '4:30pm',
      '5:00pm', '5:30pm', '6:00pm', '6:30pm', '7:00pm', '7:30pm', '8:00pm', '8:30pm',
      '9:00pm', '9:30pm', '10:00pm'
    ];
  };

  // Get unique time slots (no duplicates)
  const timeSlots = generateTimeSlots();

  // Get next 7 days starting from selected date
  const getWeekDays = () => {
    const days = [];
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Check if time slot is booked
  const isTimeSlotBooked = (date, time) => {
    return meetings.some(m => {
      const meetingDate = new Date(m.date);
      return meetingDate.toDateString() === date.toDateString() && m.time === time;
    });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setSuccess('');

    // Validation
    if (!form.teacherId) {
      setError('Please select a teacher');
      return;
    }
    if (!form.studentId) {
      setError('Please select a student');
      return;
    }
    if (!form.time) {
      setError('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const teacher = teachers.find(t => t.id === form.teacherId);
      const student = students.find(s => s.id === form.studentId);
      
      const payload = {
        teacherId: form.teacherId,
        teacherName: teacher.name,
        teacherPhone: teacher.phone,
        studentId: form.studentId,
        studentName: student.name,
        studentPhone: student.phone,
        date: form.date.toISOString().split('T')[0],
        time: form.time,
        reminderTime: form.reminderTime // Send reminder time in minutes
      };
      
      const res = await api.post('/scheduler/meeting', payload);
      setMeetings((prev) => [...prev, res.data.meeting || { ...payload, id: Date.now(), status: 'scheduled' }]);
      
      // Generate dynamic success message
      const reminderTimeText = form.reminderTime >= 60 
        ? `${form.reminderTime / 60} hour${form.reminderTime / 60 > 1 ? 's' : ''}`
        : `${form.reminderTime} minutes`;
      
      setForm({ teacherId: '', studentId: '', date: new Date(), time: '', reminderTime: 120 });
      setSelectedTime(null);
      setSuccess(`Class scheduled successfully! Automated reminders will be sent ${reminderTimeText} before the session.`);
      
      // Refresh meetings to get updated status
      setTimeout(() => {
        fetchMeetings();
      }, 3000);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id) => {
    try {
      await api.delete(`/scheduler/meeting/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      // Remove locally even if API fails
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toDateString();
      return new Date(m.date).toDateString() === today;
    }
    if (filter === 'upcoming') {
      return new Date(m.date) >= new Date();
    }
    if (filter === 'past') {
      return new Date(m.date) < new Date();
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      reminded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[status] || badges.scheduled;
  };

  // Calculate time remaining until meeting
  const getTimeRemaining = (meeting) => {
    const meetingDate = new Date(`${meeting.date} ${meeting.time}`);
    const now = new Date();
    const diff = meetingDate - now;
    
    if (diff < 0) return { text: 'Completed', color: 'text-gray-500' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h`, color: 'text-blue-600' };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, color: 'text-orange-600' };
    if (minutes > 0) return { text: `${minutes} min`, color: 'text-red-600' };
    return { text: 'Starting soon!', color: 'text-red-600 font-bold animate-pulse' };
  };

  // Get display status with icon
  const getDisplayStatus = (meeting) => {
    const status = meeting.status || 'scheduled';
    const icons = {
      scheduled: '📅',
      pending: '⏳',
      reminded: '🔔',
      sent: '✅',
      failed: '❌'
    };
    return { icon: icons[status] || '📅', label: status };
  };

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {form.teacher || '(No title)'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
            <span>🕐</span> 60 min appointments
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'schedule'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            📅 Schedule Appointment
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'meetings'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            📋 All Meetings ({meetings.length})
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3">
            <span className="text-xl">❌</span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'schedule' && (
          <>
            {/* Meeting Details Form - Top Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Schedule Class Session
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    👨‍🏫 Select Teacher
                  </label>
                  <select
                    name="teacherId"
                    value={form.teacherId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none"
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                  {form.teacherId && teachers.find(t => t.id === form.teacherId) && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      📱 {teachers.find(t => t.id === form.teacherId).phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    👨‍🎓 Select Student
                  </label>
                  <select
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  {form.studentId && students.find(s => s.id === form.studentId) && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      📱 {students.find(s => s.id === form.studentId).phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Reminder Time Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⏰ Send Reminder Before
                </label>
                <select
                  name="reminderTime"
                  value={form.reminderTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none"
                  required
                >
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={45}>45 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={120}>2 hours before</option>
                  <option value={180}>3 hours before</option>
                  <option value={300}>5 hours before</option>
                  <option value={360}>6 hours before</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  💡 Automated WhatsApp reminders will be sent to both teacher and student at the selected time
                </p>
              </div>

              {/* Message Preview */}
              {form.teacherId && form.studentId && selectedTime && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📨 Automated Messages Preview:</h3>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Teacher:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Hi {teachers.find(t => t.id === form.teacherId)?.name}, just a quick reminder about your session today. Could you please confirm?
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Student:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Hi ma'am, Just a quick reminder about today's class at {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {selectedTime} CST. Looking forward to seeing you in the session!
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      ⏰ Messages will be sent automatically {
                        form.reminderTime >= 60 
                          ? `${form.reminderTime / 60} hour${form.reminderTime / 60 > 1 ? 's' : ''}`
                          : `${form.reminderTime} minutes`
                      } before the scheduled time
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-6">
              {/* Left Side - Mini Calendar */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    minDate={new Date()}
                    className="!w-full !border-0 !bg-transparent"
                    tileClassName={({ date }) => {
                      const hasmeeting = meetings.some(
                        (m) => new Date(m.date).toDateString() === date.toDateString()
                      );
                      if (date.toDateString() === selectedDate.toDateString()) {
                        return 'selected-date-tile';
                      }
                      return hasmeeting ? 'has-meeting' : '';
                    }}
                  />
                </div>

                {/* Schedule Button - Shows when time slot is selected */}
                {selectedTime && (
                  <div className="mt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !form.teacherId || !form.studentId}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          Schedule Class & Send Reminders
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            {/* Right Side - Time Slots for Selected Date */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select time for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Click on a date from the calendar, then select a time slot or enter custom time
              </p>

              {/* Custom Time Input - 24 Hour Format */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  🕐 Enter custom time (24-hour format)
                </label>
                <div className="flex gap-2 items-center">
                  {/* Hour (0-23) */}
                  <select
                    id="hour-select"
                    className="px-4 py-3 border-2 border-blue-400 dark:border-blue-500 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 outline-none text-lg font-medium"
                    onChange={(e) => {
                      const hour = e.target.value;
                      const minute = document.getElementById('minute-select').value || '00';
                      if (hour) {
                        handleTimeSlotClick(`${hour.padStart(2, '0')}:${minute}`);
                      }
                    }}
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                  
                  <span className="text-2xl font-bold text-gray-400">:</span>
                  
                  {/* Minute (0-59) */}
                  <select
                    id="minute-select"
                    className="px-4 py-3 border-2 border-blue-400 dark:border-blue-500 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-300 outline-none text-lg font-medium"
                    onChange={(e) => {
                      const hour = document.getElementById('hour-select').value;
                      const minute = e.target.value;
                      if (hour && minute) {
                        handleTimeSlotClick(`${hour.padStart(2, '0')}:${minute}`);
                      }
                    }}
                  >
                    <option value="">Min</option>
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                      <option key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 Example: 15:30, 09:00, 23:45, etc. (24-hour format)
                </p>
              </div>

              {/* Time Slots Grid - Only for Selected Date */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Or select from quick slots:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                  {timeSlots.map((time) => {
                    const isSelectedSlot = selectedTime === time;
                    
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeSlotClick(time)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isSelectedSlot
                            ? 'bg-blue-500 text-white shadow-lg transform scale-105 ring-2 ring-blue-300'
                            : 'bg-white dark:bg-gray-700 border-2 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md hover:scale-105'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Time Confirmation */}
              {selectedTime && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    ✅ Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                  </p>
                </div>
              )}
            </div>
          </div>
          </>
        )}

        {activeTab === 'meetings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {['all', 'today', 'upcoming', 'past'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                      filter === f
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              {/* Download Button */}
              {meetings.length > 0 && (
                <button
                  onClick={() => {
                    const headers = ['Teacher Name', 'Teacher Phone', 'Student Name', 'Student Phone', 'Date', 'Time', 'Status'];
                    const csvData = meetings.map(m => [
                      m.teacherName || m.teacher || '',
                      m.teacherPhone || m.phone || '',
                      m.studentName || m.student || '',
                      m.studentPhone || '',
                      m.date,
                      m.time,
                      m.status || 'scheduled'
                    ]);
                    
                    const csvContent = [headers, ...csvData]
                      .map(row => row.map(cell => `"${cell}"`).join(','))
                      .join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `meetings_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                >
                  📥 Download CSV
                </button>
              )}
            </div>

            {/* Meetings Table */}
            {filteredMeetings.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl">📭</span>
                <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">No meetings found</p>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
                >
                  Schedule your first meeting
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time Remaining
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMeetings.map((meeting) => {
                      const timeRemaining = getTimeRemaining(meeting);
                      const displayStatus = getDisplayStatus(meeting);
                      
                      return (
                        <tr key={meeting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">👨‍🏫</span>
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white block">
                                  {meeting.teacherName || meeting.teacher || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  📱 {meeting.teacherPhone || meeting.phone || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">👨‍🎓</span>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block">
                                  {meeting.studentName || meeting.student || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  📱 {meeting.studentPhone || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 dark:text-white font-medium">
                              {new Date(meeting.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{meeting.time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${timeRemaining.color}`}>
                              ⏱️ {timeRemaining.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusBadge(meeting.status || 'scheduled')}`}>
                              {displayStatus.icon} {displayStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteMeeting(meeting.id)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300"
                              title="Delete meeting"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Calendar Styles */}
      <style>{`
        .calendar-container .react-calendar {
          background: transparent;
          border: none;
          font-family: inherit;
        }
        .calendar-container .react-calendar__tile {
          padding: 1em;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }
        .calendar-container .react-calendar__tile:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        .calendar-container .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          color: white;
        }
        .calendar-container .react-calendar__tile.has-meeting {
          position: relative;
        }
        .calendar-container .react-calendar__tile.has-meeting::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
        }
        .calendar-container .react-calendar__navigation button {
          font-size: 1.1em;
          padding: 0.5em;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .calendar-container .react-calendar__navigation button:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        .dark .calendar-container .react-calendar__month-view__days__day {
          color: #e5e7eb;
        }
        .dark .calendar-container .react-calendar__month-view__days__day--neighboringMonth {
          color: #6b7280;
        }
        .dark .calendar-container .react-calendar__navigation button {
          color: #e5e7eb;
        }
      `}</style>
    </Layout>
  );
};

export default Scheduler;

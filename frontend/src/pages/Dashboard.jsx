import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [avgDailyMessages, setAvgDailyMessages] = useState(0);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, meetingsRes] = await Promise.all([
        api.get('/scheduler/dashboard'),
        api.get('/scheduler/meetings'),
      ]);
      
      const data = dashboardRes.data.data;
      setStats(data.stats);
      setSchedulerStatus(data.schedulerStatus);
      setWeeklyData(data.weeklyData);
      setHourlyData(data.hourlyData);
      setAvgDailyMessages(data.avgDailyMessages);
      
      // Get recent meetings (last 5)
      const meetings = meetingsRes.data.meetings || [];
      setRecentMeetings(meetings.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({ total: 0, pending: 0, sent: 0, failed: 0 });
      setSchedulerStatus({ 
        running: false, 
        nextCheck: 'N/A', 
        lastSync: 'Never',
        messagesProcessed: 0 
      });
      setWeeklyData([]);
      setHourlyData([]);
      setAvgDailyMessages(0);
      setRecentMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/sheet/sync');
      await fetchData();
      alert('Sheet synced successfully!');
    } catch (error) {
      alert('Failed to sync sheet: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await api.post('/scheduler/trigger');
      await fetchData();
      alert('Message check triggered successfully!');
    } catch (error) {
      alert('Failed to trigger check: ' + (error.response?.data?.message || error.message));
    } finally {
      setTriggering(false);
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  const pieData = stats ? [
    { name: 'Sent', value: stats.sent || 0 },
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'Failed', value: stats.failed || 0 },
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="loading-spinner h-16 w-16 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const successRate = stats && stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : 0;

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        {/* Header */}
        <div className="flex justify-between items-center animate-slide-in">
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-lg">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
              Advanced Analytics & Overview
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleTrigger}
              disabled={triggering}
              className="btn btn-secondary group relative overflow-hidden"
            >
              <span className={triggering ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
              <span className="ml-2">{triggering ? 'Triggering...' : 'Trigger Check'}</span>
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-primary group relative overflow-hidden"
            >
              <span className={syncing ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
              <span className="ml-2">{syncing ? 'Syncing...' : 'Sync Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 animate-scale-in hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Messages</p>
                <p className="text-5xl font-black text-blue-900 dark:text-blue-100 mt-4 animate-count">{stats?.total || 0}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-3 font-semibold">📊 All time</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-2xl shadow-2xl transform hover:rotate-12 hover:scale-110 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:via-yellow-800/20 dark:to-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Pending</p>
                <p className="text-5xl font-black text-yellow-900 dark:text-yellow-100 mt-4 animate-count">{stats?.pending || 0}</p>
                <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-3 font-semibold">⏳ Awaiting schedule</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 rounded-2xl shadow-2xl transform hover:rotate-12 hover:scale-110 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-green-900/20 dark:via-green-800/20 dark:to-green-900/20 border-l-4 border-green-500 dark:border-green-400 animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Sent</p>
                <p className="text-5xl font-black text-green-900 dark:text-green-100 mt-4 animate-count">{stats?.sent || 0}</p>
                <p className="text-xs text-green-500 dark:text-green-400 mt-3 font-semibold">✅ Successfully delivered</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-2xl shadow-2xl transform hover:rotate-12 hover:scale-110 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-red-900/20 border-l-4 border-red-500 dark:border-red-400 animate-scale-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Failed</p>
                <p className="text-5xl font-black text-red-900 dark:text-red-100 mt-4 animate-count">{stats?.failed || 0}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-3 font-semibold">⚠️ Needs attention</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-400 to-red-600 dark:from-red-500 dark:to-red-700 rounded-2xl shadow-2xl transform hover:rotate-12 hover:scale-110 transition-all duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-2">{successRate}%</p>
              </div>
              <div className="text-5xl">📈</div>
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Avg. Daily Messages</p>
                <p className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mt-2">{avgDailyMessages}</p>
              </div>
              <div className="text-5xl">📅</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Processing Speed</p>
                <p className="text-4xl font-black text-orange-600 dark:text-orange-400 mt-2">98%</p>
              </div>
              <div className="text-5xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend Chart */}
          <div className="card animate-scale-in" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Weekly Message Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="sent" stroke="#10B981" fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                <Area type="monotone" dataKey="pending" stroke="#F59E0B" fillOpacity={1} fill="url(#colorPending)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Pie Chart */}
          <div className="card animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🥧</span>
              Message Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Activity Chart */}
        <div className="card animate-scale-in" style={{ animationDelay: '0.9s' }}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            Hourly Activity Pattern
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="messages" fill="#6366F1" radius={[8, 8, 0, 0]} animationDuration={1000}>
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(99, 102, 241, ${0.4 + (entry.messages / 50) * 0.6})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scheduler Status Card */}
        <div className="card bg-gradient-to-r from-primary-50 via-blue-50 to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 animate-scale-in border-2 border-primary-100 dark:border-primary-900" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              Scheduler Status
            </h2>
            <span className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-xl transform transition-all duration-300 ${schedulerStatus?.running ? 'bg-gradient-to-r from-green-400 to-green-600 text-white animate-pulse scale-105' : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'}`}>
              {schedulerStatus?.running ? '🟢 Running' : '🔴 Stopped'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">⏰ Next Check</p>
              <p className="text-xl font-black text-primary-600 dark:text-primary-400">{schedulerStatus?.nextCheck || 'N/A'}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">🔄 Last Sync</p>
              <p className="text-xl font-black text-secondary-600 dark:text-secondary-400">{schedulerStatus?.lastSync || 'N/A'}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">📨 Messages Processed</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400">{schedulerStatus?.messagesProcessed || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Meetings Section */}
        {recentMeetings.length > 0 && (
          <div className="card animate-scale-in" style={{ animationDelay: '1.1s' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Recent Meetings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentMeetings.map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{meeting.teacherName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{meeting.teacherPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{meeting.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{meeting.studentPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>{new Date(meeting.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{meeting.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'reminded'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {meeting.status === 'reminded' ? '✅ Reminded' : '⏰ Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

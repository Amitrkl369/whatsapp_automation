import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const Messages = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/scheduler/logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await api.delete('/scheduler/logs');
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📨 Message Logs</h1>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            🗑️ Clear Logs
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'sent'
                ? 'bg-green-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            ✅ Sent ({logs.filter(l => l.status === 'sent').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            ❌ Failed ({logs.filter(l => l.status === 'failed').length})
          </button>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-xl mb-2">📭</p>
              <p>No message logs yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(log.status)}`}>
                          {log.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To: </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{log.to}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.message}</p>
                      </div>
                      {log.error && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          Error: {log.error}
                        </div>
                      )}
                      {log.messageId && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Message ID: {log.messageId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;

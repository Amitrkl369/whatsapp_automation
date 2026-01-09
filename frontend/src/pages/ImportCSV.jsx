import { useState } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';

export default function ImportCSV() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please select a valid CSV file' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setMessage({ type: '', text: '' });
      } else {
        setMessage({ type: 'error', text: 'Please drop a valid CSV file' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to contacts endpoint for teacher/student data
      // Don't set Content-Type manually - axios will set it with proper boundary
      const response = await axios.post('/data/upload-contacts', formData);

      setMessage({
        type: 'success',
        text: `✅ Contacts uploaded successfully! ${response.data.teachersCount} teachers and ${response.data.studentsCount} students loaded.`,
      });
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to upload contacts. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/csv/template', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'whatsapp_messages_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to download template' 
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Import Teacher & Student Contacts</h1>

        {/* Info Box */}
        <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">📋 CSV Format Requirements</h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• <strong>Column 1:</strong> Teacher Name</li>
            <li>• <strong>Column 2:</strong> Teacher Phone (with country code, e.g., 919876543210)</li>
            <li>• <strong>Column 3:</strong> Message to Teacher</li>
            <li>• <strong>Column 4:</strong> Student Name</li>
            <li>• <strong>Column 5:</strong> Student Phone (with country code)</li>
            <li>• <strong>Column 6:</strong> Message to Student</li>
          </ul>
        </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Upload Area */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="space-y-4">
            <div className="text-6xl">📄</div>
            
            {file ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  ✓ {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Drag & drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse
                </p>
              </div>
            )}

            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label
              htmlFor="csvFileInput"
              className="inline-block px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg cursor-pointer transition-colors"
            >
              Browse Files
            </label>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload and Import'}
          </button>

          {file && (
            <button
              onClick={() => {
                setFile(null);
                setMessage({ type: '', text: '' });
                const fileInput = document.getElementById('csvFileInput');
                if (fileInput) fileInput.value = '';
              }}
              className="btn-secondary"
            >
              ✖ Clear
            </button>
          )}
        </div>
      </div>

      {/* Example Section */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Example CSV Content</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
          <pre className="text-xs font-mono text-gray-900 dark:text-gray-100">
{`Teacher Name,Teacher Phone,Message to Teacher,Student Name,Student Phone,Message to Student
Mrs. Sharma,919876543210,Hi ma'am reminder for your class,Rahul Kumar,919876543211,Hi reminder for your session
Mr. Patel,919876543212,Class reminder for today,Priya Singh,919876543213,Your class is scheduled
Ms. Gupta,919876543214,Reminder about the scheduled class,Amit Verma,919876543215,Looking forward to your session`}
          </pre>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• After uploading, teachers and students will appear in the Scheduler dropdowns</li>
          <li>• The system will automatically send reminders 5 hours before scheduled class</li>
          <li>• Phone numbers must include country code (e.g., 91 for India)</li>
          <li>• Each row creates one teacher-student pair for scheduling</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
      </div>
    </Layout>
  );
}

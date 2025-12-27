import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from '../components/Layout';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('google-sheets');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testing, setTesting] = useState(false);

  // Google Sheets form
  const [googleSheets, setGoogleSheets] = useState({
    sheetId: '',
    clientEmail: '',
    privateKey: ''
  });

  // WhatsApp form
  const [whatsApp, setWhatsApp] = useState({
    apiToken: '',
    phoneNumberId: '',
    businessAccountId: ''
  });

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/settings');
      const settings = response.data.settings;
      
      setGoogleSheets({
        sheetId: settings.GOOGLE_SHEET_ID || '',
        clientEmail: settings.GOOGLE_SHEETS_CLIENT_EMAIL || '',
        privateKey: settings.GOOGLE_SHEETS_PRIVATE_KEY === '***configured***' ? '' : settings.GOOGLE_SHEETS_PRIVATE_KEY || ''
      });

      setWhatsApp({
        apiToken: settings.WHATSAPP_API_TOKEN === '***configured***' ? '' : settings.WHATSAPP_API_TOKEN || '',
        phoneNumberId: settings.WHATSAPP_PHONE_NUMBER_ID || '',
        businessAccountId: settings.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleGoogleSheetsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/settings/google-sheets', googleSheets);
      setMessage({ type: 'success', text: response.data.message });
      
      // Clear private key field after successful save
      setGoogleSheets(prev => ({ ...prev, privateKey: '' }));
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/settings/whatsapp', whatsApp);
      setMessage({ type: 'success', text: response.data.message });
      
      // Clear token field after successful save
      setWhatsApp(prev => ({ ...prev, apiToken: '' }));
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const testGoogleSheetsConnection = async () => {
    setTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.get('/settings/test-google-sheets');
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Connection test failed' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-5xl font-bold gradient-text mb-3">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">⚙️ Configure your integrations</p>

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-0.5 flex space-x-4">
            <button
              onClick={() => setActiveTab('google-sheets')}
              className={`py-4 px-6 border-b-4 font-bold text-base transition-all duration-300 ${
                activeTab === 'google-sheets'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 scale-105'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-xl mr-2">📊</span>
              Google Sheets
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-4 px-6 border-b-4 font-bold text-base transition-all duration-300 ${
                activeTab === 'whatsapp'
                  ? 'border-secondary-500 text-secondary-600 dark:text-secondary-400 scale-105'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-xl mr-2">💬</span>
              WhatsApp
            </button>
          </nav>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-8 p-5 rounded-xl font-semibold shadow-lg animate-scale-in border-2 ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' 
              : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Google Sheets Tab */}
        {activeTab === 'google-sheets' && (
          <div className="card animate-scale-in">
            <h2 className="text-3xl font-bold gradient-text mb-6">Google Sheets Configuration</h2>
            
            <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border-2 border-primary-100 dark:border-primary-800">
              <h3 className="font-bold text-primary-900 dark:text-primary-300 mb-4 text-lg flex items-center gap-2">
                <span className="text-2xl">📖</span>
                How to get credentials:
              </h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-primary-800 dark:text-primary-300 font-medium">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-primary-600 dark:hover:text-primary-400">Google Cloud Console</a></li>
                <li>Create a new project or select existing one</li>
                <li>Enable "Google Sheets API"</li>
                <li>Create Service Account (IAM & Admin → Service Accounts)</li>
                <li>Generate JSON key for the service account</li>
                <li>Copy the email and private key from the JSON file</li>
                <li>Share your Google Sheet with the service account email</li>
              </ol>
            </div>

            <form onSubmit={handleGoogleSheetsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  📄 Google Sheet ID *
                </label>
                <input
                  type="text"
                  value={googleSheets.sheetId}
                  onChange={(e) => setGoogleSheets({ ...googleSheets, sheetId: e.target.value })}
                  placeholder="your_google_sheet_id"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Found in your sheet URL: https://docs.google.com/spreadsheets/d/<strong className="text-primary-600 dark:text-primary-400">[YOUR_SHEET_ID]</strong>/edit
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  📧 Service Account Email *
                </label>
                <input
                  type="email"
                  value={googleSheets.clientEmail}
                  onChange={(e) => setGoogleSheets({ ...googleSheets, clientEmail: e.target.value })}
                  placeholder="your-service-account@project.iam.gserviceaccount.com"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  From your service account JSON file (<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">client_email</code> field)
                </p>
              </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                🔑 Private Key *
              </label>
              <textarea
                value={googleSheets.privateKey}
                onChange={(e) => setGoogleSheets({ ...googleSheets, privateKey: e.target.value })}
                placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key here&#10;-----END PRIVATE KEY-----"
                className="input font-mono text-xs"
                rows="8"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                From your service account JSON file (<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">private_key</code> field). Include the full key with BEGIN/END markers.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-spinner w-5 h-5"></div>
                    Saving...
                  </span>
                ) : (
                  <span>💾 Save Configuration</span>
                )}
              </button>

              <button
                type="button"
                onClick={testGoogleSheetsConnection}
                disabled={testing || !googleSheets.sheetId}
                className="btn btn-secondary"
              >
                {testing ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-spinner w-5 h-5"></div>
                    Testing...
                  </span>
                ) : (
                  <span>🔍 Test Connection</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Tab */}
      {activeTab === 'whatsapp' && (
        <div className="card animate-scale-in">
          <h2 className="text-3xl font-bold gradient-text mb-6">WhatsApp Cloud API Configuration</h2>
          
          <div className="mb-8 p-6 bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/20 dark:to-purple-900/20 rounded-xl border-2 border-secondary-100 dark:border-secondary-800">
            <h3 className="font-bold text-secondary-900 dark:text-secondary-300 mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl">📖</span>
              How to get credentials:
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-secondary-800 dark:text-secondary-300 font-medium">
              <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-secondary-600 dark:hover:text-secondary-400">Meta for Developers</a></li>
              <li>Create a new app or select existing one</li>
              <li>Add "WhatsApp" product to your app</li>
              <li>Go to WhatsApp → Getting Started</li>
              <li>Copy your Phone Number ID</li>
              <li>Generate an Access Token</li>
              <li>Test by sending a message through their interface</li>
            </ol>
          </div>

          <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                🔐 Access Token *
              </label>
              <input
                type="text"
                value={whatsApp.apiToken}
                onChange={(e) => setWhatsApp({ ...whatsApp, apiToken: e.target.value })}
                placeholder="Enter your WhatsApp Cloud API access token"
                className="input font-mono"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Get from Meta for Developers dashboard → WhatsApp → Getting Started
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                📱 Phone Number ID *
              </label>
              <input
                type="text"
                value={whatsApp.phoneNumberId}
                onChange={(e) => setWhatsApp({ ...whatsApp, phoneNumberId: e.target.value })}
                placeholder="Enter your phone number ID"
                className="input"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Found in WhatsApp → API Setup → Phone Number ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                🏢 Business Account ID (Optional)
              </label>
              <input
                type="text"
                value={whatsApp.businessAccountId}
                onChange={(e) => setWhatsApp({ ...whatsApp, businessAccountId: e.target.value })}
                placeholder="Enter your business account ID (optional)"
                className="input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Found in your app settings
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="loading-spinner w-5 h-5"></div>
                    Saving...
                  </span>
                ) : (
                  <span>💾 Save Configuration</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-10 p-6 glass rounded-2xl border-2 border-gray-200 dark:border-gray-700 animate-fade-in">
        <h3 className="font-bold text-lg mb-4 gradient-text flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Need Help?
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            After saving, the server may need to be restarted
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            Make sure to share your Google Sheet with the service account email
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            Test the connection after saving to verify everything works
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500">•</span>
            Keep your credentials secure and never share them publicly
          </li>
        </ul>
      </div>
    </div>
    </Layout>
  );
}

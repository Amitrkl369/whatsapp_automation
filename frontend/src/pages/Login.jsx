import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 transition-colors duration-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-gray-800/70 backdrop-blur-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-xl z-10"
        title="Switch to Light Mode"
      >
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      {/* Login Card */}
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-scale-in border border-gray-700">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl mb-4 shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-3 animate-float">
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
            WhatsApp Automation
          </h1>
          <p className="text-gray-400 font-medium">
            🔐 Admin Access Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-400 px-5 py-4 rounded-xl text-sm font-medium border-2 border-red-800 animate-scale-in shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-500 bg-gray-700 text-gray-100 placeholder-gray-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-gray-500 bg-gray-700 text-gray-100 placeholder-gray-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-5 h-5"></div>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Login to Dashboard
              </span>
            )}
          </button>
        </form>

        {/* Default Credentials Info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl border-2 border-gray-600">
          <p className="text-sm font-semibold text-gray-300 mb-2">
            💡 Default Credentials (for testing):
          </p>
          <div className="space-y-1 text-xs text-gray-400 font-mono">
            <p>📧 Email: <span className="text-primary-400 font-semibold">admin@example.com</span></p>
            <p>🔑 Password: <span className="text-secondary-400 font-semibold">your_secure_password</span></p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500 animate-fade-in">
          © 2025 RKL Digital • Powered by WhatsApp Cloud API
        </p>
      </div>
    </div>
  );
};

export default Login;

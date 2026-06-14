import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const getBaseUrl = () => {
  return process.env.REACT_APP_API_URL?.replace('/api', '') || window.location.origin;
};

const ForgotPassword = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetUrl, setResetUrl] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResetUrl('');
    try {
      const res = await authAPI.forgotPassword(email);
      setMessage({ type: 'success', text: res.data.message });
      const url = res.data.data.resetUrl;
      const baseUrl = getBaseUrl();
      const token = url.split('/').pop();
      setResetUrl(`${baseUrl}/reset-password/${token}`);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to process request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">URUJENI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Reset your password</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Forgot Password</h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {resetUrl && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm break-all">
              <p className="font-medium mb-1">Reset Link:</p>
              <a href={resetUrl} className="underline">{resetUrl}</a>
              <p className="mt-2 text-xs">Click the link above or copy it to reset your password.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
              <FiArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

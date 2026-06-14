import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { FiUserPlus, FiShield, FiMail, FiUser, FiLock } from 'react-icons/fi';

const UserManagement = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendance_manager', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authAPI.adminCreateUser(form);
      setMessage({ type: 'success', text: `User "${form.name}" created successfully as ${form.role}` });
      setForm({ name: '', email: '', password: '', role: 'attendance_manager', phone: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-field";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Create new user accounts</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" name="name" className="input-field pl-10" value={form.name} onChange={handleChange} placeholder="Full name" required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="email" name="email" className="input-field pl-10" value={form.email} onChange={handleChange} placeholder="Email address" required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" name="phone" className={inputClass} value={form.phone} onChange={handleChange} placeholder="+250..." />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="password" name="password" className="input-field pl-10" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Role</label>
          <div className="relative">
            <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select name="role" className="input-field pl-10" value={form.role} onChange={handleChange}>
                <option value="attendance_manager">Attendance Manager</option>
                <option value="admin">Admin</option>
              </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          <FiUserPlus size={18} /> {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default UserManagement;

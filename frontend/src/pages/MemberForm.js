import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { membersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const provinces = ['Kigali', 'Eastern', 'Northern', 'Western', 'Southern'];

const memberRoles = ['dancer', 'drummer', 'singer'];

const initialForm = {
  fullName: '', gender: 'male', dateOfBirth: '', phoneNumber: '',
  emailAddress: '', nationalId: '', province: '', district: '',
  sector: '', cell: '', village: '', role: 'dancer', status: 'active'
};

const MemberForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  const canManage = user && (user.role === 'admin' || user.role === 'attendance_manager');

  useEffect(() => {
    if (isEdit) {
      const fetchMember = async () => {
        try {
          const res = await membersAPI.getById(id);
          const m = res.data.data;
          setForm({
            fullName: m.fullName || '',
            gender: m.gender || 'male',
            dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split('T')[0] : '',
            phoneNumber: m.phoneNumber || '',
            emailAddress: m.emailAddress || '',
            nationalId: m.nationalId || '',
            province: m.province || '',
            district: m.district || '',
            sector: m.sector || '',
            cell: m.cell || '',
            village: m.village || '',
            role: m.role || 'dancer',
            status: m.status || 'active'
          });
        } catch {
          setError('Failed to load member');
        } finally {
          setFetching(false);
        }
      };
      fetchMember();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await membersAPI.update(id, form);
      } else {
        await membersAPI.create(form);
      }
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-600 dark:text-red-400 font-medium">You don't have permission to manage members.</p>
        <button onClick={() => navigate('/members')} className="btn-secondary mt-4">Back to Members</button>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const inputClass = "input-field";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Member' : 'Register New Member'}</h1>
        <p className="text-gray-500 dark:text-gray-400">{isEdit ? 'Update member information' : 'Add a new member to the troupe'}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Name *</label>
            <input type="text" name="fullName" className={inputClass} value={form.fullName} onChange={handleChange} required />
          </div>

          <div>
            <label className={labelClass}>Gender *</label>
            <select name="gender" className={inputClass} value={form.gender} onChange={handleChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Role *</label>
            <select name="role" className={inputClass} value={form.role} onChange={handleChange} required>
              {memberRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input type="date" name="dateOfBirth" className={inputClass} value={form.dateOfBirth} onChange={handleChange} required />
          </div>

          <div>
            <label className={labelClass}>Phone Number *</label>
            <input type="tel" name="phoneNumber" className={inputClass} value={form.phoneNumber} onChange={handleChange} required placeholder="+250..." />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" name="emailAddress" className={inputClass} value={form.emailAddress} onChange={handleChange} placeholder="email@example.com" />
          </div>

          <div>
            <label className={labelClass}>National ID</label>
            <input type="text" name="nationalId" className={inputClass} value={form.nationalId} onChange={handleChange} />
          </div>

          <div>
            <label className={labelClass}>Province *</label>
            <select name="province" className={inputClass} value={form.province} onChange={handleChange} required>
              <option value="">Select Province</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>District *</label>
            <input type="text" name="district" className={inputClass} value={form.district} onChange={handleChange} required placeholder="District name" />
          </div>

          <div>
            <label className={labelClass}>Sector *</label>
            <input type="text" name="sector" className={inputClass} value={form.sector} onChange={handleChange} required placeholder="Sector name" />
          </div>

          <div>
            <label className={labelClass}>Cell *</label>
            <input type="text" name="cell" className={inputClass} value={form.cell} onChange={handleChange} required placeholder="Cell name" />
          </div>

          <div>
            <label className={labelClass}>Village *</label>
            <input type="text" name="village" className={inputClass} value={form.village} onChange={handleChange} required placeholder="Village name" />
          </div>

          {isEdit && (
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" className={inputClass} value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Register Member'}
          </button>
          <button type="button" onClick={() => navigate('/members')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;

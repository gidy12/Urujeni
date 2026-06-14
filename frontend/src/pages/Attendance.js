import React, { useState, useEffect, useCallback } from 'react';
import { attendanceAPI, membersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusColor } from '../utils/helpers';
import { FiCalendar, FiCheck, FiX, FiClock, FiAlertCircle, FiSave, FiSearch } from 'react-icons/fi';

const Attendance = () => {
  const { user } = useAuth();
  const canManage = user && (user.role === 'admin' || user.role === 'attendance_manager');
  const [activeTab, setActiveTab] = useState('mark');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Record and view daily attendance</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {canManage && (
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'mark' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Mark Attendance
          </button>
        )}
        <button
          onClick={() => setActiveTab('view')}
          className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'view' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          View Attendance
        </button>
      </div>

      {activeTab === 'mark' && canManage && <MarkAttendance />}
      {activeTab === 'view' && <ViewAttendance />}
    </div>
  );
};

const MarkAttendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectAll, setSelectAll] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await membersAPI.getAll({ status: 'active', limit: 200 });
        setMembers(res.data.data);

        const statuses = {};
        res.data.data.forEach(m => { statuses[m._id] = 'present'; });
        setAttendance(statuses);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load members' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = (memberId, status) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleSelectAll = (status) => {
    setSelectAll(status);
    const newAttendance = {};
    members.forEach(m => { newAttendance[m._id] = status; });
    setAttendance(newAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const records = Object.entries(attendance).map(([memberId, status]) => ({ memberId, status }));
      const res = await attendanceAPI.mark({ date, records });
      setMessage({ type: 'success', text: `Attendance recorded for ${res.data.data.length} members` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statusIcons = {
    present: <FiCheck size={16} />,
    absent: <FiX size={16} />,
    excused: <FiAlertCircle size={16} />,
    late: <FiClock size={16} />
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => handleSelectAll('present')} className="btn-success text-xs py-1.5 px-2 sm:px-3 flex items-center gap-1"><FiCheck size={14} /> <span className="hidden sm:inline">All Present</span></button>
            <button type="button" onClick={() => handleSelectAll('absent')} className="btn-danger text-xs py-1.5 px-2 sm:px-3 flex items-center gap-1"><FiX size={14} /> <span className="hidden sm:inline">All Absent</span></button>
            <button type="button" onClick={() => handleSelectAll('late')} className="btn-secondary text-xs py-1.5 px-2 sm:px-3 flex items-center gap-1"><FiClock size={14} /> <span className="hidden sm:inline">All Late</span></button>
          </div>
        </div>

        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {members.map(member => (
            <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg gap-2 sm:gap-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-medium shrink-0">
                  {member.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{member.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{member.memberId} - {member.gender}</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-1.5">
                {['present', 'absent', 'excused', 'late'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(member._id, status)}
                    className={`px-1.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-0.5 sm:gap-1 ${
                      attendance[member._id] === status
                        ? status === 'present' ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/50 dark:border-green-600 dark:text-green-300'
                          : status === 'absent' ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300'
                          : status === 'late' ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-300'
                          : 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:border-blue-600 dark:text-blue-300'
                        : 'bg-transparent border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {statusIcons[status]}
                    <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <FiSave size={18} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </form>
  );
};

const ViewAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, excused: 0, late: 0, total: 0 });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getByDate({ date });
      setRecords(res.data.data);
      const s = { present: 0, absent: 0, excused: 0, late: 0, total: res.data.data.length };
      res.data.data.forEach(r => { s[r.status] = (s[r.status] || 0) + 1; });
      setSummary(s);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const statusCounts = [
    { label: 'Present', count: summary.present, color: 'text-green-600' },
    { label: 'Absent', count: summary.absent, color: 'text-red-600' },
    { label: 'Excused', count: summary.excused, color: 'text-blue-600' },
    { label: 'Late', count: summary.late, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            {statusCounts.map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No attendance records for this date</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recorded By</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map(record => (
                  <tr key={record._id} className="flex flex-col md:table-row border-b border-gray-200 dark:border-gray-700 md:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2 md:py-3 flex items-center gap-2 md:table-cell text-sm font-medium">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Member</span>
                      {record.member?.fullName || 'Unknown'}
                    </td>
                    <td className="px-4 py-1 md:py-3 flex items-center gap-2 md:table-cell text-sm text-gray-500">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">ID</span>
                      {record.member?.memberId || '-'}
                    </td>
                    <td className="px-4 py-1 md:py-3 flex items-center gap-2 md:table-cell">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Status</span>
                      <span className={getStatusColor(record.status)}>{record.status}</span>
                    </td>
                    <td className="px-4 py-1 md:py-3 flex items-center gap-2 md:table-cell text-sm">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">By</span>
                      {record.recordedBy?.name || '-'}
                    </td>
                    <td className="px-4 py-2 md:py-3 flex items-center gap-2 md:table-cell text-sm text-gray-500">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Notes</span>
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;

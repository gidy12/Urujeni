import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { formatDateTime } from '../utils/helpers';
import { FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ action: '', entity: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (filters.action) params.action = filters.action;
      if (filters.entity) params.entity = filters.entity;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const clearFilters = () => {
    setFilters({ action: '', entity: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const actionColors = {
    REGISTER: 'badge-info',
    LOGIN: 'badge-success',
    ADMIN_CREATE_USER: 'badge-warning',
    CREATE_MEMBER: 'badge-success',
    UPDATE_MEMBER: 'badge-info',
    DELETE_MEMBER: 'badge-danger',
    MARK_ATTENDANCE: 'badge-info'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-gray-500 dark:text-gray-400">{pagination.total} total entries</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
        >
          <FiFilter size={18} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="card flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Action</label>
            <select className="input-field" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
              <option value="">All</option>
              <option value="REGISTER">Register</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_MEMBER">Create Member</option>
              <option value="UPDATE_MEMBER">Update Member</option>
              <option value="DELETE_MEMBER">Delete Member</option>
              <option value="MARK_ATTENDANCE">Mark Attendance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entity</label>
            <select className="input-field" value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value })}>
              <option value="">All</option>
              <option value="User">User</option>
              <option value="Member">Member</option>
              <option value="Attendance">Attendance</option>
            </select>
          </div>
          <button onClick={clearFilters} className="btn-secondary flex items-center gap-1 text-sm"><FiX size={14} /> Clear</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Details</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{log.user?.name || 'System'}</p>
                      <p className="text-xs text-gray-400">{log.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={actionColors[log.action] || 'badge-info'}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.entity}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                      {JSON.stringify(log.details?.body || log.details || {})}
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page <= 1} className="btn-secondary p-1.5 disabled:opacity-50">
                <FiChevronLeft size={16} />
              </button>
              <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.pages} className="btn-secondary p-1.5 disabled:opacity-50">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import { formatDate, getStatusColor, getInitials } from '../utils/helpers';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', gender: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const canManage = user && (user.role === 'admin' || user.role === 'attendance_manager');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 15, search };
      if (filters.status) params.status = filters.status;
      if (filters.gender) params.gender = filters.gender;
      const res = await membersAPI.getAll(params);
      setMembers(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, filters]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete member "${name}"?`)) return;
    try {
      await membersAPI.delete(id);
      fetchMembers();
    } catch (err) {
      setError('Failed to delete member');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMembers();
  };

  const clearFilters = () => {
    setFilters({ status: '', gender: '' });
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-gray-500 dark:text-gray-400">{pagination.total} total members</p>
        </div>
        {canManage && (
          <Link to="/members/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <FiPlus size={18} /> Add Member
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name, ID, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
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
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              className="input-field"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Gender</label>
            <select
              className="input-field"
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <button onClick={clearFilters} className="btn-secondary flex items-center gap-1 text-sm">
            <FiX size={14} /> Clear
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No members found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gender</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                  {canManage && <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <tr key={member._id} className="flex flex-col md:table-row border-b border-gray-200 dark:border-gray-700 md:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-2 md:py-3 flex items-center gap-3 md:table-cell">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Name</span>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                          {getInitials(member.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.fullName}</p>
                          <p className="text-xs text-gray-400">{member.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell text-sm capitalize">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Role</span>
                      <span className="badge-info">{member.role}</span>
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell text-sm capitalize">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Gender</span>
                      {member.gender}
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell text-sm">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Phone</span>
                      {member.phoneNumber}
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell text-sm">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Location</span>
                      {member.province}, {member.district}
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Status</span>
                      <span className={getStatusColor(member.status)}>{member.status}</span>
                    </td>
                    <td className="px-4 py-1.5 md:py-3 flex items-center gap-2 md:table-cell text-sm">
                      <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Joined</span>
                      {formatDate(member.joiningDate)}
                    </td>
                    {canManage && (
                      <td className="px-4 py-2 md:py-3 flex items-center gap-2 md:table-cell md:text-right">
                        <span className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-20 shrink-0">Actions</span>
                        <div className="flex items-center gap-1">
                          <Link to={`/members/edit/${member._id}`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-primary-600">
                            <FiEdit2 size={16} />
                          </Link>
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDelete(member._id, member.fullName)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-600">
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="btn-secondary p-1.5 disabled:opacity-50"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="btn-secondary p-1.5 disabled:opacity-50"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

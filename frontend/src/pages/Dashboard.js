import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import AttendanceChart from '../components/AttendanceChart';
import { FiUsers, FiUserCheck, FiUserPlus, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import { formatDateTime } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="card text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Overview of URUJENI Culture Troupe</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Members" value={stats?.totalMembers || 0} icon={FiUsers} color="primary" />
        <StatsCard title="Male Members" value={stats?.maleMembers || 0} icon={FiUserCheck} color="blue" />
        <StatsCard title="Female Members" value={stats?.femaleMembers || 0} icon={FiUserPlus} color="green" />
        <StatsCard title="Present Today" value={stats?.presentToday || 0} icon={FiCheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Absent Today" value={stats?.absentToday || 0} icon={FiXCircle} color="red" />
        <StatsCard title="Excused Today" value={stats?.excusedToday || 0} icon={FiCalendar} color="yellow" />
        <StatsCard title="Late Today" value={stats?.lateToday || 0} icon={FiCalendar} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart data={stats?.attendanceTrend || []} title="7-Day Attendance Trend" />
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Location Overview</h3>
            <div className="space-y-2">
              {(stats?.locationOverview || []).map((loc) => (
                <div key={loc._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{loc._id}</span>
                  <span className="font-medium">{loc.count}</span>
                </div>
              ))}
              {(!stats?.locationOverview || stats.locationOverview.length === 0) && (
                <p className="text-sm text-gray-400">No location data</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {(stats?.recentAttendance || []).slice(0, 5).map((record) => (
                <div key={record._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{record.member?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(record.createdAt)}</p>
                  </div>
                  <span className={`badge ${
                    record.status === 'present' ? 'badge-success' :
                    record.status === 'absent' ? 'badge-danger' :
                    record.status === 'late' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
              {(!stats?.recentAttendance || stats.recentAttendance.length === 0) && (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
